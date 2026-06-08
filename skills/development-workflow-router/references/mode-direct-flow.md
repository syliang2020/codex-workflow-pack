# Direct Flow Mode

适用于用户希望 Codex 在当前会话内继续推进需求，但仍要求先确认流程和计划的情况。

## 目标

在当前会话内完成：

`任务分类 -> 流程确认 -> 实际使用 superpowers skills -> 必要设计门禁 -> writing-plans -> 用户确认 -> executing-plans -> 必要 subagents -> 审查 -> 测试 -> 验收`

## 当前会话执行规则

1. 先判断任务类型、影响范围和置信度。
2. 第一轮只输出简短流程卡片，并等待用户确认。
3. 用户确认后，必须读取对应 workflow reference、checklist、`agent-skill-routing.md` 和 `review-and-handoff.md`。
4. 到达某个阶段时，必须实际使用该阶段对应 skill；不能只列名。
5. 需要 subagent 时，必须按 `agent-skill-routing.md` 启动并交接；如果不可用，说明原因并由主 agent 按同等职责替代。
6. 每次使用 skill 或 subagent 后，都要输出“已使用能力 / 产出物 / 后续影响”。
7. 不得声称某个 skill、subagent 或审查已完成，除非已经真实执行或明确主 agent 替代执行。

## 必须实际使用的 skills

按任务类型触发：

- feature 或行为变更：必须先实际使用 `superpowers:brainstorming`，并拿到设计确认。
- bugfix：必须先实际使用 `superpowers:systematic-debugging` 做复现、现象确认、根因假设和验证路径。
- 新功能或 bugfix 进入实现前：必须使用 `superpowers:writing-plans`。
- 用户确认计划后：必须使用 `superpowers:executing-plans`。
- 实现完成后声称完成前：必须使用 `superpowers:verification-before-completion`。
- 涉及复杂后端设计：编码前必须使用 `backend-feature-design-review`。
- 涉及协作文档场景：必须先询问是否使用 `feature-doc-pack`；用户确认后实际使用。
- 涉及 UI/UX 审查：按需要使用 `ui-ux-pro-max`。
- 涉及 Windows Codex Playwright 运行链路：按需要使用 `playwright-local-runtime`。

## 必要 subagents

用户确认流程和计划后，按任务实际需要启动：

- 后端实现：`spring-boot-engineer`。
- 接口契约：`api-designer`。
- SQL、索引、迁移草案：`sql-pro`。
- 前端实现：`frontend-developer`。
- UI 方案或体验检查：`ui-designer`、`ui-fixer` 或 `ui-ux-pro-max`。
- 通用代码审查：`reviewer`。
- 问题定位：`debugger`。
- 安全风险：`security-auditor`。

如果当前环境没有对应 subagent，必须写明：“未启动 `<name>`，原因：<原因>；由主 agent 按 `<name>` 职责替代执行。”

## 输出要求

第一轮不要展开完整流程，只展示当前任务需要的最小信息。推荐流程用一行表达，细节等用户确认后再展开。

第一轮必须包含：

1. 工作模式：`direct-flow`
2. 任务类型和置信度
3. 判断理由
4. 影响范围
5. 推荐流程
6. 必须实际使用的 skills
7. 可能需要启动的 subagents
8. 如果能力不可用时的主 agent 替代策略
9. 下一步确认问题

## 禁止事项

- 禁止未确认计划就修改代码。
- 禁止 feature 或行为变更跳过 `superpowers:brainstorming`。
- 禁止 bugfix 跳过 `superpowers:systematic-debugging`。
- 禁止只列出 skill / subagent 名称但不执行对应职责。
- 禁止假装某个 subagent 已经执行。
- 禁止未确认数据库方案就真实变更数据库。
- 禁止跳过接口契约、UI 边界、代码审查、测试或验收。
- 禁止把历史失败测试伪装成本次通过。
