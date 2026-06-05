# Direct Flow Mode

适用于用户希望 Codex 在当前会话内直接推进需求，但仍要求先确认流程和计划的情况。

## 目标

在当前会话内完成：

任务分类 -> 流程确认 -> `superpowers:brainstorming`（feature/行为变更必需）-> `writing-plans` -> `executing-plans` -> 审查 -> 测试 -> 验收。

## 执行方式

1. 先判断任务类型。
2. 输出简短流程卡片。
3. 等待用户确认。
4. 用户确认后，读取对应 workflow reference。
5. 按需读取 checklist。
6. 如果任务是 feature 或行为变更，先完成 `superpowers:brainstorming`，并拿到设计确认。
7. 输出 `writing-plans`。
8. `writing-plans` 确认前，不得写代码。
9. `writing-plans` 确认后，进入 `executing-plans`。
10. 开发完成后执行代码审查、测试和验收。

## 输出要求

第一轮不要展开完整流程，只展示当前任务需要的最小信息。推荐流程用一行表达，细节等用户确认后再展开。

如果任务分类为 `backend-feature`、`frontend-feature`、`fullstack-feature`，或需求会新增功能、创建组件、修改业务行为，第一轮推荐流程必须显式包含 `superpowers:brainstorming`，不得只写“需求分析”。

## 禁止事项

- 禁止未确认计划就修改代码。
- 禁止 feature 或行为变更跳过 `superpowers:brainstorming`。
- 禁止未确认数据库方案就真实变更数据库。
- 禁止跳过接口契约。
- 禁止跳过 UI 边界定义。
- 禁止跳过代码审查。
- 禁止跳过测试。
- 禁止把历史失败测试伪装成本次通过。
