# Prompt Preview Mode

`prompt-preview` 用于生成完整、可复制给下一轮 Codex 的 `superpowers workflow prompt`。当前会话只生成提示词，不执行命令、不修改文件、不启动 subagent。

## Prompt-preview 输出定位

`prompt-preview` 只能输出 `superpowers workflow prompt`，不是普通 implementation prompt。

生成出来的提示词必须用于驱动下一轮 Codex 按阶段工作：先 brainstorm 或 bug-reproduce，再做数据库 / 接口 / UI / 修复方案设计，接着 writing-plans、用户确认、executing-plans with TDD、子代理交接、代码审查、测试和验收。

即使用户已经给出详细实现建议，也只能把这些建议放入 workflow 对应阶段，不能跳过阶段，不能直接要求 Codex 改代码。

## 当前模式限制

1. 当前会话只生成提示词，不修改代码。
2. 当前会话不执行命令。
3. 当前会话不启动 subagent。
4. 当前会话不使用项目 MCP、数据库连接工具或迁移执行工具。
5. 当前会话不进入 `executing-plans`。
6. 当前会话不创建、不修改、不删除数据库对象。
7. 当前会话不运行测试。
8. 当前会话不生成虚假的测试结果。

## Workflow 来源规则

- 必须先判断任务类型。
- 必须读取对应的 `references/workflows/<task-type>.md`。
- 完整提示词的阶段必须来自该 workflow。
- 不得在 prompt-preview 中凭空生成另一套阶段顺序。
- workflow 每个阶段的“使用、输入、输出、是否允许改代码、是否需要用户确认”必须体现在生成的提示词中。

## Superpowers workflow prompt 强制模板

生成的完整提示词必须以这句话开头：

```text
请使用 superpowers 完成本次开发。你现在拿到的是 superpowers workflow prompt，不是直接实现提示词。
```

禁止使用要求下一轮再次调用本 router 的开头或同类递归调用。

完整提示词必须包含以下结构：

```text
请使用 superpowers 完成本次开发。你现在拿到的是 superpowers workflow prompt，不是直接实现提示词。

【任务分类】
- 任务类型：<backend-feature | frontend-feature | fullstack-feature | backend-bugfix | frontend-bugfix | fullstack-bugfix>
- 分类置信度：<high | medium | low>
- 判断理由：<为什么这样分类>
- 已知需求：<概述用户需求>
- 假设条件和不确定点：<列出需要确认的点>
- 使用的 workflow：<references/workflows/<task-type>.md>

【总闸门】
- 不要直接开始改代码。
- 不要跳过任何 workflow 阶段。
- feature 或行为变更不得跳过 `superpowers:brainstorming`。
- bugfix 不得跳过 bug-reproduce / `superpowers:systematic-debugging`。
- 不得跳过数据库 / 接口 / UI / 修复方案设计。
- 不得跳过 `superpowers:writing-plans`。
- 不得跳过用户确认；计划未确认前不得修改代码、不得执行迁移、不得启动实现型 subagent。
- 不得跳过 `superpowers:executing-plans`；执行阶段必须体现 TDD 或回归测试策略。
- 不得跳过子代理交接、代码审查、测试和验收。
- 写到流程里的 skill 必须实际读取并执行。
- 写到流程里的 subagent 必须真实启动并交接；不可用时说明原因，并由主 agent 按同等职责替代。
- 如果用户提供了详细实现建议，只能归入对应阶段，不能改写成直接实现清单。

【Workflow 阶段】
<按读取到的 workflow 逐阶段填充。每个阶段都必须包含：阶段名、使用、输入、输出、是否允许改代码、是否需要用户确认、执行要求。>

【Skills 与子代理执行计划】
- 必须使用的 skills：<按本任务列出，包含阶段、触发原因、读取内容、预期产出、不可用替代>
- 条件使用的 skills：<按触发条件列出>
- 明确不使用的 skills：<常见但本任务不适用或用户禁止的 skill，并说明原因>
- 必须启动的 subagents：<按本任务列出，包含阶段、只读/可写、职责边界、可读取范围、可修改范围、禁止事项、交付物、验证要求、不可用替代>
- 条件启动的 subagents：<按触发条件列出>
- 明确不启动的 subagents：<常见但本任务不适用或用户禁止的 subagent，并说明原因>

【本次需求特殊要求】
- <把用户提供的特殊限制和实现建议按阶段放入，不要编造>

【验收输出要求】
- 输出变更摘要、修改文件、验证命令和结果、剩余风险、未覆盖点、建议验收路径。
- 输出实际使用的 skills、实际启动的 subagents、未启动原因和主 agent 替代产出。
```

## 禁止生成普通 implementation prompt

禁止输出这类普通实现提示词：

- “请实现以下后端需求、前端需求、测试要求。”
- “根据下面方案直接修改代码。”
- “先做接口，再做页面，最后测试。”
- 只列需求清单、文件清单、接口清单或注意事项，但没有 superpowers 阶段闸门。
- 把用户给出的实现建议原样改写成开发任务列表，并要求 Codex 直接开始编码。
- 只列出 skill / subagent 名称，但没有要求下一轮 Codex 实际执行对应职责。
- 只保留通用阶段说明，没有针对当前任务列出具体 skills 使用计划和 subagent 启动计划。
- 让下一轮 Codex 再调用 `development-workflow-router`，而不是直接按 superpowers workflow prompt 执行。

如果输出中没有显式阶段闸门，或者没有要求用户确认后才能进入下一阶段，就视为失败。

## 阶段填充规则

- `backend-feature`：必须包含 `superpowers:brainstorming`、数据库 / 接口设计、`backend-feature-design-review` 编码前设计门禁、`superpowers:writing-plans`、用户确认、`superpowers:executing-plans with TDD`、子代理交接、`backend-feature-design-review` 编码后审查、测试和验收。
- `frontend-feature`：必须包含 `superpowers:brainstorming`、UI / 交互设计、接口依赖确认、`superpowers:writing-plans`、用户确认、`superpowers:executing-plans with TDD`、子代理交接、UI/UX 审查、真实浏览器验证和验收。
- `fullstack-feature`：必须同时覆盖数据库、接口、UI、联调、`backend-feature-design-review`、`ui-ux-pro-max`、`superpowers:writing-plans`、用户确认、`superpowers:executing-plans with TDD`、子代理交接、代码审查、Playwright 或浏览器测试和验收。
- `backend-bugfix`：必须先 bug-reproduce / `superpowers:systematic-debugging`，再根因定位、修复方案设计、`superpowers:writing-plans`、用户确认、`superpowers:executing-plans with TDD`、子代理交接、审查、回归测试和验收。
- `frontend-bugfix`：必须先 bug-reproduce / `superpowers:systematic-debugging`，必要时真实浏览器复现，再根因定位、修复方案设计、`superpowers:writing-plans`、用户确认、`superpowers:executing-plans with TDD`、子代理交接、UI/UX 审查、浏览器回归和验收。
- `fullstack-bugfix`：必须先 bug-reproduce / `superpowers:systematic-debugging`，再确认前后端责任边界、修复方案设计、`superpowers:writing-plans`、用户确认、`superpowers:executing-plans with TDD`、子代理交接、代码审查、联调回归、浏览器验证和验收。

## 结束提醒

最后输出：

```text
你可以先检查这份 superpowers workflow prompt。如果本次需求有特殊要求，可以在【本次需求特殊要求】部分追加后再发给 Codex；执行时仍必须按阶段等待确认，不能直接开始改代码。
```
