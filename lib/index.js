/**
 * Task Hub（跨对话收件箱）Node 半侧。
 *
 * 宿主进程内常驻的完成检测器：todo 投影是瞬态的（下一轮开始即清空），浏览器轮询
 * 又受"页面可见性"限制会错过迁移窗口，因此由本半侧每 5 秒读取投影缓存
 * （~/.dsh/storages/session_projcache/sessions/*.json，随会话实时更新），在
 * "非全完成 → 全完成"迁移瞬间把事件写入持久存储
 * （~/.dsh/storages/task-hub/events.json），浏览器半侧经鉴权 /api/file 通道读取。
 *
 * 纯函数（detectTransitions / todoState / loadStore / saveStore / readCacheRows）
 * 导出供无头回归测试使用；apply(ctx) 只负责装载定时器。
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import zlib from "node:zlib";

const CACHE_DIR = path.join(os.homedir(), ".dsh", "storages", "session_projcache", "sessions");
const SESSIONS_DIR = path.join(os.homedir(), ".dsh", "sessions");
const STORE_DIR = path.join(os.homedir(), ".dsh", "storages", "task-hub");
const STORE_FILE = path.join(STORE_DIR, "events.json");
const CONTEXTS_FILE = path.join(STORE_DIR, "contexts.json");
const PRUNE_AGE_MS = 30 * 86400000;
const MAX_TURN_TEXT = 50000;

/** todo 清单状态指纹：null（无清单/已清空）或 {hash, allDone, total}。 */
export function todoState(todos) {
	if (!Array.isArray(todos) || todos.length === 0) return null;
	return {
		hash: todos.map((t) => (t && t.content ? t.content + ":" + t.status : "?")).join("|"),
		allDone: todos.every((t) => t && t.status === "completed"),
		total: todos.length,
	};
}

/**
 * 检测完成类状态迁移并修改 state（{events, lastTodos, lastGoal}）。
 * 首次观察只建立基线，不回放历史。返回是否发生了变化。
 */
export function detectTransitions(rows, state, now = Date.now()) {
	for (const row of rows ?? []) {
		if (!row || typeof row.sessionId !== "string" || row.sessionId === "") continue;
		const values = row.projections?.values ?? {};
		const title = (typeof values.title === "string" && values.title) || "未命名会话";
		const cwd = typeof values.workingDirectory === "string" ? values.workingDirectory : (typeof row.cwd === "string" ? row.cwd : "");

		// 回合结束检测：sessionStats.turns 增加 = 该会话完成了一轮（智能体已回复完毕）
		const stats = values.sessionStats;
		const turnsNow = stats && typeof stats.turns === "number" ? stats.turns : null;
		if (turnsNow !== null) {
			if (!state.lastTurns) state.lastTurns = {};
			const prevTurns = state.lastTurns[sid0(row)];
			if (prevTurns === undefined) {
				state.lastTurns[sid0(row)] = { turns: turnsNow, at: now };
				state.__changed = true;
			} else if (turnsNow > prevTurns.turns) {
				state.lastTurns[sid0(row)] = { turns: turnsNow, at: now };
				state.__changed = true;
				// 取最新一轮的摘要作为通知内容
				const outline = values.turnOutline && Array.isArray(values.turnOutline.turns) ? values.turnOutline.turns : [];
				const last = outline.length > 0 ? outline[outline.length - 1] : null;
				const id = sid0(row) + "/turn-end/" + turnsNow;
				if (!state.events[id]) {
					state.events[id] = {
						kind: "turn-end",
						sessionId: sid0(row),
						title,
						cwd,
						time: now,
						turn: turnsNow,
						prompt: last && typeof last.prompt === "string" ? last.prompt.slice(0, 200) : "",
						response: last && typeof last.response === "string" ? last.response.slice(0, 300) : "",
					};
				}
			}
		}

		const st = todoState(values.todos);
		const prevTodos = state.lastTodos[sid0(row)];
		if (st) {
			if (!prevTodos) {
				state.lastTodos[sid0(row)] = { hash: st.hash, allDone: st.allDone, at: now };
				state.__changed = true;
			} else {
				const alreadyKnown = prevTodos.hash === st.hash && prevTodos.allDone;
				state.lastTodos[sid0(row)] = { hash: st.hash, allDone: st.allDone, at: now };
				if (st.allDone && !alreadyKnown) {
					const id = sid0(row) + "/todos-done/" + now;
					if (!state.events[id]) {
						state.events[id] = { kind: "todos-done", sessionId: sid0(row), title, cwd, time: now, total: st.total, todos: values.todos };
						state.__changed = true;
					}
				}
			}
		}

		const goal = values.goal && values.goal.goal;
		const prevGoal = state.lastGoal[sid0(row)];
		if (goal) {
			if (!prevGoal) {
				state.lastGoal[sid0(row)] = { phase: goal.phase, revision: goal.revision, at: now };
				state.__changed = true;
			} else {
				const alreadyComplete = prevGoal.phase === "complete" && goal.phase === "complete";
				state.lastGoal[sid0(row)] = { phase: goal.phase, revision: goal.revision, at: now };
				if (goal.phase === "complete" && !alreadyComplete) {
					const id = sid0(row) + "/goal-done/" + goal.id + "/" + now;
					if (!state.events[id]) {
						state.events[id] = { kind: "goal-done", sessionId: sid0(row), title, cwd, time: now, objective: typeof goal.objective === "string" ? goal.objective : "" };
						state.__changed = true;
					}
				}
			}
		}
	}
	const changed = state.__changed === true;
	delete state.__changed;
	return changed;
}

