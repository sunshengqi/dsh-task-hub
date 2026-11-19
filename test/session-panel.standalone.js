		/** 会话侧边栏：上下文 + 回信 + 待确认问题处理 + 跳转对话。 */
		function SessionPanel({ row, actions, onClose }) {
			const values = row.projections?.values ?? {};
			const title = (typeof values.title === "string" && values.title) || "未命名会话";
			const turns = (values.turnOutline && Array.isArray(values.turnOutline.turns)) ? values.turnOutline.turns : [];
			const recent = turns.slice(-6).reverse();
			const activeCalls = (normalizeUq(values)?.active) ?? [];
			const [draft, setDraft] = React.useState("");
			const [pending, setPending] = React.useState(false);
			const [answeredCall, setAnsweredCall] = React.useState(null);
			const [sel, setSel] = React.useState({});
			const send = async () => {
				const txt = draft.trim();
				if (!txt || pending) return;
				setPending(true);
				const res = await actions.replyToSession(row.sessionId, txt);
				setPending(false);
				if (res && res.ok) { setDraft(""); actions.refresh(); }
			};
			const answerCall = async (callObj, answers) => {
				setPending(true);
				const res = await actions.answer(row.sessionId, callObj.callId, { answers });
				setPending(false);
				if (res && res.ok) { setAnsweredCall(callObj.callId); actions.refresh(); }
			};
			const questionBlocks = activeCalls.map((c) => {
				if (answeredCall === c.callId) return h("div", { className: "th-ok", key: c.callId }, "已回答");
				const questions = Array.isArray(c.questions) ? c.questions : [];
				const canAnswer = c.state === "continued";
				const kids = [];
				for (const qq of questions) {
					kids.push(h("div", { key: qq.id, className: "th-q" },
						h("div", { className: "th-q-text" }, qq.question),
						qq.detail ? h("div", { className: "th-q-detail" }, qq.detail) : null
					));
				}
				const allAnswered = canAnswer && questions.every((qq) => (sel[qq.id] ?? []).length > 0 || !qq.options);
				if (allAnswered) {
					kids.push(h("div", { className: "th-actions" },
						h("button", {
							type: "button", className: "th-btn primary", disabled: pending,
							onClick: () => {
								void answerCall(c, questions.map((qq) => ({ id: qq.id, selected: sel[qq.id] ?? [] })));
							}
						}, "提交回答")));
				} else if (!canAnswer) {
					kids.push(h("div", { className: "th-hint" }, "该问题正在会话内等待，请点「跳转对话」去回答。"));
				}
				return h("div", { key: c.callId, className: "th-side-q" }, kids);
			});
			const ctxTurns = [];
			for (const tn of recent) {
				ctxTurns.push(h("div", { key: tn.turn, className: "th-turn" },
					h("div", { className: "th-turn-q" }, "你：" + String(tn.prompt ?? "").slice(0, 160)),
					h("div", { className: "th-turn-a" }, "智能体：" + String(tn.response ?? "").slice(0, 220))
				));
			}
			return h("div", { className: "th-mask", onClick: onClose },
				h("div", { className: "th-sidepanel", onClick: (e) => e.stopPropagation() },
					h("div", { className: "th-side-head" },
						h("span", { className: "th-title" }, title),
						h("button", { type: "button", className: "th-btn", onClick: onClose }, "✕")
					),
					h("div", { className: "th-side-meta" },
						shortCwd(row.cwd ?? "") + " · " + (BOARD_STATUS_LABEL[actions.deriveBoard(row)] ?? ""),
						row.running ? h("span", { className: "th-run" }, " ● 运行中") : null
					),
					activeCalls.length > 0 ? h("div", { className: "th-side-section" },
						h("div", { className: "th-side-h" }, "待确认（" + activeCalls.length + "）"),
						questionBlocks
					) : null,
					h("div", { className: "th-side-section th-side-ctx" },
						h("div", { className: "th-side-h" }, "最近上下文"),
						ctxTurns.length === 0 ? h("div", { className: "th-hint" }, "暂无轮次记录") : null,
						ctxTurns
					),
					h("div", { className: "th-side-section th-side-compose" },
						h("textarea", {
							className: "th-dlg-input",
							placeholder: "发送指令/回信（排队投递给该会话的智能体）…",
							value: draft,
							onChange: (e) => setDraft(e.target.value),
							rows: 3
						}),
						h("div", { className: "th-dlg-actions" },
							h("button", {
								type: "button", className: "th-btn primary",
								disabled: pending || draft.trim() === "",
								onClick: () => { void send(); }
							}, pending ? "发送中…" : "发送")
						)
					),
					h("div", { className: "th-side-foot" },
						h("button", {
							type: "button", className: "th-btn primary",
							onClick: () => { actions.open(row.sessionId); onClose(); }
						}, "跳转对话")
					)
				)
			);
		}
