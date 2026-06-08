# Prompt Preview Mode

适用于用户希望先生成完整可复制提示词，然后自行检查、修改、再复制给 Codex 执行的情况。

## Prompt-preview 输出定位

`prompt-preview` 只能输出 `superpowers workflow prompt`，不是普通 implementation prompt。

生成出来的提示词必须用于驱动 Codex 按阶段工作：先澄清、复现或设计，再写计划并等待用户确认，然后执行计划、交接子代理、审查、测试和验收。即使用户已经给出详细实现建议，也只能把这些建议放入对应阶段，不能跳过阶段、不能直接要求 Codex 改代码。

当前会话不启动 subagent；但生成的提示词必须明确要求下一轮 Codex 在对应阶段实际使用 required skills 和必要 subagents。如果 skill 或 subagent 不可用，下一轮 Codex 必须说明原因，并由主 agent 按同等职责替代，不能假装已经执行。

## 当前模式限制

1. 当前会话只生成提示词，不修改代码。
2. 当前会话不执行命令。
3. 当前会话不使用项目 MCP、数据库连接工具或迁移执行工具。
4. 当前会话不进入 `executing-plans`。
5. 当前会话不创建、不修改、不删除数据库对象。
6. 当前会话不运行测试。
7. 当前会话不生成虚假的测试结果。
8. 当前会话只输出可复制的 `superpowers workflow prompt`。

## 禁止生成普通 implementation prompt

禁止输出这类普通实现提示词：

- “请实现以下后端需求、前端需求、测试要求。”
- “根据下面方案直接修改代码。”
- “先做接口，再做页面，最后测试。”
- 只列需求清单、文件清单、接口清单或注意事项，但没有 superpowers 阶段闸门。
- 把用户给出的实现建议原样改写成开发任务列表，并要求 Codex 直接开始编码。
- 只列出 skill / subagent 名称，但没有要求下一轮 Codex 实际执行对应职责。

如果输出中没有显式阶段闸门，或者没有要求用户确认后才能进入下一阶段，就视为失败。

## 输出格式

先输出任务判断：

- 工作模式：`prompt-preview`
- 任务类型
- 分类置信度
- 判断理由
- 适用原因
- 假设条件和不确定点

然后输出：

```text
下面是可复制给 Codex 的 superpowers workflow prompt：
```

## Superpowers workflow prompt 强制模板

生成的完整提示词必须包含下面骨架，并按任务类型填充对应内容。