function sid0(row) { return row.sessionId; }

/**
 * 从缓存行提取每个会话的最近轮次摘要（供浏览器侧边栏/收件箱上下文展示）。
 * turnOutline 由 dsh-session-turn-outline 投影维护，缓存文件随会话实时更新。
 */
export function buildContexts(rows) {
	const contexts = {};
	for (const row of rows ?? []) {
		if (!row || typeof row.sessionId !== "string" || row.sessionId === "") continue;
		const values = row.projections?.values ?? {};
		const outline = values.turnOutline && Array.isArray(values.turnOutline.turns) ? values.turnOutline.turns : [];
		if (outline.length === 0) continue;
		const title = (typeof values.title === "string" && values.title) || "未命名会话";
		const cwd = typeof values.workingDirectory === "string" ? values.workingDirectory : (typeof row.cwd === "string" ? row.cwd : "");
		contexts[row.sessionId] = {
			title,
			cwd,
			// 正序（最早在上，最新在下）；内容尽量完整，仅在超长时兜底截断
			turns: outline.slice(-5).map((tn) => ({
				turn: tn.turn,
				prompt: capText(typeof tn.prompt === "string" ? tn.prompt : "", 20000),
				response: capText(typeof tn.response === "string" ? tn.response : "", 20000),
			})),
		};
	}
	return contexts;
}

function capText(text, max) {
	if (text.length <= max) return text;
	return text.slice(0, max) + "\n…（超长内容已截断）";
}

/**
 * 从会话日志源文件（session.v4.jsonl.zstd，多帧 zstd 压缩的 JSONL）
 * 重建完整的逐轮对话（user 提问全文 + assistant 回复全文，不含 reasoning）。
 */
