# Review And Handoff Rules

## 子代理交接规则

每个 subagent 完成任务后，必须输出交接报告：

1. 完成内容。
2. 修改文件清单。
3. 测试命令。
4. 测试结果。
5. 未完成项。
6. 风险点。
7. 是否存在计划外修改。
8. 是否需要主 agent 继续处理。

不得编造 subagent 已经执行的检查、测试或结论。没有真实启动 subagent 时，必须标注为“主 agent 替代执行”，并说明原因。

## 主 agent 回收规则

主 agent 回收 subagent 后，必须检查：

1. `git status`
2. `git diff`
3. 构建结果。
4. 测试结果。
5. 是否符合 `writing-plans`。
6. 是否有计划外修改。
7. 是否存在前后端接口不一致。
8. 是否存在未处理 TODO、临时 mock 或占位实现。

如果 subagent 不可用，由主 agent 替代执行时，也必须按同样清单自查，并在输出中说明“未启动 subagent 的原因”和“主 agent 替代产出”。

## 审查规则

审查阶段不能只列 `reviewer`、`backend-feature-design-review` 或 `ui-ux-pro-max` 名称。必须实际执行对应职责，并输出发现、风险和结论。

后端审查：

- 必须使用 `backend-feature-design-review` skill；如果 skill 不可用，说明原因并由主 agent 按同等标准检查。
- 可按需启动 `reviewer` subagent 做 PR 风格审查；如果不可用，主 agent 按 reviewer 职责替代。
- 检查接口契约、分层、事务、权限、异常、分页、数据一致性、幂等性、历史数据兼容、重复代码和测试覆盖。

前端审查：

- 优先使用 `ui-ux-pro-max` skill；如果 skill 不可用，说明原因并由主 agent 按同等标准检查。
- 可按需启动 `reviewer` 或 `ui-fixer` subagent；如果不可用，主 agent 按对应职责替代。
- 检查交互、状态、表单校验、接口调用、错误提示、权限展示、加载态、空状态、响应式和可访问性。

全栈审查：

- 必须同时检查接口契约、字段语义、前后端状态一致性、错误处理、权限边界和联调路径。
- 必须说明哪些审查由 skill 完成、哪些由 subagent 完成、哪些由主 agent 替代完成。

## 只读审查规则

用户要求只读审查时：

1. 不修改文件。
2. 不进入 `executing-plans`。
3. 不启动实现型 subagent。
4. 可以按只读边界启动 `reviewer`、`api-designer`、`sql-pro`、`debugger` 或 `security-auditor`。
5. 如果只读 subagent 不可用，由主 agent 按同等职责替代，并明确说明。
6. 输出必须区分历史问题、本次新增问题、本次修改扩大历史问题。
7. 本次新增或扩大的问题必须标为需要修复；不能标成历史遗留。

## 测试结果记录

测试结果必须标记为：

- `passed`：测试通过。
- `failed`：测试失败，必须修复后重跑。
- `not-run`：未运行，必须说明原因。

如果测试失败：

1. 不得直接进入验收。
2. 必须定位失败原因。
3. 如果是本次改动导致，必须修复。
4. 如果是历史遗留问题，必须说明证据和影响。
5. 最终验收报告必须包含测试状态。

## 验收报告

最终必须输出：

1. 完成功能。
2. 修改文件。
3. 实际使用的 skills。
4. 实际启动的 subagents。
5. 未启动的 skills / subagents 及替代执行原因。
6. 数据库变更。
7. 接口清单。
8. 前端页面清单。
9. 测试结果。
10. Playwright 或浏览器测试结果。
11. 已知风险。
12. 后续建议。

如果没有实际使用某个应该使用的 skill 或 subagent，验收报告必须说明原因和替代产出；不得静默省略。