```text
请按 development-workflow-router 执行本任务。你现在拿到的是 superpowers workflow prompt，不是直接实现提示词。

【任务分类】
- 任务类型：<backend-feature | frontend-feature | fullstack-feature | backend-bugfix | frontend-bugfix | fullstack-bugfix>
- 分类置信度：<high | medium | low>
- 已知需求：<概述用户需求>
- 假设条件和不确定点：<列出需要确认的点>

【总闸门】
- 不要直接开始改代码。
- 不要跳过任何阶段。
- 每个阶段结束都要输出阶段结论、风险和下一步，并在需要时等待用户确认。
- 用户给出的详细实现建议必须归入对应阶段，不得用来绕过 brainstorm / bug-reproduce、writing-plans、用户确认或 executing-plans。
- 不能只列出 skill / subagent 名称；写到流程里的 skill 必须实际读取并执行，写到流程里的 subagent 必须真实启动并交接。
- 如果某个 skill 或 subagent 不可用，必须说明原因，并由主 agent 按同等职责替代执行，不能假装已经执行。

【阶段 1：brainstorm / bug-reproduce】
- 如果是 feature 或行为变更：必须先使用 `superpowers:brainstorming`。
- 如果是 bugfix：必须先使用 `superpowers:systematic-debugging` 做 bug-reproduce、现象确认、影响范围和根因假设；修复会改变业务行为时，根因确认后还必须补 `superpowers:brainstorming`。
- 本阶段必须确认需求目标、影响范围、边界、成功标准和不做什么。
- 本阶段结束前，不得写实现代码。
- 阶段输出必须说明实际使用的 skill；如果未使用，说明不可用原因和主 agent 替代产出。

【阶段 2：数据库 / 接口 / UI / 修复方案设计】
- 数据库：说明是否涉及表、字段、索引、迁移、回填、历史数据兼容和数据来源；需要时使用 `sql-pro` 或数据库 checklist。
- 接口：说明 API 契约、入参、出参、兼容性、错误码、权限和调用方影响；需要时使用 `api-designer`。
- UI：说明页面、交互、状态、响应式、可访问性和真实浏览器验证；需要时使用 `frontend-developer`、`ui-designer` 或 `ui-ux-pro-max`。
- 后端：涉及复杂后端设计时，编码前使用 `backend-feature-design-review` 做设计门禁。
- Bugfix：必须给出复现证据、根因、修复方案、回归风险和验证路径。
- 用户已提供的实现建议放在本阶段对应小节评估，不得直接进入编码。
- 如果使用 `api-designer`、`sql-pro`、`ui-designer` 等 subagent，必须真实启动；不可用时主 agent 按同等职责替代并说明。

【阶段 3：writing-plans】
- 必须使用 `superpowers:writing-plans` 生成实现计划。
- 计划必须拆分文件、步骤、测试、风险、回滚和验收标准。
- 计划必须体现项目 `AGENTS.md`、README、构建脚本、测试约束和相关协作文档。
- 未完成计划前，不得进入实现。

【阶段 4：用户确认】
- 把设计和 writing-plans 结果交给用户确认。
- 用户未确认前，不得修改代码、不得执行迁移、不得启动实现型子代理。
- 如果用户提出调整，先修改设计或计划，再次等待确认。

【阶段 5：executing-plans】
- 用户确认后，必须使用 `superpowers:executing-plans` 执行计划。
- 按计划逐步实现，遇到偏离计划的情况先说明并等待确认。
- 实现过程中保持最小必要改动，不做无关重构。
- 执行阶段必须记录实际使用的 skills、启动的 subagents 和主 agent 替代执行项。

【阶段 6：子代理交接】
- 需要子代理时，按职责拆分并写清楚：任务边界、可读写范围、禁止事项、输入、输出、验证要求。
- 后端实现优先交给 `spring-boot-engineer`；接口契约交给 `api-designer`；SQL/索引交给 `sql-pro`；前端实现交给 `frontend-developer`；UI 体验交给 `ui-designer` 或 `ui-ux-pro-max`；审查交给 `reviewer`；问题定位交给 `debugger`。
- 不允许多个子代理同时修改同一文件或同一模块。
- 没有对应子代理时，由主 Codex 按同等职责执行，并说明原因。
- 不得只写“交给某 subagent”；必须真实启动并回收交接报告，或明确“未启动，主 agent 替代执行”。

【阶段 7：代码审查】
- 实现后必须进行代码审查。
- 后端部分必须使用 `backend-feature-design-review` 检查字段语义、命名一致性、分层、校验位置、事务边界、save/update 复用、历史数据兼容和测试覆盖。
- 通用代码审查使用 `reviewer`，并区分历史问题、本次新增问题、本次修改扩大历史问题。
- 审查发现的本次新增阻塞问题必须修复，不能只解释原因。
- 审查输出必须说明实际使用的审查 skill / subagent；如果不可用，说明主 agent 替代执行的检查项和结论。

【阶段 8：测试】
- 必须运行与改动匹配的单元测试、接口测试、构建检查或静态检查。
- 涉及前端或浏览器行为时，必须使用 Playwright 或项目认可的真实浏览器验证。
- 不能伪造测试结果；无法运行的测试必须说明原因、风险和替代验证。

【阶段 9：验收】
- 输出变更摘要、修改文件、验证命令、测试结果、剩余风险、未覆盖点和建议验收路径。
- 输出实际使用的 skills、实际启动的 subagents、未启动原因和主 agent 替代产出。
- 验收前必须使用 `superpowers:verification-before-completion`。
- 不得声称完成，除非验证证据已经给出。

【本次需求特殊要求】
- <把用户提供的特殊限制和实现建议按阶段放入这里；不要编造>
```

## 阶段内容填充规则

- `backend-feature`：必须强调 `superpowers:brainstorming`、后端设计门禁、API/数据库影响判断、`writing-plans`、用户确认、`executing-plans`、审查、测试和验收。
- `frontend-feature`：必须强调 `superpowers:brainstorming`、UI/交互设计、真实浏览器验证、`writing-plans`、用户确认、`executing-plans`、审查、测试和验收。
- `fullstack-feature`：必须同时覆盖数据库、接口、UI、联调、Playwright、`writing-plans`、用户确认、`executing-plans`、子代理交接、审查、测试和验收。
- `backend-bugfix`：必须先 bug-reproduce / `superpowers:systematic-debugging`，再设计修复方案，之后进入 `writing-plans`、用户确认、`executing-plans`、审查、测试和验收。
- `frontend-bugfix`：必须先 bug-reproduce / `superpowers:systematic-debugging`，必要时用真实浏览器复现，再设计修复方案，之后进入 `writing-plans`、用户确认、`executing-plans`、审查、测试和验收。
- `fullstack-bugfix`：必须先 bug-reproduce / `superpowers:systematic-debugging`，明确前后端边界和接口契约，再设计修复方案，之后进入 `writing-plans`、用户确认、`executing-plans`、子代理交接、审查、测试和验收。

## 特殊要求占位区

生成的完整提示词必须包含：

```text
【本次需求特殊要求】
- 在这里追加本次需求的特殊限制和实现建议。
- 如果用户已经给出详细实现建议，把它们拆到 brainstorm / bug-reproduce、设计、writing-plans、executing-plans、审查、测试或验收阶段。
- 不要因为用户给了实现建议就跳过阶段确认。
```

不得替用户编造特殊要求。

## 结束提醒

最后输出：“你可以先检查这份 superpowers workflow prompt。如果本次需求有特殊要求，可以在【本次需求特殊要求】部分追加后再发给 Codex；执行时仍必须按阶段等待确认，不能直接开始改代码。”