export function readSessionTurns(sessionDir, sessionId) {
	// sessionId 形如 session-95765c13-...（与目录名一致），不做二次前缀
	const logPath = path.join(sessionDir, sessionId, "session.v4.jsonl.zstd");
	let buf;
	try { buf = fs.readFileSync(logPath); } catch { return null; }
	let allText = "";
	try {
		// 单帧快速路径：只有当解出多条事件行时才采用
		let single = "";
		try { single = zlib.zstdDecompressSync(buf).toString("utf8"); } catch { /* 多帧文件 */ }
		const singleLines = single.split("\n").filter((l) => l.trim()).length;
		if (singleLines > 5) {
			allText = single;
		} else {
			// 多帧：扫描 zstd magic（28 B5 2F FD）逐帧解压
			let offsets = [];
			for (let i = 0; i <= buf.length - 4; i++) {
				if (buf[i] === 0x28 && buf[i + 1] === 0xB5 && buf[i + 2] === 0x2F && buf[i + 3] === 0xFD) offsets.push(i);
			}
			for (let f = 0; f < offsets.length; f++) {
				const start = offsets[f];
				const end = f + 1 < offsets.length ? offsets[f + 1] : buf.length;
				try { allText += zlib.zstdDecompressSync(buf.subarray(start, end)).toString("utf8"); } catch { /* magic 误报帧跳过 */ }
			}
		}
	} catch (e) {
		return null;
	}
	const lines = allText.split("\n").filter((l) => l.trim());
	// turn/start 锚定配对：turn/start → 该轮首条 user 消息为 prompt（轮内后续 user 消息
	// 是 steering，归入 prompt 附注）→ 该轮 assistant 文本聚合为 response → turn/end 收口
	const turnStarts = [];
	const asstByTurn = {};
	let openTurn = null;
	for (const line of lines) {
		let j;
		try { j = JSON.parse(line); } catch { continue; }
		if (j.type === "turn/start" && j.data) {
			if (openTurn) turnStarts.push(openTurn);
			openTurn = { turn: j.data.turn, prompt: null, steering: [] };
		} else if (j.type === "user/message" && j.data && Array.isArray(j.data.content) && openTurn) {
			const texts = j.data.content.filter((c) => c && c.type === "text" && typeof c.text === "string").map((c) => c.text);
			const text = texts.join("\n");
			if (!text) continue;
			const isUserSource = j.data.source ? j.data.source.kind === "user" : true;
			if (!isUserSource) continue; // developer/系统注入消息不算用户提问
			if (openTurn.prompt === null) openTurn.prompt = text;
			else openTurn.steering.push(text);
		} else if (j.type === "assistant/message" && j.data && j.data.message && Array.isArray(j.data.message.content)) {
			const t = j.data.turn;
			const texts = j.data.message.content.filter((c) => c && c.type === "text" && typeof c.text === "string").map((c) => c.text);
			if (texts.length > 0 && Number.isFinite(t)) {
				asstByTurn[t] = (asstByTurn[t] ? asstByTurn[t] + "\n\n" : "") + texts.join("\n");
			}
		} else if (j.type === "turn/end") {
			if (openTurn) { turnStarts.push(openTurn); openTurn = null; }
		}
	}
	if (openTurn) turnStarts.push(openTurn);
	const turns = [];
	for (const t of turnStarts) {
		if (t.prompt === null) continue; // 无用户提问的轮（纯自动轮）不进收件箱上下文
		let response = asstByTurn[t.turn] ?? "";
		if (t.steering.length > 0) {
			response += "\n\n（本轮中途追加了 " + t.steering.length + " 条用户补充）";
		}
		turns.push({
			turn: t.turn,
			prompt: capText(t.prompt, MAX_TURN_TEXT),
			response: capText(response, MAX_TURN_TEXT),
		});
	}
	return { turns, total: turns.length };
}

export function saveContexts(contexts, file = CONTEXTS_FILE) {
	fs.mkdirSync(path.dirname(file), { recursive: true });
	const tmp = file + ".tmp";
	fs.writeFileSync(tmp, JSON.stringify(contexts));
	fs.renameSync(tmp, file);
}

export function loadContexts(file = CONTEXTS_FILE) {
	try {
		return JSON.parse(fs.readFileSync(file, "utf8"));
	} catch {
		return {};
	}
}

/** 读取投影缓存目录，聚合成 computeRows 形状（sessionId + projections.values）。 */
export function readCacheRows(cacheDir = CACHE_DIR) {
	const rows = [];
	let names = [];
	try { names = fs.readdirSync(cacheDir).filter((n) => n.endsWith(".json")); } catch { return rows; }
	for (const name of names) {
		try {
			const raw = fs.readFileSync(path.join(cacheDir, name), "utf8");
			const j = JSON.parse(raw);
			const sessionId = name.replace(/\.json$/, "");
			const record = j?.record ?? {};
			const r = record.rows ?? {};
			const val = (k) => (r[k] && r[k].val !== undefined ? r[k].val : undefined);
			const values = {};
			if (val("title") !== undefined) values.title = val("title");
			if (val("todos") !== undefined) values.todos = val("todos");
			if (val("userQuestions") !== undefined) values.userQuestions = val("userQuestions");
			const goalVal = val("goal");
			if (goalVal && goalVal.current && goalVal.current.goal) values.goal = { goal: goalVal.current.goal };
			if (val("workingDirectory") !== undefined) values.workingDirectory = val("workingDirectory");
			if (val("sessionStats") !== undefined) values.sessionStats = val("sessionStats");
			if (val("turnOutline") !== undefined) values.turnOutline = val("turnOutline");
			const cwd = record.identity && typeof record.identity.cwd === "string" ? record.identity.cwd : undefined;
			if (cwd) values.workingDirectory = values.workingDirectory ?? cwd;
			rows.push({ sessionId, blank: false, updatedAt: Date.now(), cwd, projections: { kind: "cached", values } });
		} catch { /* 单个缓存文件损坏时跳过 */ }
	}
	return rows;
}

