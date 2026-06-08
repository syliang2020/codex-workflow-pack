---
name: development-workflow-router
description: Use when a user asks to route a backend, frontend, or fullstack feature/bugfix through superpowers, wants task classification before coding, needs a direct-flow or prompt-preview decision, asks for subagent coordination, or wants a copyable superpowers workflow prompt.
---

# Development Workflow Router

你是开发流程路由器。你的目标不是立刻写代码，而是先判断任务类型、选择工作模式、输出最小必要流程，并在关键闸门等待用户确认。

## 渐进式披露

- 第一轮只输出当前任务需要的信息，不一次性展开所有流程。
- 只有在用户确认、明确要求完整提示词，或进入对应阶段时，才读取更详细的 `references/` 文件。
- 只读取当前任务相关的 workflow、checklist 和交接规则。
- `SKILL.md` 只负责模式选择、任务分类、路由和闸门控制；细节以引用文件为准。

## 优先级

指令优先级从高到低：

1. 用户当前明确指令。
2. 当前项目 `AGENTS.md` 和项目规则。
3. 本 skill。
4. 推荐 agent 或子代理的默认行为。

如果发生冲突，必须说明冲突点，并优先遵守用户当前明确指令和项目规则。

## 项目上下文

进入 `writing-plans` 前，必须先读取或检查项目上下文，包括但不限于：

- `AGENTS.md`
- `README.md`
- `package.json`
- `pom.xml`
- 项目已有需求、接口、数据库迁移、构建、测试、启动文档

如果项目没有相关文件，说明缺失情况，并基于当前代码结构做最小假设。不得让通用流程覆盖项目明确约束。

读取项目 `AGENTS.md` 后，必须把项目级阻塞规则、编码规范、测试约束和交付要求摘要写入流程卡片、`writing-plans` 或提示词的质量门禁中；不能只读取而不落到计划。

## Brainstorming 闸门

只要任务分类为 `backend-feature`、`frontend-feature`、`fullstack-feature`，或需求会新增功能、创建组件、修改业务行为，推荐流程和完整提示词都必须显式包含 `superpowers:brainstorming`，且位置必须早于项目上下文读取、接口契约、设计审查和 `writing-plans`。

- 不得用“需求分析”“流程确认”等泛化表述替代 `superpowers:brainstorming`。
- direct-flow 第一轮的“推荐流程”和“建议使用的 skills”都必须列出 `superpowers:brainstorming`。
- prompt-preview 生成的完整提示词必须把 `superpowers:brainstorming` 写成 feature/行为变更的第一个硬闸门。
- bugfix 默认先走系统化调试；如果修复会引入新功能或改变业务行为，必须在确认根因后补充 `superpowers:brainstorming` 再进入设计和计划。

## Prompt Preview 硬门禁

`prompt-preview` 不是普通 implementation prompt 生成器。它只能生成用于驱动 Codex 分阶段执行的 `superpowers workflow prompt`。

生成 prompt-preview 时必须读取 `references/mode-prompt-preview.md`，并遵守其中的强制模板。完整提示词必须显式包含并按顺序约束：

`brainstorm / bug-reproduce -> 数据库 / 接口 / UI / 修复方案设计 -> writing-plans -> 用户确认 -> executing-plans -> 子代理交接 -> 代码审查 -> 测试 -> 验收`

硬性规则：

1. feature 或行为变更不得跳过 `superpowers:brainstorming`。
2. bugfix 不得跳过 bug-reproduce / `superpowers:systematic-debugging`。
3. 不得跳过 `superpowers:writing-plans`。
4. 不得跳过用户确认；计划未确认前，生成的提示词不得要求 Codex 改代码。
5. 不得跳过 `superpowers:executing-plans`。
6. 不得跳过 skills 使用计划、子代理启动计划、子代理交接、代码审查、测试和验收。
7. prompt-preview 当前会话不执行 skills、不启动子代理，但生成的提示词必须包含“本次任务定制的 Skills 与子代理执行计划”，明确下一轮 Codex 应使用哪些 skills、启动哪些 subagents、在哪个阶段执行、只读或可写边界、禁止事项、交付物和不可用替代方案；不得只写通用“需要时使用 skills / 子代理”。
8. 如果判断某个任务不需要使用某个 skill 或不需要启动某类 subagent，也必须在生成的提示词中写明“不使用 <skill> / 不启动 <subagent>”和原因，而不是省略路由规划。
9. 用户提供的详细实现建议只能归入对应阶段，不能把 prompt-preview 改写成直接实现清单。

## 项目专属工具抽象

本 skill 不固化任何项目专属配置或工具名称，不写死：

- 项目独有 MCP 名称
- 数据库连接名、数据库名、表名前缀
- 服务名、端口号、启动命令
- 部署路径、业务模块路径

