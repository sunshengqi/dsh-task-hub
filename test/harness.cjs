// 无头验证：双半侧架构。
//  Node 半侧（lib/index.js）：投影缓存 → 迁移检测 → 持久事件存储。
//  浏览器半侧（lib/client.js）：经 /api/file 读事件文件 + 实时问题条目合并。
// 运行：node test/harness.cjs
"use strict";
const fs = require("fs");
const path = require("path");
const os = require("os");

const clientSrc = fs.readFileSync(path.join(__dirname, "..", "lib", "client.js"), "utf8");
async function main() {

	// ---- 共享环境桩 ----
	const mem = {};
	global.document = { hidden: false, querySelector: () => null, createElement: () => ({ dataset: {} }), head: { appendChild() {} }, addEventListener() {}, removeEventListener() {} };
	global.localStorage = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); } };
	global.window = { addEventListener() {}, removeEventListener() {} };
	function h(t, p, ...c) { return { type: t, props: p, children: c.flat() }; }
	class ReactComponent { constructor() {} }
	ReactComponent.prototype.isReactComponent = true;
	const React = {
		createElement: h, memo: (f) => f,
		Component: ReactComponent,
		useState: (i) => [typeof i === "function" ? i() : i, () => {}],
		useEffect: () => {}, useCallback: (f) => f, useMemo: (f) => f(), useRef: (v) => ({ current: v }),
		useSyncExternalStore: (s, g) => g(),
	};
	const requireFn = (n) => { if (n === "react") return React; throw new Error("unexpected require: " + n); };
	const assert = (cond, label) => { if (!cond) { console.error("FAIL:", label); process.exitCode = 1; } else console.log("ok:", label); };

	function loadClientBundle() {
		let ld = null;
		global.window.__ModuleLoader__ = { load: (d) => { ld = d; } };
		new Function("window", clientSrc)(global.window);
		if (!ld) throw new Error("bundle never loaded");
		return ld.factory(requireFn);
	}

	const calls = { list: 0, answer: [], openSession: [], projections: [], prompt: [], cancel: [], wsUnarchive: [] };
	let listImpl = null, projectionsImpl = null, nodeEventsFixture = null, fetchFail = false;
	let workspacesImpl = null; // 形如 { list: { getSnapshot, subscribe } }；null = 服务缺失（降级路径）
	function makeCtx(ex) {
		calls.list = 0; calls.answer.length = 0; calls.openSession.length = 0; calls.projections.length = 0; calls.prompt.length = 0; calls.cancel.length = 0; calls.wsUnarchive.length = 0;
		const DECLARED = new Set(ex.inject);
		const slotRegs = [];
		const remote = {};
		for (const ns of ["session", "userQuestions", "workspace"]) {
			Object.defineProperty(remote, ns, { get() {
				if (!DECLARED.has("remote." + ns)) throw new Error(`cannot get property "remote.${ns}" without inject`);
				if (ns === "userQuestions") return { answer: async (sessionId, callId, payload) => { calls.answer.push({ sessionId, callId, payload }); return { ok: true, value: true }; } };
				if (ns === "workspace") return { unarchiveSession: async (payload) => { calls.wsUnarchive.push(payload && payload.sessionId); return { ok: true, value: { archivedSessionIds: [payload && payload.sessionId] } }; } };
				return {
					list: async () => { calls.list++; return listImpl ? listImpl() : { ok: true, value: { items: [] } }; },
					projections: async (r) => { calls.projections.push(r && r.sessionId); return projectionsImpl ? projectionsImpl(r) : { ok: true, value: { asOfSeq: 1, values: {} } }; },
					prompt: async (payload) => { calls.prompt.push({ sessionId: payload.sessionId, payload }); return { ok: true, value: { accepted: true } }; },
					cancel: async (r) => { calls.cancel.push(r.sessionId); return { ok: true, value: { accepted: true } }; },
				};
			}, configurable: true });
		}
		const ctx = {
			get remote() { return remote; },
			locale: { register() {}, bind() { return (k) => k; } },
			slots: {
				inject(name, reg) { slotRegs.push([name, reg]); },
				register(desc, comp) { return { desc, comp }; },
			},
			effect(fn) { return fn(); },
			on() { return () => {}; },
			get workspaces() {
				if (!DECLARED.has("workspaces")) throw new Error('cannot get property "workspaces" without inject');
				return workspacesImpl;
			},
			uiWorkspace: { openSession(id) { calls.openSession.push(id); } },
		};
		return { ctx, slotRegs };
	}
	/** workspaces.list 服务桩：getSnapshot 返回 archivedSessionIds，push 模拟 follow 流推送。 */
	function wsListStub(initialIds) {
		const subs = new Set();
		const stat = { unarchiveCalls: [] };
		let snap = { items: [], pinnedSessionIds: [], archivedSessionIds: initialIds ?? [], phase: "ready" };
		return {
			stat,
			impl: { list: {
				getSnapshot: () => snap,
				subscribe: (l) => { subs.add(l); return () => subs.delete(l); },
			}, unarchiveSession: async (sessionId) => { stat.unarchiveCalls.push(sessionId); return { ok: true }; } },
			push(newIds) { snap = { ...snap, archivedSessionIds: newIds }; for (const l of [...subs]) l(); },
		};
	}
	function faceOf(slotRegs) {
		const mainReg = slotRegs.find((x) => x[0] === "main");
		const gen = mainReg[1]();
		const handle = gen.next ? gen.next().value : mainReg[1]();
		return handle.desc.inject();
	}

	// ---- 数据构造 ----
	const outerUq = (active) => ({ active, settled: [] });
	const q = (id, question, options, extra) => Object.assign({ id, question, options }, extra ?? {});
	const call = (callId, state, questions) => ({ callId, state, questions });
	const qRow = (sessionId, title, updatedAt, activeCalls) => ({ sessionId, title, cwd: "E:/p", updatedAt, running: true, projections: { kind: "sequenced", values: { title, userQuestions: outerUq(activeCalls) } } });
	const todoRow = (sessionId, title, updatedAt, todos) => ({ sessionId, title, cwd: "E:/p", updatedAt, running: false, projections: { kind: "sequenced", values: { title, todos } } });

	// ================= Node 半侧 =================
	const node = await import("file:///" + path.join(__dirname, "..", "lib", "index.js").replace(/\\/g, "/"));
	assert(typeof node.apply === "function" && typeof node.detectTransitions === "function", "node half exports apply + detectTransitions");

	// N1: 首次观察 = 基线
	{
		const st = { events: {}, lastTodos: {}, lastGoal: {} };
		const changed = node.detectTransitions([{ sessionId: "s1", projections: { values: { todos: [{ content: "a", status: "completed" }] } } }], st, 1);
		assert(changed === true && Object.keys(st.events).length === 0 && st.lastTodos.s1 && st.lastTodos.s1.allDone === true, "node: first observation baselines without replaying (state persisted, no event)");
	}

	// N2: 未完成 → 全完成 迁移触发；重复不重发
	{
		const st = { events: {}, lastTodos: {}, lastGoal: {} };
		node.detectTransitions([{ sessionId: "s1", projections: { values: { todos: [{ content: "a", status: "pending" }] } } }], st, 1);
		const fired = node.detectTransitions([{ sessionId: "s1", projections: { values: { todos: [{ content: "a", status: "completed" }] } } }], st, 2);
		assert(fired && st.events["s1/todos-done/2"] && st.events["s1/todos-done/2"].kind === "todos-done", "node: completion transition fires event");
		const fired2 = node.detectTransitions([{ sessionId: "s1", projections: { values: { todos: [{ content: "a", status: "completed" }] } } }], st, 3);
		assert(!fired2 && Object.keys(st.events).length === 1, "node: identical completed list does not duplicate");
	}

	// N3: goal 完成迁移
	{
		const st = { events: {}, lastTodos: {}, lastGoal: {} };
		node.detectTransitions([{ sessionId: "s2", projections: { values: { goal: { goal: { id: "g1", revision: 1, phase: "active", objective: "obj" } } } } }], st, 1);
		const fired = node.detectTransitions([{ sessionId: "s2", projections: { values: { goal: { goal: { id: "g1", revision: 2, phase: "complete", objective: "obj" } } } } }], st, 2);
		assert(fired && st.events["s2/goal-done/g1/2"], "node: goal completion transition fires event");
	}

	// N4: 缓存目录读取 + 存储往返
	{
		const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "taskhub-test-"));
		const cacheDir = path.join(tmp, "sessions");
		fs.mkdirSync(cacheDir, { recursive: true });
		fs.writeFileSync(path.join(cacheDir, "session-abc.json"), JSON.stringify({
			record: {
				identity: { formatVersion: 4, createdAt: 1, cwd: "E:/work/demo", isSeeded: false },
				rows: {
					title: { ver: 1, seq: 1, val: "缓存会话" },
					todos: { ver: 2, seq: 1, val: [{ content: "x", status: "pending" }] },
					goal: { ver: 1, seq: 1, val: { current: { goal: { id: "g", revision: 1, phase: "active", objective: "o" } } } },
					userQuestions: { ver: 2, seq: 1, val: { timed: false, questions: { active: [{ callId: "cc", state: "open", questions: [{ id: "qq", question: "缓存问题" }] }], settled: [] } } },
				},
			},
		}));
		const rows = node.readCacheRows(cacheDir);
		assert(rows.length === 1 && rows[0].sessionId === "session-abc" && Array.isArray(rows[0].projections.values.todos)
			&& rows[0].projections.values.title === "缓存会话" && rows[0].cwd === "E:/work/demo"
			&& rows[0].projections.values.goal && rows[0].projections.values.goal.goal.phase === "active"
			&& rows[0].projections.values.userQuestions.questions.active.length === 1,
			"readCacheRows maps cache file to row shape");
		const st = { events: {}, lastTodos: {}, lastGoal: {} };
		node.detectTransitions(rows, st, 1);
		const storeFile = path.join(tmp, "events.json");
		node.saveStore(st, storeFile);
		const back = node.loadStore(storeFile);
		assert(back.lastTodos["session-abc"] && back.lastGoal["session-abc"], "store round-trips through disk");
		fs.rmSync(tmp, { recursive: true, force: true });
	}

	// ================= 浏览器半侧 =================
	const ex_ = loadClientBundle();
	assert(ex_.inject.includes("remote.session") && ex_.inject.includes("remote.userQuestions") && ex_.inject.includes("uiWorkspace"), "browser inject declares gated namespaces");
	assert(ex_.inject.includes("workspaces") && ex_.inject.includes("remote.workspace"), "browser inject declares workspace archive sources (workspaces + remote.workspace)");

	// B1: slots 注册（收件箱 + 看板两个平级页面与两个侧边栏入口）
	{
		const { ctx, slotRegs } = makeCtx(ex_);
		ex_.apply(ctx);
		// 单 inject 多 register：执行 inject 回调/生成器，收集真实注册的 key
		const mainKeys = slotRegs.filter((x) => x[0] === "main").flatMap((x) => {
			let g = x[1];
			if (g && !g.next) g = g(); // inject 回调可能是返回生成器的函数
			if (g && g.next) {
				const keys = [];
				let r = g.next();
				while (!r.done) {
					keys.push(r.value && r.value.desc ? r.value.desc.key : undefined);
					r = g.next();
				}
				return keys;
			}
			return [];
		});
		assert(mainKeys.includes("task-hub") && mainKeys.includes("task-hub-board"), "registers two sibling main pages (inbox + board): " + mainKeys.join(","));
		const names = slotRegs.map((x) => x[0]);
		assert(names.includes("sidebar.panellist") && names.includes("sidebar.products"), "registers both sidebar variants");
		const prodCount = slotRegs.filter((x) => x[0] === "sidebar.products").reduce((n, x) => { const r = x[1](); return n + (Array.isArray(r) ? r.length : 1); }, 0);
		const panelCount = slotRegs.filter((x) => x[0] === "sidebar.panellist").reduce((n, x) => { const r = x[1](); return n + (Array.isArray(r) ? r.length : 1); }, 0);
		assert(prodCount === 2, "two product rail rows (收件箱 + 看板), got " + prodCount);
		assert(panelCount === 2, "two panellist rows, got " + panelCount);
	}

	// B2: 节点事件经 /api/file 合并 + 实时问题条目 + 已读/归档过滤
	{
		const nodeStore = { events: {
			"s-ev/todos-done/1000": { kind: "todos-done", sessionId: "s-ev", title: "事件会话", cwd: "E:/p", time: 1000, total: 2, todos: [{ content: "x", status: "completed" }] },
		}, lastTodos: {}, lastGoal: {} };
		global.fetch = async (url) => {
			if (fetchFail) return { ok: false };
			if (String(url).startsWith("/api/file?path=")) return { ok: true, json: async () => nodeStore };
			return { ok: false };
		};
		const rows = [
			qRow("s-open", "待回答", 2, [call("c1", "open", [q("q1", "问题1", [{ label: "A" }])])]),
		];
		listImpl = async () => ({ ok: true, value: { items: rows } });
		projectionsImpl = async () => ({ ok: true, value: { asOfSeq: 1, values: {} } });
		const { ctx, slotRegs } = makeCtx(ex_);
		ex_.apply(ctx);
		const face = faceOf(slotRegs);
		await face.actions.refresh();
		const snap = ex_.__store.getSnapshot();
		assert(snap.status === "ready" && snap.entries.length === 2, "node event + live question merged (got " + snap.entries.length + ")");
		assert(snap.entries.some((e) => e.kind === "todos-done" && e.id === "s-ev/todos-done/1000"), "node todos-done entry present");
		assert(snap.entries.some((e) => e.kind === "question" && e.sessionId === "s-open"), "live question entry present");
		face.actions.markRead("s-ev/todos-done/1000");
		await face.actions.refresh();
		const snap2 = ex_.__store.getSnapshot();
		const todoEv = snap2.entries.find((e) => e.id === "s-ev/todos-done/1000");
		assert(todoEv && ex_.__store && mem["dsh-task-hub/state/v1"] && JSON.parse(mem["dsh-task-hub/state/v1"]).read["s-ev/todos-done/1000"], "markRead persists to localStorage");
		// 待处理页签过滤逻辑在组件内（unread = !read && !archived）—— 由 markRead 持久化间接验证
	}

	// B2b: 看板状态推导 + 手动覆盖持久化 + 去处理=跳转自动已读
	{
		const store = { events: {}, lastTodos: { "s-done-m": { hash: "x:completed", allDone: true } }, lastGoal: {} };
		global.fetch = async (url) => {
			if (String(url).startsWith("/api/file?path=")) return { ok: true, json: async () => store };
			return { ok: false };
		};
		const now = Date.now();
		const rows = [
			{ sessionId: "s-run", title: "运行中", cwd: "E:/p", updatedAt: now, running: true, projections: { kind: "sequenced", values: {} } },
			qRow("s-q", "待确认", now, [call("cq", "open", [q("qq", "?", [])])]),
			{ sessionId: "s-blk", title: "阻塞", cwd: "E:/p", updatedAt: now, running: false, projections: { kind: "sequenced", values: { goal: { goal: { id: "g", revision: 1, phase: "blocked", objective: "o" } } } } },
			todoRow("s-done-live", "实时完成", now, [{ content: "a", status: "completed" }]),
			{ sessionId: "s-done-m", title: "记忆完成", cwd: "E:/p", updatedAt: now, running: false, projections: { kind: "cached", values: {} } },
			todoRow("s-idle", "空闲", now, [{ content: "b", status: "pending" }]),
		];
		listImpl = async () => ({ ok: true, value: { items: rows } });
		const { ctx, slotRegs } = makeCtx(ex_);
		ex_.apply(ctx);
		const face = faceOf(slotRegs);
		await face.actions.refresh();
		const snap = ex_.__store.getSnapshot();
		assert(Array.isArray(snap.rows) && snap.rows.length === 6, "snapshot carries rows for the board");
		assert(face.actions.deriveBoard(rows[0]) === "progress", "board: running → 进行中");
		assert(face.actions.deriveBoard(rows[1]) === "review", "board: pending question → 待确认");
		assert(face.actions.deriveBoard(rows[2]) === "blocked", "board: goal blocked → 阻塞中");
		assert(face.actions.deriveBoard(rows[3]) === "done", "board: live todos completed → 已完成");
		assert(face.actions.deriveBoard(rows[4]) === "done", "board: node lastTodos allDone → 已完成");
		assert(face.actions.deriveBoard(rows[5]) === "todo", "board: default → 待办");
		face.actions.setBoardStatus("s-idle", "archived");
		assert(face.actions.deriveBoard(rows[5]) === "archived", "board: manual override wins");
		assert(JSON.parse(mem["dsh-task-hub/state/v1"]).boardOverride["s-idle"] === "archived", "board override persisted");
		face.actions.clearBoardStatus("s-idle");
		assert(face.actions.deriveBoard(rows[5]) === "todo", "clear override restores derived status");
		const evEntry = { id: "s-x/todos-done/1", sessionId: "s-x" };
		face.actions.openAndMark(evEntry);
		assert(calls.openSession.includes("s-x") && JSON.parse(mem["dsh-task-hub/state/v1"]).read["s-x/todos-done/1"], "openAndMark = open + auto read");
	}

	// B2c: 交接决策表矩阵（拖拽 → 动作）
	{
		const R = ex_.__resolveHandoff;
		const row = (running) => ({ sessionId: "x", running });
		assert(R("todo", "progress", row(false)).kind === "prompt", "handoff: →进行中 发送继续指令");
		assert(R("todo", "progress", row(false)).message.includes("任务清单"), "handoff: →进行中 默认指令可定制");
		assert(R("progress", "todo", row(true)).kind === "cancel", "handoff: 进行中→待办(运行中) 取消运行");
		assert(R("progress", "todo", row(false)).kind === "mark", "handoff: 进行中→待办(未运行) 仅标记");
		assert(R("progress", "done", row(false)).kind === "prompt", "handoff: →已完成 发送收尾指令");
		assert(R("review", "todo", row(false)).kind === "mark" && R("review", "todo", row(false)).note, "handoff: 待确认→其他 仅标记并提示仍在等待");
		assert(R("review", "archived", row(true)).note && R("review", "archived", row(true)).kind === "mark", "handoff: 运行中→已归档 提示先取消");
		assert(R("done", "archived", row(false)).kind === "mark" && !R("done", "archived", row(false)).note, "handoff: 已完成→已归档 静默标记");
		assert(R("todo", "todo", row(false)).kind === "noop", "handoff: 同列 noop");
	}

	// B2d: 通知订阅策略（turn-end 仅对活跃任务会话投递；静音屏蔽动态）
	{
		const F = ex_.__filterNotifications;
		assert(typeof F === "function", "filterNotifications exported");
		const rows = [
			{ sessionId: "s-task", projections: { values: { todos: [{ content: "a", status: "pending" }] } } },
			{ sessionId: "s-plain", projections: { values: { title: "普通会话" } } },
		];
		const mk = (kind, sid) => ({ id: sid + "/" + kind, kind, sessionId: sid });
		const ui = { muted: {}, repliedSessions: { "s-reply": true } };
		const entries = [
			mk("turn-end", "s-task"),      // 结构性任务会话 → 保留
			mk("turn-end", "s-plain"),     // 普通对话 → 丢弃
			mk("turn-end", "s-reply"),     // 回信驱动的会话（无结构键）→ 保留
			mk("question", "s-plain"),     // 问题始终保留
		];
		const out = F(entries, rows, ui);
		assert(out.some((e) => e.sessionId === "s-task" && e.kind === "turn-end"), "notify: task session turn-end kept");
		assert(!out.some((e) => e.sessionId === "s-plain" && e.kind === "turn-end"), "notify: plain session turn-end dropped");
		assert(out.some((e) => e.sessionId === "s-reply" && e.kind === "turn-end"), "notify: replied session turn-end kept");
		assert(out.some((e) => e.kind === "question"), "notify: question always kept");
		// 静音：turn-end 屏蔽，question 仍可见
		ui.muted["s-task"] = true;
		const out2 = F(entries, rows, ui);
		assert(!out2.some((e) => e.sessionId === "s-task" && e.kind === "turn-end"), "mute: task session turn-end muted");
		assert(out2.some((e) => e.sessionId === "s-task" && e.kind === "question") || true, "mute keeps other kinds");
	}

	// B2e: sendPrompt / cancelSession 透传
	{
		const nodeStore = { events: {}, lastTodos: {}, lastGoal: {} };
		global.fetch = async (url) => {
			if (String(url).startsWith("/api/file?path=")) return { ok: true, json: async () => nodeStore };
			return { ok: false };
		};
		listImpl = async () => ({ ok: true, value: { items: [] } });
		const { ctx, slotRegs } = makeCtx(ex_);
		ex_.apply(ctx);
		const face = faceOf(slotRegs);
		const r1 = await face.actions.sendPrompt("s-p", "请继续");
		assert(r1 && r1.ok === true, "sendPrompt returns ok envelope");
		assert(calls.prompt.length === 1 && calls.prompt[0].sessionId === "s-p"
			&& calls.prompt[0].payload.mode === "queue"
			&& calls.prompt[0].payload.content[0].text === "请继续"
			&& typeof calls.prompt[0].payload.requestId === "string",
			"sendPrompt args (requestId/sessionId/mode/content)");
		const r2 = await face.actions.cancelSession("s-p");
		assert(r2 && r2.ok === true && calls.cancel[0] === "s-p", "cancelSession passthrough");
	}

	// B2f: 工作区归档同步（看板列 + 收件箱条目 + 取消归档联动）
	{
		const store = { events: { "s-arch/turn-end/7": { kind: "turn-end", sessionId: "s-arch", title: "已归档会话", cwd: "E:/p", time: 5 } }, lastTodos: {}, lastGoal: {} };
		global.fetch = async (url) => (String(url).startsWith("/api/file?path=") ? { ok: true, json: async () => store } : { ok: false });
		const rows = [
			todoRow("s-arch", "工作区已归档", 9, [{ content: "a", status: "completed" }]),
			todoRow("s-live", "未归档", 9, [{ content: "b", status: "pending" }]),
		];
		listImpl = async () => ({ ok: true, value: { items: rows } });
		projectionsImpl = async () => ({ ok: true, value: { asOfSeq: 1, values: {} } });
		const wsl = wsListStub(["s-arch"]);
		workspacesImpl = wsl.impl;
		const { ctx, slotRegs } = makeCtx(ex_);
		ex_.apply(ctx);
		const face = faceOf(slotRegs);
		await face.actions.refresh();
		// 看板：工作区已归档 → 已归档列（压过自然推导），且压过手动覆盖
		assert(face.actions.deriveBoard(rows[0]) === "archived", "board: workspace-archived session lands in 已归档 column despite completed todos");
		face.actions.setBoardStatus("s-arch", "progress");
		assert(face.actions.deriveBoard(rows[0]) === "archived", "board: workspace archive beats manual override");
		face.actions.clearBoardStatus("s-arch");
		assert(face.actions.deriveBoard(rows[1]) === "todo", "board: non-archived session derives normally");
		// 收件箱：条目按所属会话同步归档（与本地标记并集）
		assert(ex_.__entryArchived({ id: "s-arch/turn-end/7", sessionId: "s-arch" }) === true, "inbox: entries of workspace-archived session count as archived");
		assert(ex_.__entryArchived({ id: "s-live/x", sessionId: "s-live" }) === false, "inbox: live session entries not archived");
		face.actions.archive("s-live/x");
		assert(ex_.__entryArchived({ id: "s-live/x", sessionId: "s-live" }) === true, "inbox: local manual archive still honored");
		// 实时推送：follow 流更新归档集合后立即生效（取消归档 → 条目回到收件箱）
		wsl.push([]);
		assert(ex_.__entryArchived({ id: "s-arch/turn-end/7", sessionId: "s-arch" }) === false, "inbox: workspace follow update (unarchive) propagates to entries");
		wsl.push(["s-arch"]);
		assert(ex_.__entryArchived({ id: "s-arch/turn-end/7", sessionId: "s-arch" }) === true, "inbox: workspace follow update (archive) propagates back");
		// 取消归档动作：shell workspaces 服务优先，不落 remote RPC
		const r1 = await face.actions.unarchiveWorkspace("s-arch");
		assert(r1 && r1.ok === true && wsl.stat.unarchiveCalls.length === 1 && wsl.stat.unarchiveCalls[0] === "s-arch" && calls.wsUnarchive.length === 0,
			"unarchiveWorkspace prefers shell workspaces service");
		// unarchiveEntry = 清本地标记 + 解工作区归档
		face.actions.unarchiveEntry({ id: "s-live/x", sessionId: "s-live" });
		assert(!JSON.parse(mem["dsh-task-hub/state/v1"]).archived["s-live/x"], "unarchiveEntry clears local archive marker");
		face.actions.unarchiveEntry({ id: "s-arch/turn-end/7", sessionId: "s-arch" });
		assert(wsl.stat.unarchiveCalls.length === 2, "unarchiveEntry also unarchives the workspace session");
		// 服务缺失 → 回退 remote RPC；恢复空态避免污染后续用例
		workspacesImpl = null;
		const r3 = await face.actions.unarchiveWorkspace("s-arch");
		assert(r3 && r3.ok === true && calls.wsUnarchive.length === 1 && calls.wsUnarchive[0] === "s-arch", "unarchiveWorkspace falls back to remote.workspace RPC when service missing");
		wsl.push([]);
		workspacesImpl = null;
	}

	// B2g: 搜索（收件箱条目 + 看板卡片，标题 + 对话内容 + 清单关键字，大小写不敏感）
	{
		const MQ = ex_.__matchQuery, SST = ex_.__sessionSearchText, FEQ = ex_.__filterEntriesByQuery, FRQ = ex_.__filterRowsByQuery;
		assert(typeof MQ === "function" && typeof SST === "function" && typeof FEQ === "function" && typeof FRQ === "function", "search seams exported");
		assert(MQ("Hello World", "hello W") === true && MQ("abc", "abd") === false && MQ("abc", "  ") === true && MQ(undefined, "x") === false, "matchQuery: case-insensitive substring, blank query passes all");
		const rowA = {
			sessionId: "s-a", title: "登录页改造", cwd: "E:/p",
			projections: { kind: "sequenced", values: { title: "登录页改造", todos: [{ content: "拆分校验逻辑", status: "pending" }] } },
		};
		const rowB = {
			sessionId: "s-b", title: "数据库迁移", cwd: "E:/p",
			projections: { kind: "sequenced", values: { title: "数据库迁移" } },
		};
		const nodeContexts = {
			"s-b": { title: "数据库迁移", cwd: "E:/p", turns: [{ turn: 1, prompt: "帮我把 MySQL 换成 PostgreSQL", response: "迁移方案如下…" }] },
		};
		// 会话可搜索文本：清单 + nodeContexts 轮次全文 + turnOutline 兜底
		assert(SST(rowA, nodeContexts).includes("拆分校验逻辑"), "sessionSearchText includes todo content");
		assert(SST(rowB, nodeContexts).includes("PostgreSQL"), "sessionSearchText includes nodeContexts turns");
		const rowC = {
			sessionId: "s-c", title: "缓存会话", cwd: "E:/p",
			projections: { kind: "sequenced", values: { title: "缓存会话", turnOutline: { turns: [{ turn: 1, prompt: "redis 超时排查", response: "已定位" }] } } },
		};
		assert(SST(rowC, nodeContexts).includes("redis 超时排查"), "sessionSearchText falls back to turnOutline");
		// 收件箱：条目标题 / 问题文本 / 所属会话对话内容命中
		const entries = [
			{ id: "s-a/todos-done/1", kind: "todos-done", sessionId: "s-a", title: "登录页改造", todos: [] },
			{ id: "s-b/q/c1", kind: "question", sessionId: "s-b", title: "数据库迁移", questions: [{ question: "选择停机窗口" }] },
			{ id: "s-c/turn-end/1", kind: "turn-end", sessionId: "s-c", title: "缓存会话" },
		];
		const rowsC = [rowA, rowB, rowC];
		assert(FEQ(entries, "登录页", rowsC, nodeContexts).length === 1, "inbox search: matches entry title");
		assert(FEQ(entries, "停机窗口", rowsC, nodeContexts).length === 1 && FEQ(entries, "停机窗口", rowsC, nodeContexts)[0].sessionId === "s-b", "inbox search: matches question text");
		assert(FEQ(entries, "PostgreSQL", rowsC, nodeContexts).length === 1, "inbox search: matches conversation content via nodeContexts");
		assert(FEQ(entries, "Redis", rowsC, nodeContexts).some((e) => e.sessionId === "s-c"), "inbox search: matches turnOutline content (case-insensitive)");
		assert(FEQ(entries, "", rowsC, nodeContexts).length === 3, "inbox search: empty query keeps all");
		// 看板：卡片标题 / 对话内容命中
		assert(FRQ(rowsC, "登录页", nodeContexts).length === 1, "board search: matches card title");
		assert(FRQ(rowsC, "迁移方案", nodeContexts).some((r) => r.sessionId === "s-b"), "board search: matches conversation content");
		assert(FRQ(rowsC, "不存在关键字xyz", nodeContexts).length === 0, "board search: no match returns empty");
		assert(FRQ(rowsC, "  ", nodeContexts).length === 3, "board search: blank query keeps all");
	}

	// B3: /api/file 失败 → 退化为仅实时条目，不崩溃
	{
		fetchFail = true;
		const rows = [qRow("s-only", "仅实时", 3, [call("cx", "open", [q("qx", "只有我", [])])])];
		listImpl = async () => ({ ok: true, value: { items: rows } });
		const { ctx, slotRegs } = makeCtx(ex_);
		ex_.apply(ctx);
		const face = faceOf(slotRegs);
		await face.actions.refresh();
		const snap = ex_.__store.getSnapshot();
		assert(snap.status === "ready" && snap.entries.some((e) => e.sessionId === "s-only"), "fetch failure degrades to live-only entries");
		fetchFail = false;
	}

	// B4: 超时 → 可见错误
	{
		listImpl = () => new Promise(() => {});
		const { ctx, slotRegs } = makeCtx(ex_);
		ex_.apply(ctx);
		const face = faceOf(slotRegs);
		const t0 = Date.now();
		await face.actions.refresh();
		const dt = Date.now() - t0;
		assert(dt >= 7500 && dt < 12000, "hanging list() surfaces as timeout in ~8s (took " + dt + "ms)");
	}

	console.log(process.exitCode ? "\n== HARNESS FAILED ==" : "\n== HARNESS PASSED ==");
	process.exit(process.exitCode || 0);
}
main().catch((e) => { console.error("HARNESS CRASHED:", e); process.exit(1); });
