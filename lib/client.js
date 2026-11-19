window.__ModuleLoader__.load({
	id: "@local/dsh-task-hub",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const React = require("react");
		const h = React.createElement;

		//#region constants & locale
		const NS = "task-hub";
		const PANEL_ID = "task-hub";
		const BOARD_ID = "task-hub-board";
		const LS_KEY = "dsh-task-hub/state/v1";
		const POLL_MS = 4000;

		const zh = {
			"panel": "收件箱",
			"page.title": "任务中心",
			"page.subtitle": "所有对话中需要你接手的事项",
			"view.inbox": "收件箱",
			"view.board": "看板",
			"panel.board": "看板",
			"board.title": "任务看板",
			"board.subtitle": "全部会话任务状态统览（拖拽卡片调整状态）",
			"tab.todo": "待处理",
			"tab.all": "全部",
			"tab.archive": "已归档",
			"action.markRead": "已读",
			"action.markUnread": "未读",
			"action.markAllRead": "全部已读",
			"action.archive": "归档",
			"action.unarchive": "取消归档",
			"action.open": "去处理",
			"action.approve": "同意执行",
			"action.modify": "去会话修改",
			"action.submit": "提交回答",
			"action.refresh": "刷新",
			"kind.question": "待确认",
			"kind.plan-review": "计划待审",
			"kind.todos-done": "任务完成",
			"kind.goal-done": "目标完成",
			"state.openHint": "该问题正在会话内等待回答，请到会话中作答。",
			"state.continuedHint": "可直接在下方作答，回答会转给该会话的智能体。",
			"custom.placeholder": "补充说明（可选）",
			"submitted": "已提交，回答已转给智能体。",
			"empty.todo": "没有待处理的事项，去忙别的吧。",
			"empty.all": "暂无条目。",
			"empty.archive": "已归档内容为空。",
			"status.loading": "正在加载会话…",
			"status.unavailable": "无法访问会话服务（remote.sessions 不可用）。",
			"status.error": "刷新失败",
			"subagent": "子代理"
		};
		const en = {
			"panel": "Inbox",
			"page.title": "Task Hub",
			"page.subtitle": "Everything across conversations that needs you",
			"view.inbox": "Inbox",
			"view.board": "Board",
			"panel.board": "Board",
			"board.title": "Task Board",
			"board.subtitle": "All sessions at a glance (drag cards to change status)",
			"tab.todo": "To handle",
			"tab.all": "All",
			"tab.archive": "Archived",
			"action.markRead": "Mark read",
			"action.markUnread": "Mark unread",
			"action.markAllRead": "Mark all read",
			"action.archive": "Archive",
			"action.unarchive": "Unarchive",
			"action.open": "Open session",
			"action.approve": "Approve plan",
			"action.modify": "Request changes",
			"action.submit": "Submit answer",
			"action.refresh": "Refresh",
			"kind.question": "Question",
			"kind.plan-review": "Plan review",
			"kind.todos-done": "Tasks done",
			"kind.goal-done": "Goal done",
			"state.openHint": "This question is waiting inside its session — answer it there.",
			"state.continuedHint": "Answer below; the reply is forwarded to the session's agent.",
			"custom.placeholder": "Additional notes (optional)",
			"submitted": "Submitted; the answer was forwarded to the agent.",
			"empty.todo": "Nothing to handle. Enjoy your day.",
			"empty.all": "No entries.",
			"empty.archive": "No archived entries.",
			"status.loading": "Loading sessions…",
			"status.unavailable": "Session service unavailable (remote.sessions missing).",
			"status.error": "Refresh failed",
			"subagent": "subagent"
		};
		//#endregion

		//#region css
		const css = "/* Task Hub — multica 对齐的视觉体系（v2 全量重写） *//* ====== 基础令牌 ====== */.th-page{display:flex;flex-direction:column;height:100%;min-height:0;color:var(--dsw-alias-label-primary,#1f2329);font-size:13px;line-height:1.45;background:var(--dsw-specific-menu,transparent)}/* ====== 页头（PanelHeader 对齐：48px 高、标题+副标题+右侧动作） ====== */.th-head{display:flex;align-items:center;gap:10px;padding:0 16px;height:48px;flex:none;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.08))}.th-title{font-weight:600;font-size:14px}.th-sub{color:var(--dsw-alias-label-tertiary,#8a8f99);font-size:12px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.th-headbtn{border:none;background:none;cursor:pointer;padding:5px 9px;color:var(--dsw-alias-label-secondary,#5c6066);font-size:12px;border-radius:6px}.th-headbtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06));color:var(--dsw-alias-label-primary,#1f2329)}/* ====== 页签 ====== */.th-tabs{display:flex;gap:2px;padding:8px 12px 0;align-items:center;flex:none}.th-tab{border:none;background:none;cursor:pointer;padding:5px 10px;color:var(--dsw-alias-label-tertiary,#8a8f99);font-size:12.5px;border-radius:6px;transition:background .12s}.th-tab:hover{color:var(--dsw-alias-label-primary,#1f2329)}.th-tab.active{color:var(--dsw-alias-label-primary,#1f2329);font-weight:600;background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06))}/* ====== 通用按钮 ====== */.th-btn{border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.14));background:transparent;color:var(--dsw-alias-label-secondary,#5c6066);border-radius:6px;padding:4px 10px;cursor:pointer;font-size:12px;transition:background .12s,color .12s}.th-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06));color:var(--dsw-alias-label-primary,#1f2329)}.th-btn.primary{background:#2f6bff;border-color:#2f6bff;color:#fff}.th-btn.primary:hover{background:#4a80ff}.th-btn:disabled{opacity:.5;cursor:default}.th-btn:disabled:hover{background:transparent;color:var(--dsw-alias-label-secondary,#5c6066)}.th-btn.primary:disabled:hover{background:#2f6bff;color:#fff}/* ====== 收件箱分栏 ====== */.th-inbox-split{flex-direction:row}.th-inbox-left{width:min(400px,40vw);min-width:280px;display:flex;flex-direction:column;min-height:0;border-right:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.08))}.th-inbox-left .th-list{flex:1;overflow-y:auto;padding:4px 8px 16px}.th-inbox-right{flex:1;min-width:0;display:flex;flex-direction:column;min-height:0;background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.02))}/* ====== 列表行（multica list-item：紧凑、hover 显动作、未读点） ====== */.th-list{display:flex;flex-direction:column;gap:1px}.th-row{border-radius:8px;padding:9px 10px;display:flex;flex-direction:column;gap:4px;cursor:pointer;transition:background .12s;position:relative}.th-row:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}.th-row.selected{background:rgba(47,107,255,.10)}.th-row.unread .th-sess{font-weight:600}.th-undot{width:7px;height:7px;border-radius:999px;background:#2f6bff;flex:none}.th-row-top{display:flex;align-items:center;gap:6px;min-width:0}.th-kind{flex:none;font-size:10.5px;padding:1px 7px;border-radius:999px;border:1px solid transparent;font-weight:500}.th-kind.question{color:#b25e09;border-color:rgba(229,138,61,.35);background:rgba(229,138,61,.12)}.th-kind.plan-review{color:#1f5fd9;border-color:rgba(47,107,255,.3);background:rgba(47,107,255,.10)}.th-kind.todos-done,.th-kind.goal-done{color:#2f7d0d;border-color:rgba(56,158,13,.3);background:rgba(56,158,13,.10)}.th-kind.turn-end{color:#0e7490;border-color:rgba(14,116,144,.3);background:rgba(14,116,144,.10)}.th-sess{font-weight:500;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.5px}.th-row.selected .th-sess{color:var(--dsw-alias-label-primary,#1f2329)}.th-time{flex:none;color:var(--dsw-alias-label-tertiary,#8a8f99);font-size:11px}.th-summary{color:var(--dsw-alias-label-tertiary,#8a8f99);font-size:12px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.th-cwd{color:var(--dsw-alias-label-tertiary,#8a8f99);font-size:11px;opacity:.8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.th-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap}/* ====== 空态 / 加载 ====== */.th-empty{padding:40px 16px;text-align:center;color:var(--dsw-alias-label-tertiary,#8a8f99);font-size:12.5px}.th-detail-empty{flex:1;display:flex;align-items:center;justify-content:center}/* ====== 详情区 ====== */.th-detail{display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden}.th-detail-head{display:flex;align-items:center;gap:8px;padding:14px 18px 6px}.th-detail-head .th-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px}.th-detail-meta{color:var(--dsw-alias-label-tertiary,#8a8f99);font-size:11.5px;padding:0 18px 10px;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.08))}.th-detail-sec{padding:10px 18px;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.06));display:flex;flex-direction:column;gap:8px}.th-detail-scroll{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain}.th-side-h{font-weight:600;font-size:12px;color:var(--dsw-alias-label-secondary,#5c6066)}.th-detail-foot{flex:none;border-top:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.1));padding:10px 18px 12px;display:flex;flex-direction:column;gap:8px;background:var(--dsw-specific-menu,#fff)}.th-detail-footbtns{display:flex;gap:6px;justify-content:flex-end}/* ====== 对话轮次（聊天气泡式） ====== */.th-turn{display:flex;flex-direction:column;gap:4px}.th-turn + .th-turn{margin-top:10px;padding-top:10px;border-top:1px dashed var(--dsw-alias-border-l1,rgba(0,0,0,.08))}.th-turn-q{font-weight:600;font-size:12.5px;color:var(--dsw-alias-label-primary,#1f2329);overflow-wrap:anywhere;white-space:pre-wrap}.th-turn-a{font-size:12.5px;color:var(--dsw-alias-label-secondary,#5c6066);overflow-wrap:anywhere;white-space:pre-wrap}.th-turn-role{font-size:10.5px;font-weight:600;letter-spacing:.4px;text-transform:uppercase}.th-turn-role.u{color:#2f6bff}.th-turn-role.a{color:#0e7490}/* ====== 问题卡 / 选项 ====== */.th-q{display:flex;flex-direction:column;gap:6px}.th-q-text{font-weight:600;font-size:12.5px;overflow-wrap:anywhere}.th-q-detail{white-space:pre-wrap;background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.04));border-radius:8px;padding:8px;font-size:12px;max-height:260px;overflow:auto;overflow-wrap:anywhere}.th-opts{display:flex;flex-wrap:wrap;gap:6px}.th-opt{border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.16));border-radius:8px;padding:4px 10px;cursor:pointer;font-size:12px;background:transparent;color:inherit;transition:all .12s}.th-opt:hover{border-color:#2f6bff;color:#2f6bff}.th-opt.sel{border-color:#2f6bff;background:rgba(47,107,255,.12);color:#2f6bff;font-weight:600}.th-custom{width:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.14));border-radius:8px;padding:6px 8px;font-size:12px;background:transparent;color:inherit}.th-hint{color:var(--dsw-alias-label-tertiary,#8a8f99);font-size:11.5px}.th-err{color:var(--dsw-alias-state-error-primary,#d4380d);font-size:12px}.th-ok{color:#2f7d0d;font-size:12px}/* ====== 回复框 ====== */.th-sgroup{margin-bottom:10px}.th-sgroup-head{display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:8px;cursor:pointer;background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.04));font-size:12px}.th-sgroup-head:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.07))}.th-sgroup-head.unread .th-sgroup-title{font-weight:700}.th-sgroup-arrow{color:var(--dsw-alias-label-tertiary,#8a8f99);font-size:10px;width:12px}.th-sgroup-title{font-weight:600;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.th-sgroup-count{color:var(--dsw-alias-label-tertiary,#8a8f99);font-size:11px}.th-sgroup-prog{color:#389e0d;font-size:11px}.th-badge{background:#e5484d;color:#fff;border-radius:999px;font-size:10px;padding:0 5px;min-width:16px;text-align:center;line-height:16px;font-weight:700}.th-sgroup-latest{padding:4px 8px 6px;font-size:11.5px;color:var(--dsw-alias-label-tertiary,#8a8f99);overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;cursor:pointer}.th-dayhead{padding:8px 6px 2px;font-size:11px;font-weight:600;color:var(--dsw-alias-label-tertiary,#8a8f99);letter-spacing:.4px}.th-replyrow{display:flex;flex-direction:column;gap:6px}.th-replyline{display:flex;gap:6px;align-items:flex-start}.th-replyline .th-dlg-input{flex:1;resize:vertical;min-height:46px;max-height:160px}.th-dlg-input{width:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.16));border-radius:8px;padding:7px 9px;font-size:12.5px;font-family:inherit;background:var(--dsw-specific-input-major,transparent);color:inherit;outline:none}.th-dlg-input:focus{border-color:#2f6bff}.th-imgrow{display:flex;flex-wrap:wrap;gap:6px}.th-imgchip{font-size:11px;background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05));border-radius:6px;padding:2px 6px;display:inline-flex;align-items:center;gap:4px}.th-imgx{border:none;background:none;cursor:pointer;color:inherit;padding:0 2px}.th-imgbtn{cursor:pointer;display:inline-flex;align-items:center;justify-content:center;user-select:none}/* ====== 看板 ====== */.th-board{flex:1;display:flex;gap:10px;padding:12px 14px 16px;overflow-x:auto;align-items:flex-start;min-height:0}.th-col{flex:0 0 264px;width:264px;border-radius:10px;padding:8px;display:flex;flex-direction:column;gap:6px;max-height:100%;overflow-y:auto;min-height:140px;background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.035));transition:outline-color .12s;outline:2px solid transparent;outline-offset:-2px}.th-col-over{outline-color:#2f6bff;background:rgba(47,107,255,.06)}.th-col-head{font-weight:600;font-size:12.5px;padding:2px 6px 6px;display:flex;justify-content:space-between;align-items:center;gap:6px}.th-coltitle{display:inline-flex;align-items:center;gap:4px;min-width:0}.th-colcount{color:var(--dsw-alias-label-tertiary,#8a8f99);font-weight:400;font-size:11.5px}.th-colarrow{border:none;background:none;cursor:pointer;color:inherit;font-size:11px;padding:0 2px}.th-colbtn{border:none;background:none;cursor:pointer;color:var(--dsw-alias-label-tertiary,#8a8f99);font-size:11px;padding:2px 4px;border-radius:4px}.th-colbtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.08));color:var(--dsw-alias-label-primary,#1f2329)}.th-colempty{color:var(--dsw-alias-label-tertiary,#8a8f99);text-align:center;font-size:12px;padding:12px 0;opacity:.7}.th-col-todo{background:rgba(138,143,153,.09)}.th-col-todo .th-col-head{box-shadow:inset 3px 0 0 #8a8f99}.th-col-progress{background:rgba(47,107,255,.07)}.th-col-progress .th-col-head{box-shadow:inset 3px 0 0 #2f6bff}.th-col-review{background:rgba(229,138,61,.10)}.th-col-review .th-col-head{box-shadow:inset 3px 0 0 #e5893d}.th-col-blocked{background:rgba(229,72,77,.08)}.th-col-blocked .th-col-head{box-shadow:inset 3px 0 0 #e5484d}.th-col-done{background:rgba(56,158,13,.08)}.th-col-done .th-col-head{box-shadow:inset 3px 0 0 #389e0d}.th-col-archived{background:rgba(107,114,128,.07)}.th-col-archived .th-col-head{box-shadow:inset 3px 0 0 #6b7280}.th-bcard{border:0.5px solid var(--dsw-alias-border-l1,rgba(0,0,0,.12));border-left-width:3px;border-radius:8px;padding:8px 10px;display:flex;flex-direction:column;gap:5px;cursor:grab;background:var(--dsw-specific-menu,#fff);transition:box-shadow .12s,transform .12s}.th-bcard:hover{box-shadow:0 2px 8px rgba(0,0,0,.10)}.th-bcard.th-dragging{transform:rotate(1.5deg);opacity:.85;box-shadow:0 10px 24px rgba(0,0,0,.22);cursor:grabbing}.th-bcard:active{cursor:grabbing}.th-bcard.running{border-color:#2f6bff}.th-bc-todo{border-left-color:#8a8f99}.th-bc-progress{border-left-color:#2f6bff}.th-bc-review{border-left-color:#e5893d}.th-bc-blocked{border-left-color:#e5484d}.th-bc-done{border-left-color:#389e0d}.th-bc-archived{border-left-color:#6b7280}.th-bcard-top{display:flex;align-items:flex-start;gap:6px;min-width:0}.th-bsess{font-weight:600;font-size:12.5px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;line-height:1.35}.th-run{color:#2f6bff;font-size:10.5px;flex:none;animation:th-pulse 1.6s ease-in-out infinite}@keyframes th-pulse{0%,100%{opacity:1}50%{opacity:.45}}.th-bmeta{color:var(--dsw-alias-label-tertiary,#8a8f99);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.th-bprog{height:4px;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.08));overflow:hidden}.th-bprog-in{height:100%;background:#389e0d;border-radius:999px;transition:width .3s}.th-bprogtext{color:var(--dsw-alias-label-tertiary,#8a8f99);font-size:11px}.th-bactions{display:flex;gap:6px;flex-wrap:wrap}.th-bcard-mini{border:0.5px solid var(--dsw-alias-border-l1,rgba(0,0,0,.1));border-left-width:3px;border-radius:6px;padding:4px 8px;font-size:11.5px;display:flex;align-items:center;gap:6px;cursor:pointer;min-width:0}.th-bcard-mini:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.05))}.th-bcard-mini .th-bsess{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;-webkit-line-clamp:unset;display:block;font-weight:500}/* ====== 工作区筛选下拉 ====== */.th-wsdrop{position:relative}.th-wsmenu{position:absolute;top:calc(100% + 4px);right:0;background:var(--dsw-specific-menu,#fff);border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.15));border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.16);padding:6px;z-index:60;max-height:280px;overflow:auto;display:flex;flex-direction:column;gap:2px;min-width:240px}.th-wsitem{display:flex;align-items:center;gap:8px;font-size:12.5px;padding:5px 6px;cursor:pointer;border-radius:6px}.th-wsitem:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06))}/* ====== 对话框 / 侧边栏 ====== */.th-mask{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;z-index:9998}.th-dialog{background:var(--dsw-specific-menu,#fff);border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.15));border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.22);padding:16px 18px;width:min(460px,90vw);display:flex;flex-direction:column;gap:10px}.th-dlg-title{font-weight:600;font-size:14px}.th-dlg-note{color:#b25e09;background:rgba(229,138,61,.12);border:1px solid rgba(229,138,61,.35);border-radius:8px;padding:6px 10px;font-size:12px}.th-dlg-label{font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f99)}.th-dlg-actions{display:flex;justify-content:flex-end;gap:8px}.th-sidepanel{position:fixed;top:0;right:0;height:100vh;width:min(480px,94vw);background:var(--dsw-specific-menu,#fff);border-left:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.15));box-shadow:-12px 0 40px rgba(0,0,0,.2);z-index:9997;display:flex;flex-direction:column;padding:14px 16px;gap:10px;overflow:hidden;box-sizing:border-box}.th-side-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.th-side-meta{color:var(--dsw-alias-label-tertiary,#8a8f99);font-size:11.5px}.th-side-section{border-top:1px dashed var(--dsw-alias-border-l1,rgba(0,0,0,.1));padding-top:8px;display:flex;flex-direction:column;gap:6px}.th-side-q{border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.1));border-radius:8px;padding:8px;display:flex;flex-direction:column;gap:6px}.th-side-ctx{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain}.th-side-compose{flex:none}.th-side-foot{flex:none;display:flex;justify-content:flex-end}.th-toasts{position:fixed;bottom:20px;right:20px;display:flex;flex-direction:column;gap:8px;z-index:10001;align-items:flex-end}.th-toast{background:var(--dsw-alias-label-primary,#1f2329);color:var(--dsw-specific-menu,#fff);border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:12px;box-shadow:0 6px 24px rgba(0,0,0,.25);font-size:12.5px;animation:th-toast-in .18s ease-out}.th-toast .th-toastmsg{max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.th-toast button{border:none;background:none;color:var(--dsw-alias-label-tertiary,#9fb0c8);cursor:pointer;font-size:12px;font-weight:600;padding:2px 4px;border-radius:6px}.th-toast button:hover{color:#fff;text-decoration:underline}@keyframes th-toast-in{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}.th-row.selectmode{cursor:pointer}.th-row.selected .th-check{visibility:visible}.th-check{width:14px;height:14px;accent-color:#2f6bff;cursor:pointer;flex:none;visibility:hidden}.th-row:hover .th-check,.th-check.on{visibility:visible}.th-selectbar{display:flex;align-items:center;gap:8px;padding:6px 10px;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.08));font-size:12px;flex:none}.th-selectbar .th-btn{padding:3px 8px;font-size:11.5px}.th-filtermenu{position:absolute;top:calc(100% + 4px);left:0;background:var(--dsw-specific-menu,#fff);border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.15));border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.16);padding:4px;z-index:60;min-width:180px;display:flex;flex-direction:column}.th-filteritem{border:none;background:none;cursor:pointer;color:inherit;font-size:12.5px;padding:6px 10px;text-align:left;border-radius:6px;display:flex;align-items:center;justify-content:space-between;gap:8px}.th-filteritem:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06))}.th-filteritem.on{font-weight:600;color:#2f6bff}.th-kbd{font-size:10px;border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.2));border-radius:4px;padding:0 4px;color:var(--dsw-alias-label-tertiary,#8a8f99);font-family:monospace;margin-left:6px}.th-sidepanel{padding-bottom:0}.th-ctxmenu{position:fixed;background:var(--dsw-specific-menu,#fff);border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.15));border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.18);padding:4px;z-index:10000;min-width:140px;display:flex;flex-direction:column}.th-ctxitem{border:none;background:none;cursor:pointer;color:inherit;font-size:12.5px;padding:6px 12px;text-align:left;border-radius:6px}.th-ctxitem:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.07))}.th-wstag{flex:none;font-size:10px;line-height:1;padding:2px 5px;border-radius:4px;background:var(--dsw-alias-bg-secondary,rgba(0,0,0,.06));color:var(--dsw-alias-label-tertiary,#8a8f99);border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.08));margin-left:6px}.th-search{flex:0 1 200px;min-width:0;border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,.14));background:transparent;color:inherit;font-size:12.5px;border-radius:6px;padding:4px 9px;outline:none}.th-search:focus{border-color:#2f6bff}.th-search::placeholder{color:var(--dsw-alias-label-tertiary,#8a8f99)}.th-archhint{color:var(--dsw-alias-label-tertiary,#8a8f99);font-size:12px;padding:8px 6px;text-align:center;border-top:1px dashed var(--dsw-alias-border-l1,rgba(0,0,0,.08))}.th-iconbtn{display:inline-flex;align-items:center;justify-content:center;gap:5px;border:none;background:none;cursor:pointer;color:var(--dsw-alias-label-secondary,#5c6066);width:28px;height:28px;border-radius:7px;flex:none;transition:background .12s,color .12s;position:relative}.th-iconbtn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,.06));color:var(--dsw-alias-label-primary,#1f2329)}.th-iconbtn.active{color:#2f6bff;background:#eef3ff}.th-iconbtn-tag{position:absolute;top:calc(100% + 1px);left:50%;transform:translateX(-50%);font-size:9.5px;font-weight:700;line-height:1;white-space:nowrap;color:#2f6bff;background:#eef3ff;border-radius:4px;padding:2px 4px;pointer-events:none}";
		const tagId = "@local/dsh-task-hub/inbox.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@local/dsh-task-hub";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion

		//#region persistent per-browser state (read / archived 标记；完成事件由 Node 半侧持久化)
		function pruneUiState(st) {
			const cutoff = Date.now() - 30 * 86400000;
			for (const map of [st.read, st.archived]) {
				for (const k of Object.keys(map)) {
					if (typeof map[k] === "number" && map[k] < cutoff) delete map[k];
				}
			}
			return st;
		}
		function blankUiState() { return { read: {}, archived: {}, boardOverride: {}, boardArchivedCollapsed: true, boardArchivedHidden: false, boardWsFilter: [], muted: {}, repliedSessions: {}, groupBySession: true }; }
		function loadUiState() {
			try {
				const raw = JSON.parse(localStorage.getItem(LS_KEY) ?? "null");
				if (raw && typeof raw === "object") {
					return pruneUiState({
						read: raw.read ?? {},
						archived: raw.archived ?? {},
						boardOverride: raw.boardOverride ?? {},
						boardArchivedCollapsed: raw.boardArchivedCollapsed !== false,
						boardArchivedHidden: raw.boardArchivedHidden === true,
						boardWsFilter: Array.isArray(raw.boardWsFilter) ? raw.boardWsFilter : [],
						muted: raw.muted ?? {},
						repliedSessions: raw.repliedSessions ?? {},
						groupBySession: raw.groupBySession !== false,
					});
				}
			} catch {}
			return blankUiState();
		}
		let uiState = loadUiState();
		function persistUiState() {
			try { localStorage.setItem(LS_KEY, JSON.stringify(uiState)); } catch {}
		}
		const uiStore = {
			version: 0,
			listeners: new Set(),
			getSnapshot: () => uiStore.version,
			subscribe(listener) {
				uiStore.listeners.add(listener);
				return () => uiStore.listeners.delete(listener);
			},
			bump() {
				uiStore.version++;
				for (const l of [...uiStore.listeners]) l();
			}
		};
		//#endregion

		//#region workspace archive sync（工作区归档状态同步）
		/**
		 * DSH 工作区的"归档对话"是 registry 全局集合（archivedSessionIds），由
		 * workspace/follow 流实时推送、shell 的 ctx.workspaces.list 服务维护快照；
		 * session/list 行本身不带归档标记。这里订阅该快照得到权威归档集合，供两处共用：
		 * - 看板：工作区已归档 > 手动拖拽覆盖 > 自然推导（取消归档后卡片自动回推导列）
		 * - 收件箱：条目按所属会话同步归档/取消归档（与本地手动归档标记取并集）
		 */
		let wsArchivedSet = new Set();
		function wsArchivedSyncFromSnapshot(wsSnap) {
			const ids = wsSnap && Array.isArray(wsSnap.archivedSessionIds) ? wsSnap.archivedSessionIds : [];
			const next = new Set(ids.map(String));
			const changed = next.size !== wsArchivedSet.size || [...next].some((id) => !wsArchivedSet.has(id));
			wsArchivedSet = next;
			return changed;
		}
		function isWsArchived(sessionId) { return wsArchivedSet.has(String(sessionId)); }
		//#endregion
		let snapshot = { status: "loading", entries: [], rows: [], nodeState: null, nodeContexts: null, error: undefined, updatedAt: 0 };
		const listeners = new Set();
		function setSnapshot(next) {
			snapshot = next;
			for (const l of [...listeners]) l();
		}
		const store = {
			getSnapshot: () => snapshot,
			subscribe(listener) {
				listeners.add(listener);
				return () => listeners.delete(listener);
			}
		};
		//#endregion

		//#region entry computation
		/**
		 * 待确认类条目：由 userQuestions 投影实时派生（open/continued 即存在）。
		 * 完成类条目（todos-done / goal-done）：投影是瞬态的（todo 清单在下一轮开始即清空），
		 * 因此由 detectTransitions 在状态迁移瞬间写入持久事件存储，再与实时条目合并。
		 */
		function deriveLiveEntries(items) {
			const entries = [];
			for (const row of items ?? []) {
				if (!row || typeof row.sessionId !== "string") continue;
				if (row.blank) continue;
				const sid = row.sessionId;
				const values = row.projections?.values ?? {};
				const title = (typeof values.title === "string" && values.title) || "未命名会话";
				const cwd = typeof row.cwd === "string" && row.cwd ? row.cwd : "";
				const time = typeof row.updatedAt === "number" ? row.updatedAt : 0;
				const base = { sessionId: sid, title, cwd, time, running: !!row.running, subagent: row.origin === "subagent" };
				const uqRaw = values.userQuestions;
				const uq = uqRaw && Array.isArray(uqRaw.active)
					? uqRaw
					: (uqRaw && uqRaw.questions && Array.isArray(uqRaw.questions.active) ? uqRaw.questions : null);
				if (uq) {
					for (const call of uq.active) {
						if (!call || typeof call.callId !== "string") continue;
						const questions = Array.isArray(call.questions) ? call.questions : [];
						const planQ = questions.find((q) => q && q.intent && q.intent.kind === "plan-review");
						entries.push({
							...base,
							id: sid + "/q/" + call.callId,
							kind: planQ ? "plan-review" : "question",
							callId: call.callId,
							state: call.state === "continued" ? "continued" : "open",
							questions,
							plan: planQ ? { approve: planQ.intent.approve, detail: typeof planQ.detail === "string" ? planQ.detail : "" } : undefined
						});
					}
				}
			}
			return entries;
		}

		/** todo 清单状态指纹（Node 半侧拥有迁移检测；此处仅用于浏览器兜底）。 */
		function todoState(todos) {
			if (!Array.isArray(todos) || todos.length === 0) return null;
			return {
				hash: todos.map((t) => (t && t.content ? t.content + ":" + t.status : "?")).join("|"),
				allDone: todos.every((t) => t && t.status === "completed"),
				total: todos.length,
			};
		}

		/**
		 * Node 半侧（宿主进程常驻）把完成事件 + 轮次摘要持久化在
		 * ~/.dsh/storages/task-hub/（events.json + contexts.json），浏览器经鉴权 /api/file 通道读取。
		 */
		function homeBase(ctx) {
			const hf = ctx.remote?.hostFacts;
			if (hf && typeof hf.home === "string" && hf.home) return hf.home;
			return "C:/Users/sunsh"; // 个人部署回退；见 README
		}
		let nodeEventsCache = null;
		let nodeContextsCache = null;
		/** Toast 队列（multica toast 模式）：{id, msg, undo}，5 秒自动消失，可撤销。 */
		const toastStore = {
			list: [],
			listeners: new Set(),
			nextId: 1,
			subscribe(l) { toastStore.listeners.add(l); return () => toastStore.listeners.delete(l); },
			getSnapshot: () => toastStore.list,
			emit() { const cur = toastStore.list; for (const l of [...toastStore.listeners]) l(cur); },
			push(msg, undo) {
				const id = toastStore.nextId++;
				toastStore.list = [...toastStore.list, { id, msg, undo }];
				toastStore.emit();
				setTimeout(() => toastStore.dismiss(id), 5000);
			},
			dismiss(id) { toastStore.list = toastStore.list.filter((t) => t.id !== id); toastStore.emit(); },
		};
		async function fetchNodeEvents(ctx) {
			const file = homeBase(ctx).replace(/\\/g, "/") + "/.dsh/storages/task-hub/events.json";
			try {
				const res = await fetch("/api/file?path=" + encodeURIComponent(file));
				if (!res.ok) return nodeEventsCache;
				const j = await res.json();
				if (j && j.events) { nodeEventsCache = j; return j; }
				return nodeEventsCache;
			} catch {
				return nodeEventsCache; // 网络失败沿用上次快照
			}
		}
		async function fetchNodeContexts(ctx) {
			const file = homeBase(ctx).replace(/\\/g, "/") + "/.dsh/storages/task-hub/contexts.json";
			try {
				const res = await fetch("/api/file?path=" + encodeURIComponent(file));
				if (!res.ok) return nodeContextsCache;
				const j = await res.json();
				if (j && typeof j === "object") { nodeContextsCache = j; return j; }
				return nodeContextsCache;
			} catch {
				return nodeContextsCache;
			}
		}

		/** 合并 Node 持久事件与实时条目并排序（按 read/archived 过滤）。 */
		function mergeEntries(live, nodeState) {
			const stored = Object.entries((nodeState && nodeState.events) ?? {}).map(([id, e]) => ({ id, kind: e.kind, sessionId: e.sessionId, title: e.title, cwd: e.cwd, time: e.time, running: false, subagent: false, todos: e.todos, total: e.total, objective: e.objective, turn: e.turn, prompt: e.prompt, response: e.response }));
			const all = [...stored, ...live];
			const order = { "plan-review": 0, question: 1, "turn-end": 2, "todos-done": 3, "goal-done": 4 };
			all.sort((a, b) => (order[a.kind] - order[b.kind]) || (b.time - a.time));
			return all;
		}
		/**
		 * 通知订阅策略（multica 订阅语义）：
		 * - 静音会话：「已回复/待查看」类动态不投递（问题/完成仍可见）
		 * - turn-end 仅对"活跃任务会话"投递：通过收件箱回信驱动的、或有清单/goal/待确认问题的
		 */
		function filterNotifications(entries, rows, uiState) {
			const valuesBySid = {};
			for (const row of rows ?? []) {
				if (row && typeof row.sessionId === "string") valuesBySid[row.sessionId] = row.projections?.values ?? {};
			}
			return (entries ?? []).filter((e) => {
				if (uiState.muted && uiState.muted[e.sessionId] && e.kind === "turn-end") return false;
				if (e.kind !== "turn-end") return true;
				if (uiState.repliedSessions && uiState.repliedSessions[e.sessionId]) return true;
				const v = valuesBySid[e.sessionId] ?? {};
				const hasTodos = Array.isArray(v.todos) && v.todos.length > 0;
				const hasGoal = !!(v.goal && v.goal.goal);
				const uq = normalizeUq(v);
				const hasQ = !!(uq && uq.active.length > 0);
				return hasTodos || hasGoal || hasQ;
			});
		}
		/** 条目已归档 = 本地手动归档标记 或 所属会话已在工作区归档（同步语义，取并集）。 */
		function isEntryArchived(entry) { return !!(uiState.archived && uiState.archived[entry.id]) || isWsArchived(entry.sessionId); }
		function isUnread(entry) { return !uiState.read[entry.id] && !isEntryArchived(entry); }
		function unreadCount(entries) { return (entries ?? []).filter(isUnread).length; }
		//#endregion

		//#region helpers
		const BOARD_COLS = [["todo", "待办"], ["progress", "进行中"], ["review", "待确认"], ["blocked", "阻塞中"], ["done", "已完成"], ["archived", "已归档"]];
		/**
		 * 交接决策表：目标列 → 需要执行的动作（参考 multica 工作流交接语义）。
		 * prompt = 向会话发送指令唤醒/收尾智能体；cancel = 取消运行中的回合；mark = 仅调整状态。
		 */
		const HANDOFF_DEFAULTS = {
			progress: "请继续处理你的任务清单，逐项完成。",
			done: "请收尾当前工作：确保任务清单全部完成，并简要总结结论。",
		};
		function resolveHandoff(fromStatus, toStatus, row) {
			if (toStatus === fromStatus) return { kind: "noop" };
			if (toStatus === "archived") {
				return { kind: "mark", note: row.running ? "会话正在运行，建议先拖到「待办」取消运行后再归档" : undefined };
			}
			if (toStatus === "progress") {
				if (row.running) return { kind: "mark", note: "会话已在运行中，本次仅调整列位置" };
				return { kind: "prompt", message: HANDOFF_DEFAULTS.progress };
			}
			if (fromStatus === "progress" && toStatus === "todo") {
				return row.running
					? { kind: "cancel", note: "智能体正在工作：取消后当前回合立即中止（已完成部分保留）" }
					: { kind: "mark" };
			}
			if (fromStatus === "progress" && toStatus === "done") {
				return { kind: "prompt", message: HANDOFF_DEFAULTS.done };
			}
			if (fromStatus === "review" && toStatus !== "review") {
				return { kind: "mark", note: "注意：会话仍有未回答的问题，在回答之前智能体会一直等待" };
			}
			return { kind: "mark" };
		}
		/**
		 * 看板状态推导（首个命中生效）：
		 * 工作区已归档（workspace/follow 同步）> 手动拖拽覆盖 > 待确认（有提问/计划待审）
		 * > 阻塞中（goal blocked）> 进行中（会话运行中）
		 * > 已完成（实时清单全完成 / Node 记忆 allDone / goal complete）> 待办（默认）。
		 */
		function deriveBoardStatus(row, nodeState, uiState) {
			const sid = row.sessionId;
			// 工作区已归档（同步自 ctx.workspaces.list）：最高优先级，压过手动覆盖与自然推导；
			// 工作区侧取消归档后卡片自动回到推导列
			if (isWsArchived(sid)) return "archived";
			const override = uiState.boardOverride[sid];
			if (override) return override;
			const values = row.projections?.values ?? {};
			const uqRaw = values.userQuestions;
			const uq = uqRaw && Array.isArray(uqRaw.active)
				? uqRaw
				: (uqRaw && uqRaw.questions && Array.isArray(uqRaw.questions.active) ? uqRaw.questions : null);
			if (uq && uq.active.length > 0) return "review";
			const goal = values.goal && values.goal.goal;
			if (goal && goal.phase === "blocked") return "blocked";
			if (row.running) return "progress";
			const todos = values.todos;
			if (Array.isArray(todos) && todos.length > 0 && todos.every((t) => t && t.status === "completed")) return "done";
			const lt = nodeState?.lastTodos?.[sid];
			if (lt && lt.allDone && !row.running) return "done";
			const gl = nodeState?.lastGoal?.[sid];
			if (gl && gl.phase === "complete") return "done";
			return "todo";
		}
		function fmtTime(ms) {
			if (!ms) return "";
			const d = new Date(ms);
			const now = new Date();
			const pad = (n) => String(n).padStart(2, "0");
			const hm = pad(d.getHours()) + ":" + pad(d.getMinutes());
			if (d.toDateString() === now.toDateString()) return hm;
			const yesterday = new Date(now.getTime() - 86400000);
			if (d.toDateString() === yesterday.toDateString()) return "昨天 " + hm;
			return pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + hm;
		}
		function shortCwd(cwd) {
			if (!cwd) return "";
			const parts = cwd.replace(/[\\/]+$/, "").split(/[\\/]/);
			return parts.slice(-2).join("/");
		}
		/** 日期分组（multica list 模式）：今天 / 昨天 / 更早，正序输出。 */
		function dayGroups(items) {
			const now = new Date();
			const todayStr = now.toDateString();
			const yestStr = new Date(now.getTime() - 86400000).toDateString();
			const buckets = { today: [], yesterday: [], earlier: [] };
			for (const e of items ?? []) {
				const d = new Date(e.time ?? 0);
				const ds = d.toDateString();
				if (ds === todayStr) buckets.today.push(e);
				else if (ds === yestStr) buckets.yesterday.push(e);
				else buckets.earlier.push(e);
			}
			const groups = [];
			if (buckets.today.length) groups.push({ label: "今天", items: buckets.today });
			if (buckets.yesterday.length) groups.push({ label: "昨天", items: buckets.yesterday });
			if (buckets.earlier.length) groups.push({ label: "更早", items: buckets.earlier });
			return groups;
		}
		/** 搜索：大小写不敏感子串匹配；空/空白查询 = 全部通过。 */
		function matchQuery(hay, needle) {
			const q = String(needle ?? "").trim().toLowerCase();
			if (!q) return true;
			return String(hay ?? "").toLowerCase().includes(q);
		}
		/** 会话可搜索文本：标题 + 清单内容 + 对话轮次全文（nodeContexts 优先，turnOutline 兜底）。 */
		function sessionSearchText(row, nodeContexts) {
			const parts = [];
			const values = row?.projections?.values ?? {};
			if (values.title) parts.push(String(values.title));
			if (row && typeof row.title === "string") parts.push(row.title);
			const todos = Array.isArray(values.todos) ? values.todos : [];
			for (const t of todos) if (t && t.content) parts.push(String(t.content));
			const outline = values.turnOutline && Array.isArray(values.turnOutline.turns) ? values.turnOutline.turns : [];
			for (const tn of outline) {
				if (tn && typeof tn.prompt === "string") parts.push(tn.prompt);
				if (tn && typeof tn.response === "string") parts.push(tn.response);
			}
			const ctx = nodeContexts && nodeContexts[row && row.sessionId];
			if (ctx && Array.isArray(ctx.turns)) {
				for (const tn of ctx.turns) {
					if (tn && typeof tn.prompt === "string") parts.push(tn.prompt);
					if (tn && typeof tn.response === "string") parts.push(tn.response);
				}
			}
			return parts.join("\n");
		}
		/** 收件箱条目搜索：标题 + 摘要字段 + 所属会话全文。 */
		function filterEntriesByQuery(entries, query, rows, nodeContexts) {
			const q = String(query ?? "").trim();
			if (!q) return entries;
			return (entries ?? []).filter((e) => {
				if (matchQuery(e.title, q)) return true;
				if (e.kind === "todos-done" || e.kind === "goal-done" || e.kind === "turn-end") {
					if (matchQuery(e.prompt, q) || matchQuery(e.response, q) || matchQuery(e.objective, q)) return true;
				}
				for (const c of e.questions ?? []) if (c && matchQuery(c.question, q)) return true;
				const row = (rows ?? []).find((x) => x && x.sessionId === e.sessionId);
				if (row && matchQuery(sessionSearchText(row, nodeContexts), q)) return true;
				return false;
			});
		}
		/** 看板卡片搜索：标题 + 所属会话全文（含清单内容）。 */
		function filterRowsByQuery(rows, query, nodeContexts) {
			const q = String(query ?? "").trim();
			if (!q) return rows;
			return (rows ?? []).filter((row) => {
				if (!row) return false;
				const values = row.projections?.values ?? {};
				if (matchQuery(values.title ?? row.title, q)) return true;
				return matchQuery(sessionSearchText(row, nodeContexts), q);
			});
		}
		function summaryOf(entry) {
			if (entry.kind === "plan-review") {
				const detail = entry.plan?.detail ?? "";
				return "计划待审：" + detail.slice(0, 120).replace(/\s+/g, " ");
			}
			if (entry.kind === "question") {
				const first = entry.questions[0];
				const head = first ? (first.header ? first.header + "：" : "") + first.question : "（空问题批次）";
				return entry.questions.length > 1 ? head + " 等 " + entry.questions.length + " 个问题" : head;
			}
			if (entry.kind === "todos-done") return "全部任务已完成（共 " + (entry.todos ? entry.todos.length : entry.total ?? 0) + " 项）";
			if (entry.kind === "goal-done") return "目标已完成：" + entry.objective;
			if (entry.kind === "turn-end") {
				const resp = String(entry.response ?? "").replace(/\s+/g, " ").trim();
				return "任务有新进展：" + (resp ? resp.slice(0, 140) : "展开条目查看上下文");
			}
			return "";
		}
		//#endregion

		//#region components
		const KIND_LABEL = { "plan-review": "计划待审", question: "待确认", "todos-done": "任务完成", "goal-done": "目标完成", "turn-end": "待查看" };
		function KindBadge({ kind, t }) {
			const label = KIND_LABEL[kind] ?? (t && t("kind." + kind)) ?? kind;
			return h("span", { className: "th-kind " + kind }, label);
		}

		function QuestionCard({ entry, actions, t }) {
			const questions = entry.questions ?? [];
			const canAnswer = entry.state === "continued";
			const [sel, setSel] = React.useState(() => {
				const init = {};
				for (const q of questions) init[q.id] = [];
				return init;
			});
			const [custom, setCustom] = React.useState({});
			const [pending, setPending] = React.useState(false);
			const [done, setDone] = React.useState(false);
			const [err, setErr] = React.useState(null);
			const toggle = (qid, label, multi) => {
				setSel((prev) => {
					const cur = prev[qid] ?? [];
					let next;
					if (multi) next = cur.includes(label) ? cur.filter((x) => x !== label) : [...cur, label];
					else next = cur.includes(label) ? [] : [label];
					return { ...prev, [qid]: next };
				});
			};
			const submit = async () => {
				setPending(true);
				setErr(null);
				const answers = questions.map((q) => {
					const a = { id: q.id, selected: sel[q.id] ?? [] };
					const c = (custom[q.id] ?? "").trim();
					if (c) a.custom = c;
					return a;
				});
				const res = await actions.answer(entry.sessionId, entry.callId, answers);
				if (res && res.ok) {
					setDone(true);
					actions.markRead(entry.id);
					actions.refresh();
				} else {
					setErr((res && res.error && (res.error.message || res.error.code)) || "提交失败");
				}
				setPending(false);
			};
			const isPlan = entry.kind === "plan-review";
			const planQ = isPlan ? questions.find((q) => q && q.intent && q.intent.kind === "plan-review") : null;
			const approve = async () => {
				if (!planQ) return;
				setPending(true);
				setErr(null);
				const res = await actions.answer(entry.sessionId, entry.callId, [
					{ id: planQ.id, selected: [entry.plan.approve] }
				]);
				if (res && res.ok) {
					setDone(true);
					actions.markRead(entry.id);
					actions.refresh();
				} else {
					setErr((res && res.error && (res.error.message || res.error.code)) || "提交失败");
				}
				setPending(false);
			};
			return h("div", { className: "th-detail", onClick: (e) => e.stopPropagation() },
				h("div", { className: "th-hint" }, canAnswer ? t("state.continuedHint") : t("state.openHint")),
				questions.map((q) => {
					const opts = Array.isArray(q.options) ? q.options : [];
					const selected = sel[q.id] ?? [];
					return h("div", { className: "th-q", key: q.id },
						q.header ? h("span", { className: "th-hint" }, q.header) : null,
						h("div", { className: "th-q-text" }, q.question),
						q.detail && !isPlan ? h("div", { className: "th-q-detail" }, q.detail) : null,
						isPlan && entry.plan?.detail ? h("div", { className: "th-q-detail" }, entry.plan.detail) : null,
						opts.length > 0 && !done
							? h("div", { className: "th-opts" },
								opts.map((o) => h("button", {
									key: o.label,
									type: "button",
									className: "th-opt" + (selected.includes(o.label) ? " sel" : ""),
									disabled: done,
									title: o.description ?? undefined,
									onClick: () => toggle(q.id, o.label, !!q.multiSelect)
								}, o.label)))
							: null,
						canAnswer && opts.length > 0 && !done
							? h("input", {
								className: "th-custom",
								placeholder: t("custom.placeholder"),
								value: custom[q.id] ?? "",
								onChange: (e) => setCustom((prev) => ({ ...prev, [q.id]: e.target.value }))
							})
							: null
					);
				}),
				done
					? h("div", { className: "th-ok" }, t("submitted"))
					: isPlan && canAnswer && planQ
						? h("div", { className: "th-actions" },
							h("button", { type: "button", className: "th-btn primary", disabled: pending, onClick: approve }, t("action.approve")),
							h("button", { type: "button", className: "th-btn", disabled: pending, onClick: () => actions.open(entry.sessionId) }, t("action.modify")))
						: canAnswer && (questions.every((q) => !(Array.isArray(q.options) && q.options.length) || (sel[q.id] ?? []).length > 0))
							? h("div", { className: "th-actions" },
								h("button", { type: "button", className: "th-btn primary", disabled: pending, onClick: submit }, t("action.submit")))
							: null,
					err ? h("div", { className: "th-err" }, err) : null
			);
		}

		function EntryRow({ entry, actions, selected, onSelect, t, snap, onContextMenu, selectMode, checked, onCheck }) {
			const unread = isUnread(entry);
			return h("div", {
				className: "th-row" + (unread ? " unread" : "") + (selected ? " selected" : "") + (selectMode ? " selectmode" : ""),
				onClick: () => onSelect(entry),
				onContextMenu: (e) => { if (onContextMenu) { e.preventDefault(); onContextMenu(entry, e); } },
			},
				h("div", { className: "th-row-top" },
					selectMode ? h("input", {
						type: "checkbox",
						className: "th-check" + (checked ? " on" : ""),
						checked: !!checked,
						onClick: (e) => e.stopPropagation(),
						onChange: (e) => { if (onCheck) onCheck(entry.id, e.target.checked); }
					}) : null,
					unread ? h("span", { className: "th-undot" }) : null,
					h(KindBadge, { kind: entry.kind, t }),
					h("span", { className: "th-sess", title: entry.title }, entry.title),
					entry.subagent ? h("span", { className: "th-hint" }, t("subagent")) : null,
					h("span", { className: "th-time" }, fmtTime(entry.time))
				),
				h("div", { className: "th-summary" }, summaryOf(entry)),
				entry.cwd ? h("div", { className: "th-cwd" }, shortCwd(entry.cwd)) : null
			);
		}

		/**
		 * 错误边界：组件渲染抛错时降级为错误信息，防止整页白屏。
		 * class 组件才能实现 componentDidCatch（函数组件无法做到）。
		 */
		class SafeBoundary extends React.Component {
			constructor(props) { super(props); this.state = { error: null }; }
			static getDerivedStateFromError(error) { return { error }; }
			componentDidCatch(error, info) { console.error("[task-hub] render error:", error, info); }
			render() {
				if (this.state.error) {
					return h("div", { className: "th-page" },
						h("div", { className: "th-empty" },
							"任务中心渲染出错：" + String((this.state.error && this.state.error.message) ?? this.state.error)));
				}
				return this.props.children;
			}
		}

		/** 页头图标按钮（14px SVG，视觉对齐 DSW 图标体系） */
		function Icon({ d, size = 14 }) {
			return h("svg", {
				width: size, height: size, viewBox: "0 0 24 24", fill: "none",
				stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round",
				"aria-hidden": true
			}, h("path", { d }));
		}
		const ICONS = {
			filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
			group: "M17 10h3V3h-3v3h-3v3h3v4h3v-3h-3v-3zM3 5h9v2H3V5zm0 6h9v2H3v-2zm0 6h9v2H3v-2z",
			flat: "M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z",
			multi: "M9 11.17l-3.59-3.59L4 9l5 5 11-11-1.41-1.41L9 11.17zM20 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6h2v12h14V6h-2z",
			refresh: "M17.65 6.35A7.95 7.95 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
			ws: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
		};
		function HeadIconBtn({ icon, title, active, onClick, label }) {
			return h("button", {
				type: "button",
				className: "th-iconbtn" + (active ? " active" : ""),
				title: title + (label ? "：" + label : ""),
				onClick
			},
				h(Icon, { d: icon }),
				label ? h("span", { className: "th-iconbtn-tag" }, label) : null
			);
		}

		/** multica 式收件箱：左列表列 + 右详情列（桌面布局）+ 筛选/批量/键盘/分组。 */
		function InboxPage(props) {
			const t = props.t;
			const snap = React.useSyncExternalStore(store.subscribe, store.getSnapshot);
			const uiV = React.useSyncExternalStore(uiStore.subscribe, uiStore.getSnapshot);
			void uiV;
			const [tab, setTab] = React.useState("all");
			const [selectedId, setSelectedId] = React.useState(null);
			const [groupBySession, setGroupBySession] = React.useState(() => uiState.groupBySession !== false);
			const [collapsedGroups, setCollapsedGroups] = React.useState({});
			const [ctxMenu, setCtxMenu] = React.useState(null);
			const [filterKind, setFilterKind] = React.useState("all"); // 类型筛选：all/question/todos-done/turn-end/goal-done/plan-review
			const [filterOpen, setFilterOpen] = React.useState(false);
			const [selectMode, setSelectMode] = React.useState(false);
			const [checked, setChecked] = React.useState({}); // id -> true
			const [searchQ, setSearchQ] = React.useState(""); // 搜索：标题 + 对话内容关键字
			const entries = snap.entries ?? [];
			// 静音会话：动态（turn-end）不投递；「待处理」不含待查看类（低优先级动态）
			const notMuted = (e) => !(uiState.muted && uiState.muted[e.sessionId] && e.kind === "turn-end");
			const actionNeeded = (e) => e.kind !== "turn-end";
			const visible = tab === "archive"
				? entries.filter((e) => isEntryArchived(e))
				: tab === "todo"
					? entries.filter((e) => isUnread(e) && actionNeeded(e) && notMuted(e))
					: tab === "all"
						? entries.filter((e) => !isEntryArchived(e) && notMuted(e))
						: entries.filter((e) => isUnread(e));
			const kindFiltered = filterKind === "all" ? visible : visible.filter((e) => e.kind === filterKind);
			const filtered = filterEntriesByQuery(kindFiltered, searchQ, snap.rows, snap.nodeContexts);
			const badge = {
				all: unreadCount(entries.filter((e) => !isEntryArchived(e) && notMuted(e))),
				todo: unreadCount(entries.filter((e) => !isEntryArchived(e) && actionNeeded(e) && notMuted(e))),
			};
			const kindCounts = {};
			for (const e of entries) { const k = isUnread(e) && notMuted(e) ? e.kind : null; if (k) kindCounts[k] = (kindCounts[k] ?? 0) + 1; }
			const selected = selectedId ? (visible.find((e) => e.id === selectedId) ?? entries.find((e) => e.id === selectedId) ?? null) : null;
			const selectedArchived = selected ? isEntryArchived(selected) : false;
			const checkedIds = Object.keys(checked).filter((k) => checked[k]);
			const ctxInfo = selected && snap.nodeContexts ? snap.nodeContexts[selected.sessionId] : null;
			let detailTurns = [];
			if (selected) {
				if (ctxInfo && Array.isArray(ctxInfo.turns)) detailTurns = ctxInfo.turns.slice(-3);
				else {
					const row = (snap.rows ?? []).find((x) => x && x.sessionId === selected.sessionId);
					const values = row && row.projections ? row.projections.values ?? {} : {};
					const outline = values.turnOutline && Array.isArray(values.turnOutline.turns) ? values.turnOutline.turns : [];
					detailTurns = outline.slice(-3);
				}
			}
			const detailCalls = selected ? (() => {
				const row = (snap.rows ?? []).find((x) => x && x.sessionId === selected.sessionId);
				if (!row) return [];
				return (normalizeUq(row.projections?.values ?? {})?.active) ?? [];
			})() : [];
			// 未读计数徽章数据
			const badgeTodoCount = unreadCount(entries.filter((e) => !isEntryArchived(e) && e.kind !== "turn-end"));
			// 键盘导航：j/k 上下移动选中，Enter 打开，e 归档
			const navList = filtered;
			const moveSel = (dir) => {
				if (navList.length === 0) return;
				let idx = navList.findIndex((e) => e.id === selectedId);
				if (idx === -1) { setSelectedId(navList[0].id); if (isUnread(navList[0])) props.actions.markRead(navList[0].id); return; }
				const next = navList[Math.max(0, Math.min(navList.length - 1, idx + dir))];
				if (next && next.id !== selectedId) { setSelectedId(next.id); if (isUnread(next)) props.actions.markRead(next.id); }
			};
			// 键盘导航（React useEffect：j/k 上下移动，Enter 打开，e 归档，Shift+X 勾选）
			React.useEffect(() => {
				const onKey = (ev) => {
					if (document.hidden || !navList.length) return;
					const tag = ev.target && ev.target.tagName;
					if (tag === "INPUT" || tag === "TEXTAREA") return;
					if (ev.key === "j") { ev.preventDefault(); moveSel(1); }
					else if (ev.key === "k") { ev.preventDefault(); moveSel(-1); }
					else if (ev.key === "Enter" && selectedId) { const e = navList.find((x) => x.id === selectedId); if (e) { props.actions.open(e.sessionId); } }
					else if (ev.key === "e" && selectedId) { const e = navList.find((x) => x.id === selectedId); if (e) { props.actions.archive(e.id); toastStore.push("已归档", () => props.actions.unarchive(e.id)); } }
					else if (ev.key === "x" && ev.shiftKey && selectedId) { setChecked((p) => ({ ...p, [selectedId]: !p[selectedId] })); }
				};
				window.addEventListener("keydown", onKey);
				return () => window.removeEventListener("keydown", onKey);
			});
			const FKind = [{ key: "all", label: "全部" }, { key: "question", label: "待确认" }, { key: "plan-review", label: "计划待审" }, { key: "turn-end", label: "已回复" }, { key: "todos-done", label: "任务完成" }, { key: "goal-done", label: "目标完成" }];
			const filterLabel = filterKind === "all" ? null : (FKind.find((f) => f.key === filterKind) ?? { label: filterKind }).label;
			const head = h("div", { className: "th-head" },
				h("span", { className: "th-title" }, t("page.title")),
				h("span", { className: "th-sub" }, ""),
				h("input", {
					className: "th-search", type: "search", placeholder: "搜索标题 / 对话内容…",
					value: searchQ, onChange: (e) => setSearchQ(e.target.value), title: "按标题或对话内容中的关键字搜索当前页签",
					spellCheck: false
				}),
				h("div", { className: "th-wsdrop" },
					h(HeadIconBtn, {
						icon: ICONS.filter, title: "按类型筛选",
						label: filterLabel,
						active: filterKind !== "all" || filterOpen,
						onClick: () => setFilterOpen((v) => !v)
					}),
					filterOpen ? h("div", { className: "th-filtermenu" },
						FKind.map((f) => h("button", {
							key: f.key, type: "button",
							className: "th-filteritem" + (filterKind === f.key ? " on" : ""),
							onClick: () => { setFilterKind(f.key); setFilterOpen(false); }
						}, h("span", {}, f.label), filterKind === f.key ? h("span", {}, "✓") : null))
					) : null
				),
				h(HeadIconBtn, {
					icon: groupBySession ? ICONS.group : ICONS.flat,
					title: groupBySession ? "切换为平铺视图" : "切换为按会话聚合",
					active: false,
					onClick: () => { const v = !groupBySession; setGroupBySession(v); uiState.groupBySession = v; persistUiState(); }
				}),
				h(HeadIconBtn, {
					icon: ICONS.multi, title: "多选批量操作",
					active: selectMode,
					onClick: () => { setSelectMode((v) => !v); setChecked({}); }
				}),
				h(HeadIconBtn, { icon: ICONS.refresh, title: "刷新", active: false, onClick: () => props.actions.refresh() })
			);
			const listPanel = h("div", { className: "th-inbox-left" },
				head,
				h("div", { className: "th-tabs" },
					["all", "todo", "archive"].map((key) => h("button", {
						key,
						type: "button",
						className: "th-tab" + (tab === key ? " active" : ""),
						onClick: () => { setTab(key); }
					}, t("tab." + key) + (key === "all" && badge.all > 0 ? " (" + badge.all + ")" : "") + (key === "todo" && badge.todo > 0 ? " (" + badge.todo + ")" : "")))
				),
				selectMode && checkedIds.length > 0 ? h("div", { className: "th-selectbar" },
					h("span", {}, "已选 " + checkedIds.length + " 项"),
					h("button", { type: "button", className: "th-btn", onClick: () => { for (const id of checkedIds) props.actions.markRead(id); toastStore.push("已标为已读（" + checkedIds.length + " 项）", () => { for (const id of checkedIds) props.actions.markUnread(id); }); setChecked({}); setSelectMode(false); } }, "标为已读"),
					h("button", { type: "button", className: "th-btn", onClick: () => { for (const id of checkedIds) if (!uiState.archived[id]) props.actions.archive(id); toastStore.push("已归档（" + checkedIds.length + " 项）", () => { for (const id of checkedIds) props.actions.unarchive(id); }); setChecked({}); setSelectMode(false); } }, "归档"),
					h("button", { type: "button", className: "th-btn", onClick: () => { const all = {}; for (const e of filtered) all[e.id] = true; setChecked(all); } }, "全选本页")
				) : null,
				h("div", { className: "th-list" },
					snap.status === "loading" ? h("div", { className: "th-empty" }, t("status.loading")) : null,
					snap.status === "unavailable" ? h("div", { className: "th-empty" }, t("status.unavailable")) : null,
					snap.status === "error" ? h("div", { className: "th-empty" }, t("status.error") + "：" + (snap.error ?? "")) : null,
					snap.status === "ready" && filtered.length === 0
						? h("div", { className: "th-empty" },
							String(searchQ).trim()
								? "无匹配「" + String(searchQ).trim() + "」的结果（当前页签 " + visible.length + " 条）"
								: t(tab === "archive" ? "empty.archive" : tab === "all" ? "empty.all" : "empty.todo"))
						: null,
					// 两种视图：按会话聚合（分组可折叠） / 按日期平铺（今天/昨天/更早）
					groupBySession ? (() => {
						const bySid = {};
						for (const e of filtered) {
							if (!bySid[e.sessionId]) bySid[e.sessionId] = { title: e.title, cwd: e.cwd, items: [] };
							bySid[e.sessionId].items.push(e);
						}
						const sids = Object.keys(bySid).sort((a, b) => {
							const ma = Math.max(...bySid[a].items.map((x) => x.time ?? 0));
							const mb = Math.max(...bySid[b].items.map((x) => x.time ?? 0));
							return mb - ma;
						});
						const rowsList = snap.rows ?? [];
						return sids.map((sid) => {
							const g = bySid[sid];
							const row = rowsList.find((x) => x && x.sessionId === sid);
							const values = row && row.projections ? row.projections.values ?? {} : {};
							const todos = Array.isArray(values.todos) ? values.todos : null;
							const doneN = todos ? todos.filter((x) => x && x.status === "completed").length : 0;
							const unreadN = g.items.filter((x) => isUnread(x)).length;
							const collapsed = !!collapsedGroups[sid];
							const latest = g.items[0];
							return h("div", { key: sid, className: "th-sgroup" },
								h("div", {
									className: "th-sgroup-head" + (unreadN > 0 ? " unread" : ""),
									onClick: () => setCollapsedGroups((p) => ({ ...p, [sid]: !p[sid] }))
								},
									h("span", { className: "th-sgroup-arrow" }, collapsed ? "▸" : "▾"),
									h("span", { className: "th-sgroup-title" }, g.title),
									unreadN > 0 ? h("span", { className: "th-badge" }, String(unreadN)) : null,
									h("span", { className: "th-sgroup-count" }, g.items.length + " 条"),
									todos ? h("span", { className: "th-sgroup-prog" }, doneN + "/" + todos.length) : null
								),
								collapsed && latest ? h("div", { className: "th-sgroup-latest", onClick: () => onSelect(latest) }, summaryOf(latest)) : null,
								!collapsed ? g.items.map((entry) => h(EntryRow, {
									key: entry.id,
									entry,
									actions: props.actions,
									t,
									selected: selectedId === entry.id,
									checked: selectMode && !!checked[entry.id],
									selectMode,
									onCheck: (id, on) => setChecked((p) => ({ ...p, [id]: on })),
									onSelect: (e) => {
										if (selectMode) { setChecked((p) => ({ ...p, [e.id]: !p[e.id] })); return; }
										setSelectedId(e.id);
										if (isUnread(e)) props.actions.markRead(e.id);
									},
									onContextMenu: (e, ev) => setCtxMenu({ x: ev.clientX, y: ev.clientY, entry: e })
								})) : null
							);
						});
					})()
					// 日期分组：今天 / 昨天 / 更早（multica list 分组模式）
					: dayGroups(filtered).map((g) => h("div", { key: g.label },
						h("div", { className: "th-dayhead" }, g.label),
						g.items.map((entry) => h(EntryRow, {
							key: entry.id,
							entry,
							actions: props.actions,
							t,
							selected: selectedId === entry.id,
							checked: selectMode && !!checked[entry.id],
							selectMode,
							onCheck: (id, on) => setChecked((p) => ({ ...p, [id]: on })),
							onSelect: (e) => {
								if (selectMode) { setChecked((p) => ({ ...p, [e.id]: !p[e.id] })); return; }
								setSelectedId(e.id);
								if (isUnread(e)) props.actions.markRead(e.id);
							},
							onContextMenu: (e, ev) => setCtxMenu({ x: ev.clientX, y: ev.clientY, entry: e })
						}))
					))
				)
			);
			const right = !selected ? h("div", { className: "th-empty th-detail-empty" }, "选择左侧条目查看对话详情；j/k 导航，Enter 打开") : h("div", { className: "th-detail" },
				h("div", { className: "th-detail-head" },
					h(KindBadge, { kind: selected.kind, t }),
					h("span", { className: "th-title", title: selected.title }, selected.title),
					h("span", { className: "th-time" }, fmtTime(selected.time))
				),
				h("div", { className: "th-detail-meta" },
					selected.cwd ? shortCwd(selected.cwd) : "",
					selected.state === "continued" ? " · 可直接回答" : selected.state === "open" ? " · 需到会话内回答" : ""
				),
				detailCalls.length > 0 ? h("div", { className: "th-detail-sec" },
					h("div", { className: "th-side-h" }, "待确认（" + detailCalls.length + "）"),
					h(QuestionCard, { entry: { ...selected, questions: detailCalls[0].questions ?? [], state: detailCalls[0].state }, actions: props.actions, t })
				) : null,
				h("div", { className: "th-detail-sec th-detail-scroll" },
					h("div", { className: "th-side-h" }, "最近对话（" + detailTurns.length + " 轮）"),
					detailTurns.length === 0 ? h("div", { className: "th-hint" }, "暂无轮次记录") : null,
					detailTurns.map((tn) => h("div", { key: tn.turn, className: "th-turn" },
						h("div", { className: "th-turn-role u" }, "第 " + tn.turn + " 轮 · 你"),
						h("div", { className: "th-turn-q" }, String(tn.prompt ?? "")),
						h("div", { className: "th-turn-role a" }, "智能体"),
						h("div", { className: "th-turn-a" }, String(tn.response ?? "") || "（本轮无文本回复）")
					))
				),
				h("div", { className: "th-detail-foot" },
					h(ReplyBox, {
						sessionId: selected.sessionId,
						actions: props.actions,
						placeholder: "回复该会话（排队投递给智能体）…",
						onSent: () => props.actions.markRead(selected.id)
					}),
					h("div", { className: "th-detail-footbtns" },
						h("button", { type: "button", className: "th-btn", onClick: () => { if (isUnread(selected)) props.actions.markUnread(selected.id); } }, t("action.markUnread")),
						selectedArchived
							? h("button", { type: "button", className: "th-btn", title: isWsArchived(selected.sessionId) ? "该会话已在工作区归档，将一并解除（消息回到收件箱）" : undefined, onClick: () => props.actions.unarchiveEntry(selected) }, t("action.unarchive"))
							: h("button", { type: "button", className: "th-btn", onClick: () => props.actions.archive(selected.id) }, t("action.archive")),
						h("button", { type: "button", className: "th-btn primary", onClick: () => props.actions.open(selected.sessionId) }, t("action.open"))
					)
				)
			);
			return h("div", { className: "th-page th-inbox-split" },
				listPanel,
				right,
				ctxMenu ? h("div", { className: "th-mask", style: { background: "transparent" }, onClick: () => setCtxMenu(null), onContextMenu: (e) => { e.preventDefault(); setCtxMenu(null); } },
					h("div", { className: "th-ctxmenu", style: { left: ctxMenu.x, top: ctxMenu.y }, onClick: (e) => e.stopPropagation() },
						h("button", { type: "button", className: "th-ctxitem", onClick: () => { if (isUnread(ctxMenu.entry)) props.actions.markRead(ctxMenu.entry.id); else props.actions.markUnread(ctxMenu.entry.id); setCtxMenu(null); } },
							isUnread(ctxMenu.entry) ? "标为已读" : "标为未读"),
						h("button", { type: "button", className: "th-ctxitem", onClick: () => { if (isEntryArchived(ctxMenu.entry)) props.actions.unarchiveEntry(ctxMenu.entry); else props.actions.archive(ctxMenu.entry.id); setCtxMenu(null); } },
							isEntryArchived(ctxMenu.entry) ? "取消归档" : "归档"),
						h("button", { type: "button", className: "th-ctxitem", onClick: () => { props.actions.openAndMark(ctxMenu.entry); setCtxMenu(null); } }, "跳转对话"),
						h("button", {
							type: "button", className: "th-ctxitem",
							onClick: () => {
								const sid = ctxMenu.entry.sessionId;
								if (uiState.muted[sid]) delete uiState.muted[sid];
								else uiState.muted[sid] = true;
								persistUiState();
								uiStore.bump();
								props.actions.refresh();
								setCtxMenu(null);
							}
						}, uiState.muted[ctxMenu.entry.sessionId] ? "取消静音此会话" : "静音此会话（停止进度通知）")
					)
				) : null,
				h(Toasts, null)
			);
		}
/** 看板独立页：全局统览所有会话任务状态。 */
		function BoardPage(props) {
			const t = props.t;
			const snap = React.useSyncExternalStore(store.subscribe, store.getSnapshot);
			const uiV = React.useSyncExternalStore(uiStore.subscribe, uiStore.getSnapshot);
			void uiV;
			const rows = snap.rows ?? [];
			const wsList = [];
			for (const row of rows) {
				const cwd = row && row.cwd ? row.cwd : "";
				if (cwd && !wsList.includes(cwd)) wsList.push(cwd);
			}
			wsList.sort();
			const filter = Array.isArray(uiState.boardWsFilter) ? uiState.boardWsFilter : [];
			const toggleWs = (cwd) => {
				const cur = Array.isArray(uiState.boardWsFilter) ? uiState.boardWsFilter : [];
				const next = cur.includes(cwd) ? cur.filter((x) => x !== cwd) : [...cur, cwd];
				uiState.boardWsFilter = next;
				persistUiState();
				uiStore.bump();
			};
			const [wsOpen, setWsOpen] = React.useState(false);
			const [searchQ, setSearchQ] = React.useState(""); // 搜索：标题 / 对话内容 / 清单关键字
			const wsLabel = filter.length === 0 ? null : "已选 " + filter.length;
			return h("div", { className: "th-page" },
				h("div", { className: "th-head" },
					h("span", { className: "th-title" }, t("board.title")),
					h("span", { className: "th-sub" }, t("board.subtitle")),
					h("input", {
						className: "th-search", type: "search", placeholder: "搜索标题 / 对话内容…",
						value: searchQ, onChange: (e) => setSearchQ(e.target.value), title: "按标题或对话内容中的关键字搜索卡片",
						spellCheck: false
					}),
					h("div", { className: "th-wsdrop", style: { position: "relative" } },
						h(HeadIconBtn, {
							icon: ICONS.ws, title: "按工作区筛选",
							label: wsLabel,
							active: wsOpen || filter.length > 0,
							onClick: () => setWsOpen((v) => !v)
						}),
						wsOpen ? h("div", { className: "th-wsmenu", style: { top: "110%", right: 0, left: "auto" } },
							wsList.map((cwd) => h("label", { key: cwd, className: "th-wsitem" },
								h("input", { type: "checkbox", checked: filter.includes(cwd), onChange: () => toggleWs(cwd) }),
								h("span", {}, shortCwd(cwd))
							)),
							wsList.length === 0 ? h("div", { className: "th-hint" }, "暂无工作区") : null
						) : null
					),
					h(HeadIconBtn, { icon: ICONS.refresh, title: "刷新", active: false, onClick: () => props.actions.refresh() })
				),
				h(BoardView, { snap, actions: props.actions, t, query: searchQ })
			);
		}

		const BOARD_STATUS_LABEL = { todo: "待办", progress: "进行中", review: "待确认", blocked: "阻塞中", done: "已完成", archived: "已归档" };

		function BoardCard({ row, status, actions, overridden, wsArchived, compact, onOpenPanel }) {
			const values = row.projections?.values ?? {};
			const todos = Array.isArray(values.todos) ? values.todos : null;
			const doneCount = todos ? todos.filter((x) => x && x.status === "completed").length : 0;
			const pct = todos && todos.length > 0 ? Math.round((doneCount / todos.length) * 100) : null;
			const wsTag = wsArchived ? h("span", { className: "th-wstag", title: "已在工作区归档（看板与收件箱同步）" }, "工作区") : null;
			if (compact) {
				return h("div", {
					className: "th-bcard-mini th-bc-" + status,
					draggable: true,
					onDragStart: (e) => { e.dataTransfer.setData("text/sessionid", row.sessionId); e.dataTransfer.effectAllowed = "move"; e.target.classList.add("th-dragging"); }, onDragEnd: (e) => { e.target.classList.remove("th-dragging"); },
					onClick: () => onOpenPanel(row),
					title: "点击打开详情侧栏",
				},
					h("span", { className: "th-bsess" }, values.title ?? row.title ?? "未命名会话"),
					wsTag,
					row.running ? h("span", { className: "th-run" }, "●") : null
				);
			}
			return h("div", {
				className: "th-bcard th-bc-" + status + (row.running ? " running" : ""),
				draggable: true,
				onDragStart: (e) => { e.dataTransfer.setData("text/sessionid", row.sessionId); e.dataTransfer.effectAllowed = "move"; e.target.classList.add("th-dragging"); }, onDragEnd: (e) => { e.target.classList.remove("th-dragging"); },
				onClick: () => onOpenPanel(row),
				title: "点击打开详情侧栏，拖拽调整状态",
			},
				h("div", { className: "th-bcard-top" },
					h("span", { className: "th-bsess" }, values.title ?? row.title ?? "未命名会话"),
					wsTag,
					row.running ? h("span", { className: "th-run" }, "● 运行中") : null
				),
				h("div", { className: "th-bmeta" }, shortCwd(row.cwd ?? "")),
				pct !== null ? h("div", { className: "th-bprog" }, h("div", { className: "th-bprog-in", style: { width: pct + "%" } })) : null,
				pct !== null ? h("div", { className: "th-bprogtext" }, doneCount + "/" + todos.length + " 完成") : null,
				h("div", { className: "th-bactions", onClick: (e) => e.stopPropagation() },
					h("button", { type: "button", className: "th-btn primary", onClick: () => actions.open(row.sessionId) }, "跳转对话"),
					overridden
						? h("button", { type: "button", className: "th-btn", onClick: () => actions.clearBoardStatus(row.sessionId), title: "恢复自动状态" }, "↺ 自动")
						: null,
					status !== "archived"
						? h("button", { type: "button", className: "th-btn", onClick: () => actions.setBoardStatus(row.sessionId, "archived") }, "归档")
						: null
				)
			);
		}

		function HandoffDialog({ handoff, onConfirm, onCancel }) {
			const [message, setMessage] = React.useState(handoff.plan.message ?? "");
			const [pending, setPending] = React.useState(false);
			const isPrompt = handoff.plan.kind === "prompt";
			const isCancel = handoff.plan.kind === "cancel";
			const confirmLabel = isPrompt ? "发送并移动" : isCancel ? "取消运行并移动" : "仍然移动";
			return h("div", { className: "th-mask", onClick: onCancel },
				h("div", { className: "th-dialog", onClick: (e) => e.stopPropagation() },
					h("div", { className: "th-dlg-title" }, "移动到「" + BOARD_STATUS_LABEL[handoff.toStatus] + "」"),
					handoff.plan.note ? h("div", { className: "th-dlg-note" }, handoff.plan.note) : null,
					isPrompt ? h("div", { className: "th-dlg-label" }, "将向会话发送以下指令（可编辑）：") : null,
					isPrompt ? h("textarea", {
						className: "th-dlg-input",
						value: message,
						onChange: (e) => setMessage(e.target.value),
						rows: 3,
					}) : null,
					h("div", { className: "th-dlg-actions" },
						h("button", { type: "button", className: "th-btn", disabled: pending, onClick: onCancel }, "取消"),
						h("button", { type: "button", className: "th-btn primary", disabled: pending, onClick: async () => {
							setPending(true);
							await onConfirm(isPrompt ? message : undefined);
							setPending(false);
						} }, confirmLabel)
					)
				)
			);
		}

		function BoardView({ snap, actions, t, query }) {
			const uiV = React.useSyncExternalStore(uiStore.subscribe, uiStore.getSnapshot);
			void uiV;
			const [dragOver, setDragOver] = React.useState(null);
			const [handoff, setHandoff] = React.useState(null);
			const [panelRow, setPanelRow] = React.useState(null);
			const openPanel = (row) => {
				setPanelRow(row);
				void actions.refresh(); // 打开侧栏时拉最新投影（含 turnOutline），侧栏数据随下次快照更新
			};
			const [wsOpen, setWsOpen] = React.useState(false);
			const rows = snap.rows ?? [];
			// 工作区筛选：boardWsFilter 为空 = 全部；非空 = 只显示选中的 cwd
			const wsList = [];
			for (const row of rows) {
				const cwd = row && row.cwd ? row.cwd : "";
				if (cwd && !wsList.includes(cwd)) wsList.push(cwd);
			}
			wsList.sort();
			const filter = Array.isArray(uiState.boardWsFilter) ? uiState.boardWsFilter : [];
			const wsFiltered = filter.length > 0 ? rows.filter((x) => x && filter.includes(x.cwd)) : rows;
			// 搜索：标题 + 对话内容 + 清单关键字（在当前工作区筛选范围内过滤）
			const visibleRows = filterRowsByQuery(wsFiltered, query, snap.nodeContexts);
			const grouped = {};
			for (const col of BOARD_COLS) grouped[col[0]] = [];
			for (const row of visibleRows) {
				if (!row || row.blank) continue;
				const status = actions.deriveBoard(row);
				if (grouped[status]) grouped[status].push(row);
			}
			const archivedCollapsed = uiState.boardArchivedCollapsed !== false;
			// 归档列防堆积：一键隐藏全部卡片（只留计数与「显示」入口），开关持久化
			const archivedHidden = uiState.boardArchivedHidden === true;
			// 工作区归档压过手动覆盖：把工作区已归档卡片拖出归档列前，必须先解除工作区归档
			const unarchiveWsIfSynced = (row) => { if (isWsArchived(row.sessionId)) void actions.unarchiveWorkspace(row.sessionId); };
			const startHandoff = (fromStatus, toKey, row) => {
				const plan = resolveHandoff(fromStatus, toKey, row);
				if (plan.kind === "noop") return;
				if (plan.kind === "mark" && !plan.note) { unarchiveWsIfSynced(row); actions.setBoardStatus(row.sessionId, toKey); return; }
				setHandoff({ row, fromStatus, toStatus: toKey, plan, message: plan.message ?? "" });
			};
			const confirmHandoff = async (message) => {
				const hf = handoff;
				setHandoff(null);
				try {
					if (hf.plan.kind === "prompt") {
						const res = await actions.sendPrompt(hf.row.sessionId, message);
						if (!res || !res.ok) console.warn("[task-hub] prompt failed:", res && res.error);
					} else if (hf.plan.kind === "cancel") {
						await actions.cancelSession(hf.row.sessionId);
					}
					unarchiveWsIfSynced(hf.row);
					actions.setBoardStatus(hf.row.sessionId, hf.toStatus);
					actions.refresh();
				} catch (e) { console.warn("[task-hub] handoff failed:", e); }
			};
			const toggleWs = (cwd) => {
				const cur = Array.isArray(uiState.boardWsFilter) ? uiState.boardWsFilter : [];
				const next = cur.includes(cwd) ? cur.filter((x) => x !== cwd) : [...cur, cwd];
				uiState.boardWsFilter = next;
				persistUiState();
				uiStore.bump();
			};
			return h("div", { className: "th-board" },
				BOARD_COLS.map(([key, label]) => {
					const collapsed = key === "archived" && archivedCollapsed;
					const hideCards = key === "archived" && archivedHidden;
					const items = grouped[key] || [];
					return h("div", {
						key,
						className: "th-col th-col-" + key + (dragOver === key ? " th-col-over" : ""),
						onDragOver: (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (dragOver !== key) setDragOver(key); },
						onDragLeave: () => setDragOver((c) => (c === key ? null : c)),
						onDrop: (e) => {
							e.preventDefault();
							const sid = e.dataTransfer.getData("text/sessionid");
							const fromRow = visibleRows.find((x) => x && x.sessionId === sid);
							if (sid && fromRow) startHandoff(actions.deriveBoard(fromRow), key, fromRow);
							setDragOver(null);
						},
					},
						h("div", { className: "th-col-head" },
							h("span", { className: "th-coltitle" },
								key === "archived" ? h("button", {
									type: "button",
									className: "th-colarrow",
									title: archivedCollapsed ? "展开" : "折叠",
									onClick: () => { uiState.boardArchivedCollapsed = !archivedCollapsed; persistUiState(); uiStore.bump(); }
								}, archivedCollapsed ? "▸" : "▾") : null,
								label
							),
							h("span", { className: "th-colcount" }, String(items.length)),
							key === "done" && items.length > 0 ? h("button", { type: "button", className: "th-colbtn", title: "把已完成全部移入已归档", onClick: () => { for (const row of items) actions.setBoardStatus(row.sessionId, "archived"); } }, "归档全部") : null,
							key === "archived" && items.length > 0 ? h("button", {
								type: "button", className: "th-colbtn",
								title: archivedHidden ? "恢复显示已归档卡片" : "一键隐藏全部已归档卡片（列头保留计数，随时可恢复）",
								onClick: () => { uiState.boardArchivedHidden = !archivedHidden; persistUiState(); uiStore.bump(); }
							}, archivedHidden ? "显示" : "隐藏") : null
						),
						hideCards
							? h("div", { className: "th-archhint" }, "已隐藏 " + items.length + " 个已归档会话")
							: collapsed
								? items.map((row) => h(BoardCard, { key: row.sessionId, row, status: key, actions, overridden: !!uiState.boardOverride[row.sessionId], wsArchived: isWsArchived(row.sessionId), compact: true, onOpenPanel: openPanel }))
								: items.map((row) => h(BoardCard, { key: row.sessionId, row, status: key, actions, overridden: !!uiState.boardOverride[row.sessionId], wsArchived: isWsArchived(row.sessionId), compact: false, onOpenPanel: openPanel })),
						!hideCards && items.length === 0 ? h("div", { className: "th-colempty" }, "—") : null
					);
				}),
				handoff ? h(HandoffDialog, {
					handoff,
					onCancel: () => setHandoff(null),
					onConfirm: (message) => confirmHandoff(message),
				}) : null,
				panelRow ? h(SessionPanel, { row: panelRow, actions, nodeContexts: snap.nodeContexts, onClose: () => setPanelRow(null) }) : null
			);
		}

		function Toasts() {
			const toasts = React.useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot);
			if (toasts.length === 0) return null;
			return h("div", { className: "th-toasts" },
				toasts.map((t) => h("div", { key: t.id, className: "th-toast" },
					h("span", { className: "th-toastmsg" }, t.msg),
					t.undo ? h("button", { type: "button", onClick: () => { t.undo(); toastStore.dismiss(t.id); } }, "撤销") : null,
					h("button", { type: "button", onClick: () => toastStore.dismiss(t.id) }, "✕")
				))
			);
		}

		function ReplyBox({ sessionId, actions, onSent, placeholder }) {
			const [text, setText] = React.useState("");
			const [images, setImages] = React.useState([]);
			const [pending, setPending] = React.useState(false);
			const [done, setDone] = React.useState(false);
			const [err, setErr] = React.useState(null);
			const addFiles = (fileList) => {
				for (const file of Array.from(fileList ?? [])) {
					if (!file.type.startsWith("image/")) continue;
					if (file.size > 15 * 1024 * 1024) { setErr("图片过大（>15MB），已跳过：" + file.name); continue; }
					const reader = new FileReader();
					reader.onload = () => {
						const dataUrl = String(reader.result ?? "");
						const comma = dataUrl.indexOf(",");
						if (comma < 0) return;
						setImages((prev) => [...prev, { mediaType: file.type, data: dataUrl.slice(comma + 1), name: file.name }]);
					};
					reader.readAsDataURL(file);
				}
			};
			const send = async () => {
				const txt = text.trim();
				if ((!txt && images.length === 0) || pending) return;
				setPending(true);
				setErr(null);
				const res = await actions.sendPrompt(sessionId, txt, images);
				setPending(false);
				if (res && res.ok) { setText(""); setImages([]); setDone(true); if (onSent) onSent(); }
				else setErr((res && res.error && (res.error.message || res.error.code)) || "发送失败");
			};
			return h("div", { className: "th-replyrow th-replycol" },
				images.length > 0 ? h("div", { className: "th-imgrow" },
					images.map((img, i) => h("span", { key: i, className: "th-imgchip" },
						"🖼 " + (img.name ?? "image") + " ",
						h("button", { type: "button", className: "th-imgx", onClick: () => setImages((prev) => prev.filter((_, j) => j !== i)) }, "✕")
					))
				) : null,
				h("div", { className: "th-replyline" },
					h("textarea", {
						className: "th-dlg-input",
						placeholder: placeholder ?? "回复该会话（排队发送，可粘贴截图）…",
						value: text,
						onChange: (e) => setText(e.target.value),
						onKeyDown: (e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); } },
						onPaste: (e) => {
							const items = e.clipboardData?.files;
							if (items && items.length > 0) { e.preventDefault(); addFiles(items); }
						},
					}),
					h("label", { className: "th-btn th-imgbtn", title: "添加图片" },
						"🖼",
						h("input", { type: "file", accept: "image/*", multiple: true, style: { display: "none" }, onChange: (e) => { addFiles(e.target.files); e.target.value = ""; } })
					),
					h("button", { type: "button", className: "th-btn primary", disabled: pending || (text.trim() === "" && images.length === 0), onClick: () => void send() }, pending ? "发送中…" : "发送")
				),
				done ? h("span", { className: "th-ok" }, "已发送") : null,
				err ? h("span", { className: "th-err" }, err) : null
			);
		}

		function normalizeUq(values) {
			const raw = values.userQuestions;
			if (raw && Array.isArray(raw.active)) return raw;
			if (raw && raw.questions && Array.isArray(raw.questions.active)) return raw.questions;
			return null;
		}

				/** 会话侧边栏：上下文 + 回信 + 待确认问题处理 + 跳转对话。 */
		function SessionPanel({ row, actions, onClose, nodeContexts }) {
			const values = row.projections?.values ?? {};
			const title = (typeof values.title === "string" && values.title) || "未命名会话";
			// 轮次摘要优先取 Node 侧 contexts.json（数据源可靠），快照 turnOutline 作为兜底
			const nc = nodeContexts ? nodeContexts[row.sessionId] : null;
			let turns = [];
			if (nc && Array.isArray(nc.turns)) {
				turns = nc.turns;
			} else if (values.turnOutline && Array.isArray(values.turnOutline.turns)) {
				turns = values.turnOutline.turns;
			}
			const recent = turns.slice(-6);
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
					h("div", { className: "th-turn-role u" }, "第 " + tn.turn + " 轮 · 你"),
					h("div", { className: "th-turn-q" }, String(tn.prompt ?? "")),
					h("div", { className: "th-turn-role a" }, "智能体"),
					h("div", { className: "th-turn-a" }, String(tn.response ?? "") || "（本轮无文本回复）")
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
						}, "跳转对话"),
						h("span", { className: "th-kbd" }, "Enter 发送 · Shift+Enter 换行")
					)
				)
			);
		}


		function InboxGlyph() {
			return h("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" },
				h("path", { d: "M22 12h-6l-2 3h-4l-2-3H2" }),
				h("path", { d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" })
			);
		}

		function PanelIcon() {
			React.useSyncExternalStore(uiStore.subscribe, uiStore.getSnapshot);
			const snap = React.useSyncExternalStore(store.subscribe, store.getSnapshot);
			const count = unreadCount(snap.entries);
			return h("span", { className: "th-panelwrap" },
				h(InboxGlyph),
				count > 0 ? h("span", { className: "th-badge" }, count > 99 ? "99+" : String(count)) : null
			);
		}

		function BoardGlyph() {
			return h("svg", { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 1.8, "stroke-linecap": "round" },
				h("rect", { x: 3, y: 3, width: 5, height: 18, rx: 1 }),
				h("rect", { x: 9.5, y: 3, width: 5, height: 12, rx: 1 }),
				h("rect", { x: 16, y: 3, width: 5, height: 15, rx: 1 })
			);
		}
		//#endregion

		//#region plugin body
		// inject 门禁：ctx.remote.<ns> 必须显式声明（端点前缀即 key），否则访问抛 "without inject"
		const inject = ["slots", "locale", "remote", "remote.session", "remote.userQuestions", "uiWorkspace", "workspaces", "remote.workspace"];

		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "task-hub: dictionaries");
			const t = ctx.locale.bind(NS);

			async function refresh() {
				const r = ctx.remote ?? {};
				const candidates = [];
				try { if (r.sessions && typeof r.sessions.list === "function") candidates.push(["sessions", r.sessions]); } catch {}
				try { if (r.session && typeof r.session.list === "function") candidates.push(["session", r.session]); } catch {}
				if (!candidates.length) {
					setSnapshot({ status: "unavailable", entries: [], error: undefined, updatedAt: Date.now() });
					return;
				}
				const ns = candidates[0][1];
				try {
					const res = await Promise.race([
						Promise.resolve(ns.list({})),
						new Promise((resolve) => setTimeout(() => resolve({ ok: false, error: { code: "th-timeout", message: "list() 8 秒无响应（RPC 挂起）" } }), 8000))
					]);
					if (!res || res.ok !== true) {
						const msg = res && res.error ? String(res.error.message ?? res.error.code ?? "unknown") : "unknown";
						console.warn("[task-hub] session list failed:", msg);
						setSnapshot({ status: "error", entries: snapshot.entries, error: msg, updatedAt: Date.now() });
						return;
					}
				const items = (res.value && Array.isArray(res.value.items)) ? res.value.items : [];
					// session/list 的 values 可能缺键、或键存在但值为 null：对"值不可用"的会话补一次全量投影读取
					const NS_KEYS = ["todos", "userQuestions", "goal", "turnOutline", "sessionStats"];
					const usable = (v) => v !== null && v !== undefined;
					const enriched = [];
					let projOk = 0, projFail = 0, sample = "";
					for (const row of items.slice(0, 60)) {
						if (!row || row.blank || typeof row.sessionId !== "string") { enriched.push(row); continue; }
						const values = row.projections?.values ?? {};
						const needFetch = NS_KEYS.some((k) => !usable(values[k]));
						if (!needFetch || typeof ns.projections !== "function") { enriched.push(row); continue; }
						try {
							const res2 = await Promise.race([
								Promise.resolve(ns.projections({ sessionId: row.sessionId })),
								new Promise((resolve) => setTimeout(() => resolve(null), 6000))
							]);
							if (res2 && res2.ok === true && res2.value && res2.value.values) {
								projOk++;
								enriched.push({ ...row, projections: { kind: "sequenced", values: { ...values, ...res2.value.values } } });
							} else {
								projFail++;
								enriched.push(row);
							}
						} catch (e2) {
							projFail++;
							sample = "projErr(" + row.sessionId + "): " + String((e2 && e2.message) ?? e2);
							enriched.push(row);
						}
					}
					// 诊断样例：取最近活跃会话，暴露补齐后的键与 todos 形态
					const s0 = enriched.find((x) => x && typeof x.sessionId === "string" && !x.blank);
					if (s0) {
						const v0 = s0.projections?.values ?? {};
						sample = "sample[" + (v0.title ?? s0.title ?? s0.sessionId) + "] todos=" + (v0.todos === undefined ? "undef" : v0.todos === null ? "null" : Array.isArray(v0.todos) ? "arr(" + v0.todos.length + ")" : typeof v0.todos);
					}
					const nodeState = await fetchNodeEvents(ctx);
					const nodeContexts = await fetchNodeContexts(ctx);
					const entries = filterNotifications(mergeEntries(deriveLiveEntries(enriched), nodeState), enriched, uiState);
					setSnapshot({ status: "ready", entries, rows: enriched, nodeState, nodeContexts, error: undefined, updatedAt: Date.now() });
				} catch (e) {
					console.warn("[task-hub] refresh failed:", e);
					setSnapshot({ status: "error", entries: snapshot.entries, error: String((e && e.message) ?? e), updatedAt: Date.now() });
				}
			}

			const actions = {
				refresh,
				open(sessionId) {
					const uw = ctx.uiWorkspace;
					if (uw && typeof uw.openSession === "function") uw.openSession(sessionId);
				},
				// 去处理 = 跳转会话 + 自动标记已读（跳转即接手）
				openAndMark(entry) {
					actions.open(entry.sessionId);
					if (!uiState.read[entry.id]) { uiState.read[entry.id] = Date.now(); persistUiState(); uiStore.bump(); }
				},
				async replyToSession(sessionId, text) {
					const res = await actions.sendPrompt(sessionId, text);
					if (res && res.ok) { actions.refresh(); }
					return res;
				},
				setBoardStatus(sessionId, status) {
					uiState.boardOverride[sessionId] = status;
					persistUiState();
					uiStore.bump();
				},
				clearBoardStatus(sessionId) {
					delete uiState.boardOverride[sessionId];
					persistUiState();
					uiStore.bump();
				},
				deriveBoard(row) {
					return deriveBoardStatus(row, nodeEventsCache, uiState);
				},
				async sendPrompt(sessionId, text, images) {
					const ns = ctx.remote?.session;
					if (!ns || typeof ns.prompt !== "function") return { ok: false, error: { code: "unavailable", message: "session.prompt 不可用" } };
					// 经收件箱/看板回信驱动的会话记入订阅（回合结束通知的判定条件之一）
					uiState.repliedSessions[sessionId] = true;
					persistUiState();
					const parts = [];
					if (text) parts.push({ type: "text", text });
					for (const img of images ?? []) {
						parts.push({ type: "image", mediaType: img.mediaType, data: img.data, name: img.name });
					}
					if (parts.length === 0) return { ok: false, error: { code: "empty", message: "没有可发送的内容" } };
					try {
						return await ns.prompt({
							requestId: sessionId + "/" + Date.now(),
							sessionId,
							mode: "queue",
							content: parts,
							clientTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
						});
					} catch (e) {
						return { ok: false, error: { code: "threw", message: String((e && e.message) ?? e) } };
					}
				},
				async cancelSession(sessionId) {
					const ns = ctx.remote?.session;
					if (!ns || typeof ns.cancel !== "function") return { ok: false, error: { code: "unavailable", message: "session.cancel 不可用" } };
					try {
						return await ns.cancel({ sessionId });
					} catch (e) {
						return { ok: false, error: { code: "threw", message: String((e && e.message) ?? e) } };
					}
				},
				async answer(sessionId, callId, answers) {
					const uq = ctx.remote?.userQuestions;
					if (!uq || typeof uq.answer !== "function") {
						return { ok: false, error: { code: "unavailable", message: "userQuestions 命名空间不可用" } };
					}
					try {
						return await uq.answer(sessionId, callId, { answers });
					} catch (e) {
						return { ok: false, error: { code: "threw", message: String((e && e.message) ?? e) } };
					}
				},
				markRead(id) {
					if (uiState.read[id]) return;
					uiState.read[id] = Date.now();
					persistUiState();
					uiStore.bump();
				},
				markUnread(id) {
					delete uiState.read[id];
					persistUiState();
					uiStore.bump();
				},
				markAllRead(ids) {
					let changed = false;
					for (const id of ids ?? []) {
						if (!uiState.read[id]) { uiState.read[id] = Date.now(); changed = true; }
					}
					if (changed) { persistUiState(); uiStore.bump(); }
				},
				archive(id) {
					if (uiState.archived[id]) return;
					uiState.archived[id] = Date.now();
					persistUiState();
					uiStore.bump();
				},
				unarchive(id) {
					delete uiState.archived[id];
					persistUiState();
					uiStore.bump();
				},
				// 工作区归档同步：解除工作区侧的会话归档（幂等；shell workspaces 服务优先，remote RPC 兜底）
				async unarchiveWorkspace(sessionId) {
					try {
						const ws = ctx.workspaces;
						if (ws && typeof ws.unarchiveSession === "function") {
							await ws.unarchiveSession(sessionId);
							return { ok: true };
						}
					} catch (e) {
						console.warn("[task-hub] workspaces.unarchiveSession failed:", e);
					}
					let ns = null;
					try { ns = ctx.remote ? ctx.remote.workspace : null; } catch (e) { console.warn("[task-hub] remote.workspace inject resolve failed:", e); }
					if (ns && typeof ns.unarchiveSession === "function") {
						try {
							return await ns.unarchiveSession({ sessionId });
						} catch (e) {
							return { ok: false, error: { code: "threw", message: String((e && e.message) ?? e) } };
						}
					}
					return { ok: false, error: { code: "unavailable", message: "workspace 归档接口不可用" } };
				},
				// 取消归档一条消息 = 清本地标记 + 解除工作区归档（两种来源可并存，各自幂等清除）
				unarchiveEntry(entry) {
					if (!entry) return;
					if (uiState.archived[entry.id]) { delete uiState.archived[entry.id]; persistUiState(); }
					if (isWsArchived(entry.sessionId)) void actions.unarchiveWorkspace(entry.sessionId);
					uiStore.bump();
				}
			};

			// 工作区归档集合同步：订阅 shell 的 workspaces.list（workspace/follow 流实时推送，
			// 服务缺失时仅告警降级，不影响其余功能；try/catch 保证即使门禁抛错也不炸激活）
			ctx.effect(() => {
				let ws = null;
				try { ws = ctx.workspaces; } catch (e) { console.warn("[task-hub] workspaces inject resolve failed:", e); }
				if (!ws || !ws.list || typeof ws.list.subscribe !== "function" || typeof ws.list.getSnapshot !== "function") {
					console.warn("[task-hub] ctx.workspaces.list unavailable — workspace archive sync off");
					return;
				}
				wsArchivedSyncFromSnapshot(ws.list.getSnapshot());
				return ws.list.subscribe(() => {
					if (wsArchivedSyncFromSnapshot(ws.list.getSnapshot())) uiStore.bump();
				});
			}, "task-hub: workspace archive sync");

			ctx.effect(() => {
				let stopped = false;
				let timer = null;
				const tick = () => {
					if (stopped || document.hidden) return;
					void refresh();
				};
				void refresh();
				timer = setInterval(tick, POLL_MS);
				const onVisible = () => { if (!document.hidden) void refresh(); };
				document.addEventListener("visibilitychange", onVisible);
				const unbindReset = typeof ctx.on === "function" ? ctx.on("connection/reset", () => void refresh()) : null;
				return () => {
					stopped = true;
					if (timer) clearInterval(timer);
					document.removeEventListener("visibilitychange", onVisible);
					if (typeof unbindReset === "function") unbindReset();
				};
			}, "task-hub: poll loop");

			const face = { t, actions };

			// 收件箱页 + 看板页（单 inject 多 register：同一槽位重复 inject 会激活失败）
			ctx.slots.inject("main", function* () {
				try {
					yield ctx.slots.register({
						name: "main",
						key: PANEL_ID,
						locale: NS,
						inject: () => face
					}, function InboxSafe(props) {
						return h(SafeBoundary, null, h(InboxPage, props));
					});
				} catch (e) { console.error("[task-hub] register main/inbox failed:", e); }
				try {
					yield ctx.slots.register({
						name: "main",
						key: BOARD_ID,
						locale: NS,
						inject: () => face
					}, function BoardSafe(props) {
						return h(SafeBoundary, null, h(BoardPage, props));
					});
				} catch (e) { console.error("[task-hub] register main/board failed:", e); }
			});

			ctx.slots.inject("sidebar.panellist", () => {
				const handles = [];
				try {
					handles.push(ctx.slots.register({
						name: "sidebar.panellist",
						id: PANEL_ID,
						order: 6,
						label: () => t("panel"),
						locale: NS
					}, PanelIcon));
				} catch (e) { console.error("[task-hub] register panellist/inbox failed:", e); }
				try {
					handles.push(ctx.slots.register({
						name: "sidebar.panellist",
						id: BOARD_ID,
						order: 7,
						label: () => t("panel.board"),
						locale: NS
					}, BoardGlyph));
				} catch (e) { console.error("[task-hub] register panellist/board failed:", e); }
				return handles;
			});

			// dsh-osc-harness-sidebar 产品导航轨（该插件接管 sidebar 席位时使用）
			ctx.slots.inject("sidebar.products", () => {
				const handles = [];
				try {
					handles.push(ctx.slots.register({
						name: "sidebar.products",
						id: PANEL_ID,
						order: 60,
						label: "收件箱"
					}, PanelIcon));
				} catch (e) { console.error("[task-hub] register products/inbox failed:", e); }
				try {
					handles.push(ctx.slots.register({
						name: "sidebar.products",
						id: BOARD_ID,
						order: 61,
						label: "看板"
					}, BoardGlyph));
				} catch (e) { console.error("[task-hub] register products/board failed:", e); }
				return handles;
			});
		}
		//#endregion

		exports.NS = NS;
		exports.PANEL_ID = PANEL_ID;
		exports.inject = inject;
		exports.apply = apply;
		exports.__store = store; // 测试接缝：无头回归用
		exports.__resolveHandoff = resolveHandoff; // 测试接缝
		exports.__filterNotifications = filterNotifications; // 测试接缝
		exports.__entryArchived = (entry) => isEntryArchived(entry); // 测试接缝：工作区归档同步
		exports.__matchQuery = matchQuery; // 测试接缝：搜索匹配
		exports.__sessionSearchText = sessionSearchText; // 测试接缝：会话可搜索文本
		exports.__filterEntriesByQuery = filterEntriesByQuery; // 测试接缝：收件箱搜索
		exports.__filterRowsByQuery = filterRowsByQuery; // 测试接缝：看板搜索
		return module.exports;
	}
});