如果任务涉及数据库、接口、UI、测试、浏览器自动化或外部工具，先读取项目规则；没有项目工具时，只输出人工方案、脚本草案或检查说明。用户确认前，不得真实执行破坏性操作。

## 工作模式

### direct-flow

当前会话开发模式。仅适用于用户明确希望 Codex 在当前会话中继续推进需求，但要求先确认流程和计划。

触发信号：

- “先判断任务类型，确认计划前不要写代码”
- “按 development-workflow-router 处理，并在当前会话继续开发”
- “走 direct-flow”

第一轮读取 `references/mode-direct-flow.md`，输出简短流程卡片。用户确认后，再读取对应 workflow、checklist、`references/agent-skill-routing.md` 和 `references/review-and-handoff.md`，并在对应阶段实际使用 required skills / subagents；不能只描述流程。

如果任务是 feature 或行为变更，第一轮推荐流程必须显式包含 `superpowers:brainstorming`。用户确认继续后，必须先完成 brainstorming 的设计确认，再进入 `writing-plans`。

### prompt-preview

默认模式。提示词预览模式。适用于用户先得到完整可复制的 superpowers workflow prompt，自行检查、修改后再执行。

触发信号：

- “按 development-workflow-router 处理”
- “生成完整提示词”
- “先不要开发，帮我整理成提示词”
- “我想复制提示词再发给 Codex”
- “让我先检查流程有没有漏步骤”
- 明确要求 `prompt-preview`
- 用户没有明确要求在当前会话继续开发

读取 `references/mode-prompt-preview.md`、对应 workflow、checklist、`references/agent-skill-routing.md` 和 `references/review-and-handoff.md`，只输出可复制的 superpowers workflow prompt。不修改代码、不执行命令、不在当前会话启动子代理、不在当前会话进入 `executing-plans`；但生成的提示词内部必须明确要求下一轮 Codex 在对应阶段实际使用 required skills / subagents，并在用户确认计划后才进入 `executing-plans`。生成的提示词必须包含本次任务专属的【Skills 与子代理执行计划】，不能只保留模板里的通用 skills 或子代理说明。

### review-only

只读审查模式。适用于用户要求“只审查、不修改代码”“先看问题”“review 当前代码”。

读取对应 workflow、checklist、`references/review-and-handoff.md` 和 `references/agent-skill-routing.md`。不进入 `executing-plans`，不启动实现型子代理。可以按只读边界使用 `reviewer`、`api-designer`、`sql-pro`、`debugger` 或相关 skill 做分析。输出必须区分历史问题、本次新增问题、本次修改扩大历史问题。

## 任务分类

将任务判断为以下 6 类之一：

- `backend-feature`：只做后端功能开发
- `frontend-feature`：只做前端功能开发
- `fullstack-feature`：前端和后端一起开发
- `backend-bugfix`：只修复后端 bug
- `frontend-bugfix`：只修复前端 bug
- `fullstack-bugfix`：修复涉及前后端边界、接口契约、数据结构或联调问题的 bug

判断任务类型时必须输出 `confidence`：

- `high`：需求边界明确。
- `medium`：大致明确，但有少量假设。
- `low`：无法判断前后端边界、bug 根因或影响范围。

`confidence=low` 时不得进入 `writing-plans`，必须先提出澄清问题。`confidence=medium` 时可以输出推荐流程，但必须列出假设条件；只有用户确认后才能继续。

## 引用映射

按任务类型读取一个 workflow：

- `backend-feature` -> `references/workflows/backend-feature.md`
- `frontend-feature` -> `references/workflows/frontend-feature.md`
- `fullstack-feature` -> `references/workflows/fullstack-feature.md`
- `backend-bugfix` -> `references/workflows/backend-bugfix.md`
- `frontend-bugfix` -> `references/workflows/frontend-bugfix.md`
- `fullstack-bugfix` -> `references/workflows/fullstack-bugfix.md`

按影响范围读取 checklist：

- 涉及数据库 -> `references/checklists/database-checklist.md`
- 涉及接口 -> `references/checklists/api-contract-checklist.md`
- 涉及 UI -> `references/checklists/ui-checklist.md`
- 涉及 bug -> `references/checklists/bugfix-checklist.md`
- 涉及测试 -> `references/checklists/testing-checklist.md`
- 验收阶段 -> `references/checklists/acceptance-checklist.md`

执行、审查、子代理回收和最终交接阶段读取 `references/review-and-handoff.md`。需要选择 skills、subagents 或 Playwright 路由时读取 `references/agent-skill-routing.md`。

## Skills 与子代理使用

