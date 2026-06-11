# Direct Flow Mode

`direct-flow` 是当前会话执行模式。它不是流程预览，也不是只输出流程卡片；分类完成后，必须读取对应 workflow，并直接进入第一个实际阶段。

## 执行定位

目标是在当前会话内按 workflow 推进：

```text
任务分类 -> 读取对应 workflow -> 进入第一个实际阶段 -> writing-plans -> 用户确认 -> executing-plans with TDD -> 子代理交接 -> 代码审查 -> 测试 -> 验收
```

`references/workflows/*.md` 是唯一流程来源。本文件只说明 direct-flow 如何执行 workflow。

## 启动步骤

1. 判断任务类型和置信度。
2. 按任务类型读取一个对应 workflow。
3. 读取必要 checklist、`agent-skill-routing.md` 和 `review-and-handoff.md`。
4. 输出当前分类、判断理由、影响范围和即将进入的 workflow 阶段。
5. 直接进入 workflow 的第一个实际阶段：
   - feature / 行为变更：进入 `superpowers:brainstorming`。
   - bugfix：进入 bug-reproduce / `superpowers:systematic-debugging`。
6. 阶段标记“需要用户确认”时，必须停止并等待确认。

## 阶段执行规则

每个 workflow 阶段都必须按阶段表执行：

- 使用：实际读取并执行列出的 skill，或启动列出的 subagent。
- 输入：说明本阶段使用了哪些上下文、文件、测试、日志、接口或设计结论。
- 输出：给出本阶段产出物，不得只写“已完成”。
- 是否允许改代码：否的阶段不得改代码；是的阶段也只能在用户确认后按计划范围改。
- 是否需要用户确认：是的阶段必须等待用户确认后才能进入下一阶段。

如果阶段要求的 skill 或 subagent 不可用，必须输出：

```text
未使用/未启动 <skill/subagent>。
原因：<不可用原因>。
替代：由主 agent 按 <skill/subagent> 的同等职责执行。
替代产出：<本阶段产出物>。
```

不得假装 skill 或 subagent 已经执行。

## 必须实际执行的能力

- feature / 行为变更：必须实际使用 `superpowers:brainstorming`。
- bugfix：必须实际使用 `superpowers:systematic-debugging` 做复现、现象确认、根因假设和验证路径。
- 进入实现前：必须实际使用 `superpowers:writing-plans`。
- 用户确认计划后：必须实际使用 `superpowers:executing-plans`，并把 TDD 或回归测试策略嵌入执行。
- 完成前：必须实际使用 `superpowers:verification-before-completion`。
- 复杂后端设计：编码前必须实际使用 `backend-feature-design-review`。
- 后端实现后：后端审查阶段必须再次使用 `backend-feature-design-review`。
- 需要协作文档：先询问是否使用 `feature-doc-pack`；用户确认后再实际使用。
- 需要真实浏览器验证：按项目环境使用 Playwright；Windows Codex 环境优先使用 `playwright-local-runtime`。

## 子代理规则

- 子代理只在用户确认计划后按 workflow 阶段启动。
- 启动前必须写清职责边界、只读或可写、可读取范围、可修改范围、禁止事项、输入、输出和验证要求。
- 不允许多个 subagent 同时修改同一文件或同一模块。
- 子代理不可用时，主 agent 按同等职责替代并说明。
- 每个子代理完成后，必须按 `review-and-handoff.md` 回收交接报告。

## 输出要求

direct-flow 第一轮输出不再是“等用户确认流程后再开始”的卡片，而是：

1. 工作模式：`direct-flow`
2. 任务类型和置信度
3. 判断理由
4. 影响范围
5. 读取的 workflow
6. 当前进入的第一阶段
7. 本阶段实际使用的 skill / subagent 或替代执行说明
8. 本阶段输入
9. 本阶段输出
10. 风险、待确认问题和下一步

如果第一阶段需要用户确认，输出阶段结论后停止等待确认。不要提前进入 `writing-plans`。

## 禁止事项

- 禁止未确认计划就修改代码。
- 禁止 feature 或行为变更跳过 `superpowers:brainstorming`。
- 禁止 bugfix 跳过 `superpowers:systematic-debugging`。
- 禁止只列出 skill / subagent 名称但不执行对应职责。
- 禁止假装某个 subagent 已经执行。
- 禁止未确认数据库方案就真实变更数据库。
- 禁止跳过接口契约、UI 边界、代码审查、测试或验收。
- 禁止把历史失败测试伪装成本次通过。
