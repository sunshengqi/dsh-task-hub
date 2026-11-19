# 任务中心插件（dsh-task-hub）——上下文交接文档

> 本文供新对话继续开发使用。读完本文即可接手，无需翻阅旧对话。
> 更新时间：2026-11-18

## 一、这是什么

`@local/dsh-task-hub` 是为 DeepSeek Harness（大肥鱼）开发的双半侧插件，参考 multica 的收件箱+看板体验：

- **收件箱**（通知流）：聚合所有工作区会话的 待确认问题（可内联作答）/ 任务完成 / 目标完成 / 回合结束通知（待查看）
- **看板**（全局统览）：六列看板（待办/进行中/待确认/阻塞中/已完成/已归档），状态随会话自动迁移 + 拖拽手动改状态 + 拖拽交接动作（唤醒/收尾/取消智能体）
- **会话侧边栏**：点看板卡片弹出，展示最近轮次上下文 + 待确认问题处理 + 回信输入框 + 跳转对话

## 二、代码位置（关键！）

| 内容 | 路径 |
|---|---|
| 插件源码（开发副本，**改这里**） | `E:\IdeaProjects\study-project\dsh-task-hub\` |
| 已安装位置（junction 链接） | `C:\Users\sunsh\.dsh\profiles\desktop\node_modules\@local\dsh-task-hub` → junction → 上面的开发副本 |
| 无头回归测试台 | `dsh-task-hub\test\harness.cjs`（60+ 断言） |
| 独立 SessionPanel 语法验证 | `dsh-task-hub\test\session-panel.standalone.js` |
| **分享发布包** | `dsh-task-hub\dist\`（`dsh-task-hub-share.zip` 一体包 / `dsh-task-hub-plugin.zip` 纯插件 / `install.ps1` 一键安装 / 分享说明 md；已用假 home 端到端验证） |
| 官方包文档解出 | `E:\IdeaProjects\study-project\dsh-docs\` |
| 插件开发要点沉淀 | `E:\IdeaProjects\study-project\dsh-plugin-research\DSH插件开发要点.md` |
| multica 源码参考 | `E:\IdeaProjects\study-project\multica-main\`（inbox: `packages\views\inbox\components\`） |

**部署方式**：profile `package.json` 的 `dsh.profile.bundles` 含 `@local/dsh-task-hub`，依赖为 `file:E:/IdeaProjects/study-project/dsh-task-hub`，node_modules 内是 junction → 开发副本。**改代码后重启 DSH 即生效，无需重装**。

**回退**：`C:\Users\sunsh\.dsh\profiles\desktop\package.json.bak-taskhub`（还有 `.bak-reenable`）。

## 三、架构（双半侧）

```
Node 半侧（lib/index.js，宿主进程常驻）
  每 5s 读 ~/.dsh/storages/session_projcache/sessions/*.json（投影缓存，实时更新）
  ├─ detectTransitions: 任务清单全完成/goal 完成迁移 → events.json（持久事件）
  ├─ 回合结束检测: sessionStats.turns 增加 → turn-end 事件（"待查看"通知）
  └─ buildContexts + saveContexts: 轮次摘要 → contexts.json（完整内容，供侧边栏）
浏览器半侧（lib/client.js）
  每 4s: session.list + 逐会话 session.projections 补齐（NS_KEYS 含 turnOutline/sessionStats）
       + fetchNodeEvents/fetchNodeContexts（经鉴权 /api/file 读 Node 产物）
       + 订阅 ctx.workspaces.list（workspace/follow 推送的 archivedSessionIds，归档同步源）
  → 收件箱（左列表+右详情分栏）/ 看板六列 / 会话侧边栏
```

### 数据流要点（踩过的坑）

1. **session/list 行不带 todos/userQuestions/goal/turnOutline/sessionStats**——必须逐会话补调 `session.projections({sessionId})`（NS_KEYS 数组控制，带 6s 超时）
2. **todo 投影是瞬态的**：下一轮开始即清空——完成检测必须在迁移瞬间写事件（Node 半侧职责）
3. **turnOutline 投影自带截断（…）**：完整对话必须从会话日志源文件 `session.v4.jsonl.zstd` 重建（多帧 zstd，逐 magic 28 B5 2F FD 解压；注意 header 单帧只有 211B，要用"解出行数≤5 走多帧"判断）
4. **turn 配对用 turn/start 锚定**：turn/start→该轮首条 user 消息（source.kind==="user"）为 prompt，轮内后续 user 消息是 steering，assistant/message.data.turn 聚合为 response，turn/end 收口。无 prompt 的轮（纯自动轮）跳过
5. **sessionId 已带 `session-` 前缀**：日志目录拼接是 `path.join(sessionsDir, sessionId)` 不要再加前缀（踩过 `session-session-...` 的坑）
6. Node 半侧写 contexts.json/events.json 每次轮询全量重建；浏览器经 `/api/file?path=<绝对路径>` 读取（homeBase 取 ctx.remote.hostFacts.home，回退 C:/Users/sunsh）
7. **工作区"归档对话"不在 session.list 里体现**：归档是 registry 全局集合 `archivedSessionIds`，由 `workspace/follow` 流推送、shell 的 `ctx.workspaces.list` 服务维护快照（inject `"workspaces"`）。插件订阅该快照做双半侧同步：看板（工作区已归档 > 手动覆盖 > 自然推导）+ 收件箱（条目按会话同步归档，与本地标记取并集）。服务缺失时告警降级（归档同步关闭，其余不受影响）

## 四、inject 门禁（浏览器半侧必知）

`exports.inject = ["slots", "locale", "remote", "remote.session", "remote.userQuestions", "uiWorkspace"]`

- `ctx.remote.<ns>` 访问受门禁：key = **端点前缀**（session/list → "remote.session"）
- 错误消息会直接写缺的 key（如 `cannot get property "remote.session" without inject`）
- React 组件内**不能用 ctx.effect/ctx.on/ctx.slots**（那是宿主 API）——组件里用 React.useEffect

## 五、已实现功能清单

**收件箱**：
- 左右分栏（multica 桌面式）：左列表（点击选中+自动已读、未读蓝点、右键菜单：已读/未读/归档/静音/跳转）+ 右详情（徽章+标题+待确认区+最近对话+回复框+操作栏）
- 详情：最近 3 轮完整对话（turnOutline 兜底 + contexts.json 优先）、待确认问题内联作答（continued 状态）
- 筛选器（按类型六种）、Tab 未读双徽章（全部/待处理）、日期分组（今天/昨天/更早）、多选批量操作（已读/归档+Toast 撤销）、键盘快捷键（j/k 导航、Enter 打开、e 归档、Shift+X 勾选——输入框聚焦时不干扰）
- **搜索**：页头搜索框，按标题/问题文本/所属会话完整对话正文过滤（大小写不敏感子串，`filterEntriesByQuery` 测试接缝）；搜索空态显示「无匹配」+ 当前行数
- 通知订阅策略（filterNotifications）：turn-end 仅对"活跃任务会话"投递（回信驱动 / 有 todos / 有 goal / 有待确认问题）；静音会话屏蔽动态；待处理 Tab 不含 turn-end（低优先级归入全部）
- **工作区归档同步**：会话在工作区侧边栏归档后，其全部消息（实时问题+Node 事件）自动进「已归档」Tab、退出全部/待处理与未读计数；工作区取消归档后自动回来（follow 流实时推送）。条目级"取消归档"= 清本地标记 + 调 `workspaces.unarchiveSession` 解除工作区归档（shell 服务优先、`remote.workspace` RPC 兜底）

**看板**：
- 六列彩色（列背景 tint + 列头左色条 + 卡片左缘色条），列头计数 + hover 动作（归档全部）
- 拖拽换列 + **交接矩阵**（resolveHandoff）：→进行中发继续指令（可编辑确认框）、进行中→待办先取消回合、→已完成发收尾指令、待确认→其他提示仍在等待、运行中→已归档提示先取消
- 拖拽视觉：th-dragging 类（rotate 1.5° + 阴影），目标列虚线高亮
- 卡片：标题两行截断、进度条、运行中呼吸点、工作区筛选（页头下拉多选）
- 会话侧边栏：上下文轮次（contexts.json 优先）+ 待确认处理 + 回信 + 跳转对话
- **搜索**：页头搜索框，按卡片标题/对话内容/清单内容过滤（在当前工作区筛选范围内叠加，`filterRowsByQuery` 测试接缝）
- **工作区归档同步**：工作区已归档的会话强制落入「已归档」列（最高优先级，压过手动拖拽覆盖与自然推导，默认折叠不碍眼），卡片带「工作区」小标；把这类卡片拖出归档列会先调 `workspaces.unarchiveSession` 解除工作区归档再落覆盖（否则会被推导拉回）；工作区侧取消归档后卡片自动回推导列
- **归档列防堆积**：归档列头「隐藏」一键收起全部卡片（列头保留计数 + 提示行「已隐藏 N 个」，随时可「显示」）；开关 `boardArchivedHidden` 持久化，老数据缺省 = 显示卡片（升级无感知）

## 六、已知问题 / 待办

1. **收件箱详情区从快照读 turnOutline 仍可能有省略**——已改为 contexts.json（Node 从日志源重建，完整）优先；若侧边栏"暂无轮次记录"，检查 contexts.json 是否生成
2. **权限审批**（瞬态 waterfall）不参与聚合——官方无持久投影，等 DSH 开放后再做
3. **看板卡片点击现在弹侧边栏**，"跳转对话"按钮在卡片底部和侧边栏底部都有
4. 诊断行已移除；SafeBoundary 错误边界已就位（渲染出错显示错误文字不白屏）

## 七、测试与验证

```bash
node test/harness.cjs   # 60+ 断言，全绿 = PASSED（stderr 的 warn 是预期内）
```

- 测试台用 `new Function("window", src)` 执行 bundle，React/document/localStorage 全桩
- 桩需支持：React.Component（class，SafeBoundary 用）、useState/useSyncExternalStore 等；ctx 桩含 workspaces 服务（wsListStub 可 push 模拟 follow 推送）与 remote.workspace RPC
- **必须验证的场景**：inject 门禁声明（含 workspaces/remote.workspace）、双页面+双入口注册（单 inject 多 register 模式！）、通知订阅策略（filterNotifications）、交接矩阵（resolveHandoff）、回合结束检测（lastTurns 迁移）、补齐驱动检测、工作区归档同步（__entryArchived 测试接缝）、搜索（matchQuery/sessionSearchText/filterEntriesByQuery/filterRowsByQuery 测试接缝）
- 分享包改动后：重跑 `dist\install.ps1 -HomeDir <假目录>` 端到端验证（脚本幂等、自动备份），再重打两个 zip

## 八、关键契约（违反即挂）

1. **同一槽位只能 inject 一次**——多条目用单 inject 多 register（违反 → web boot 激活失败，崩溃日志在 `AppData\Roaming\@deepseek-ai\dsh-desktop\logs\crash-*-web-boot.log`）
2. **浏览器组件内禁用宿主 API**（ctx.effect/ctx.on/ctx.slots）——用 React.useEffect
3. **Remote 调用返回信封** `{ok, value|error}`——必须判 res.ok
4. **dsh.client.inject 只排序激活**，不能 require Harness Client 包作为模块

## 九、用户偏好（交互设计）

- 收件箱/看板是**平级两个菜单**（非内嵌 Tab）：收件箱=通知流，看板=全局统览
- 「待处理」Tab 不含"待查看"类（低优先级归入「全部」）；默认 Tab = 全部
- Tab 顺序：全部 → 待处理 → 已归档；「待处理」要有未读数徽章
- 完成通知是持久通知（需已读/归档确认）；待确认条目回答后自动消失
- 通知订阅策略已确认：回信驱动 + 结构性信号（todos/goal/待确认）
- 喜欢完整内容展示（反感省略号）；轮次正序（旧上新下）
- 已验证可用：右键菜单、批量操作+撤销、日期分组、会话聚合（group by session，可折叠，含未读徽章+进度）

## 十、新对话开工模板

```
继续开发 dsh-task-hub 插件。先读 E:\IdeaProjects\study-project\dsh-task-hub\README.md
和 E:\IdeaProjects\study-project\dsh-plugin-research\DSH插件开发要点.md，
然后 [新的需求描述]。
```