export function loadStore(file = STORE_FILE) {
	try {
		const raw = JSON.parse(fs.readFileSync(file, "utf8"));
		const st = {
			events: raw.events ?? {},
			lastTodos: raw.lastTodos ?? {},
			lastGoal: raw.lastGoal ?? {},
			lastTurns: raw.lastTurns ?? {},
		};
		return pruneStore(st);
	} catch {
		return { events: {}, lastTodos: {}, lastGoal: {}, lastTurns: {} };
	}
}

export function saveStore(state, file = STORE_FILE) {
	const clean = { events: state.events ?? {}, lastTodos: state.lastTodos ?? {}, lastGoal: state.lastGoal ?? {}, lastTurns: state.lastTurns ?? {} };
	fs.mkdirSync(path.dirname(file), { recursive: true });
	const tmp = file + ".tmp";
	fs.writeFileSync(tmp, JSON.stringify(clean));
	fs.renameSync(tmp, file);
}

function pruneStore(st) {
	const cutoff = Date.now() - PRUNE_AGE_MS;
	for (const k of Object.keys(st.events)) {
		const e = st.events[k];
		if (!e || typeof e.time !== "number" || e.time < cutoff) delete st.events[k];
	}
	return st;
}

function rowTitle(row) {
	const values = row.projections?.values ?? {};
	return (typeof values.title === "string" && values.title) || "未命名会话";
}

/** Host 插件体：装载 5 秒定时器（宿主进程常驻，不依赖浏览器可见性）。 */
export function apply(ctx) {
	ctx.effect(() => {
		let stopped = false;
		const tick = async () => {
			if (stopped) return;
			try {
				const state = loadStore();
				const rows = readCacheRows(CACHE_DIR);
				const changed = detectTransitions(rows, state, Date.now());
				// 每次轮询都重建 contexts.json：轮次摘要优先从会话日志源文件重建（完整内容），
				// turnOutline（截断文本）仅在日志读取失败时兜底
				const contexts = {};
				// 会话目录索引：sessionId -> 所在工作区目录（一次枚举，避免逐会话试探）
				const sessionHome = {};
				let wsDirs = [];
				try { wsDirs = fs.readdirSync(SESSIONS_DIR).filter((n) => n.startsWith("--") && n.endsWith("--")); } catch { wsDirs = []; }
				for (const ws of wsDirs) {
					try {
						for (const child of fs.readdirSync(path.join(SESSIONS_DIR, ws))) {
							if (child.startsWith("session-")) sessionHome[child] = path.join(SESSIONS_DIR, ws);
						}
					} catch { /* 单个工作区读取失败跳过 */ }
				}
				for (const row of rows) {
					if (!row || typeof row.sessionId !== "string" || !sessionHome[row.sessionId]) continue;
					const fromLog = readSessionTurns(sessionHome[row.sessionId], row.sessionId);
					if (fromLog && fromLog.turns.length > 0) {
						contexts[row.sessionId] = { title: rowTitle(row), cwd: row.cwd ?? "", turns: fromLog.turns.slice(-5) };
					}
				}
				// turnOutline 兜底（日志缺失/读取失败的会话）
				const fallback = buildContexts(rows);
				for (const [sid, c] of Object.entries(fallback)) {
					if (!contexts[sid]) contexts[sid] = c;
				}
				saveContexts(contexts);
				if (changed) saveStore(state);
			} catch (e) {
				console.warn("[task-hub] host watcher tick failed:", e);
			}
		};
		void tick();
		const timer = setInterval(() => void tick(), 5000);
		return () => { stopped = true; clearInterval(timer); };
	}, "task-hub: host watcher");
}