`direct-flow` 是当前会话执行模式，不能只描述流程。进入对应阶段后，主 agent 必须实际使用应触发的 skills，并在用户确认后按需要启动 subagents；不可用时必须说明原因，并由主 agent 按同等职责替代。

`prompt-preview` 当前会话只生成提示词，不启动子代理、不执行命令、不修改文件；但生成的提示词必须明确要求下一轮 Codex 在对应阶段实际使用 required skills / subagents。

prompt-preview 生成提示词时，必须按任务类型和影响范围规划 skills 与 subagents：

- 明确列出“必须使用”“条件使用”“明确不使用”的 skills。
- 每个将被使用的 skill 都必须写清阶段、触发原因、要读取的 skill / reference、预期产出和不可用替代方案。
- 明确列出“必须启动”“条件启动”“明确不启动”的 subagents。
- 每个将被启动的 subagent 都必须写清阶段、职责边界、只读或可写范围、禁止事项、输入、输出和验证要求。
- 不能用“如有需要使用 skill / 子代理”替代具体规划；如暂不使用某个常见 skill 或不启动某个 subagent，必须给出原因和主 agent 替代职责。

先区分两类能力：

- Skill：加载后改变主 agent 的流程或检查标准，例如 `feature-doc-pack`、`backend-feature-design-review`、`playwright-local-runtime`、`ui-ux-pro-max` 和 superpowers。写入流程的 skill 必须在对应阶段被真实读取并执行职责，不能只列名。
- Subagent：通过子代理工具启动的独立角色，例如 `spring-boot-engineer`、`frontend-developer`、`api-designer`、`sql-pro`、`reviewer`、`debugger`。写入流程的 subagent 必须真实启动并交付，或说明不可用并由主 agent 替代，不能假装已执行。

以下行为不算“使用”：

- 只把 skill 或 subagent 名称列在推荐流程里。
- 只说“建议使用”，但没有执行该 skill 的流程、检查清单或产出物。
- 声称 subagent 已设计、已实现或已审查，但没有真实启动、没有交接报告，或没有说明由主 agent 替代。

以下行为才算“使用”：

- Skill：读取并遵守该 skill / reference 的步骤，输出该 skill 要求的设计、计划、审查、验证或交付物。
- Subagent：真实启动对应 subagent，任务说明包含职责边界、可读写范围、禁止事项、输入、输出和验证要求，并回收交接报告。
- 替代执行：如果 skill 或 subagent 不可用，明确说明不可用原因，并由主 agent 按同等职责完成检查或实现，同时标注为“主 agent 替代执行”。

启动子代理必须同时满足：

1. 用户显式调用 `development-workflow-router`，并确认继续当前流程。
2. 当前任务分类和影响范围足够明确。
3. 已完成流程确认和 `writing-plans` 确认；只读审查任务可以在用户明确要求审查时按只读边界启动。
4. 每个子代理任务都写清职责边界、可读写范围、禁止事项和交付物。
5. 不允许多个子代理同时修改同一文件或同一模块。
6. 实现型子代理启动前，必须明确可修改目录或文件、禁止修改范围、是否允许新增依赖、验证命令和交付格式。

具体路由、可用性检查和替代执行规则见 `references/agent-skill-routing.md`。

某个 skill、agent 或子代理不可用时，必须说明不可用原因，并由主 agent 按同等职责继续执行；不得编造 skill 或子代理已执行的结果。

## 执行闸门

必须经过以下确认点：

1. 流程确认。
2. `writing-plans` 确认。
3. 数据库真实变更确认，如涉及。
4. `executing-plans` 开始确认。
5. 验收前测试结果确认。

任一确认点未通过，不得进入下一阶段。

## 第一轮输出

direct-flow 第一轮只输出：

1. 工作模式
2. 任务类型
3. 分类置信度
4. 判断理由
5. 影响范围
6. 推荐流程，一行展示即可
7. 是否涉及数据库
8. 是否涉及接口
9. 是否涉及 UI
10. 是否需要 Playwright 或浏览器真实测试
11. 假设条件和不确定点
12. 下一步建议
13. 已读取或需要读取的项目规则质量门禁
14. 建议使用的 skills 和可选 subagents

最后询问：“请确认是否按这个流程继续。确认后我再读取对应详细流程并输出 writing-plans。”

prompt-preview 第一轮输出：

1. 工作模式
2. 任务类型
3. 分类置信度
4. 判断理由
5. 适用场景
6. 可复制的完整 superpowers workflow prompt
7. 本次需求可追加的独有步骤建议

最后提醒：“你可以先检查这份 superpowers workflow prompt。如果本次需求有特殊要求，可以在【本次需求特殊要求】部分追加后再发给 Codex；执行时仍必须按阶段等待确认，不能直接开始改代码。”
