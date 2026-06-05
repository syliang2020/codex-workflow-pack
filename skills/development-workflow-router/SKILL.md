---
name: development-workflow-router
description: Use when a user asks to route a backend, frontend, or fullstack feature/bugfix through superpowers, wants task classification before coding, needs a direct-flow or prompt-preview decision, asks for subagent coordination, or wants a copyable Codex development prompt.
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

## 项目专属工具抽象

本 skill 不固化任何项目专属配置或工具名称，不写死：

- 项目独有 MCP 名称
- 数据库连接名、数据库名、表名前缀
- 服务名、端口号、启动命令
- 部署路径、业务模块路径

如果任务涉及数据库、接口、UI、测试、浏览器自动化或外部工具，先读取项目规则；没有项目工具时，只输出人工方案、脚本草案或检查说明。用户确认前，不得真实执行破坏性操作。

## 工作模式

### direct-flow

默认模式。适用于用户希望 Codex 在当前会话中继续推进需求，但要求先确认流程和计划。

触发信号：

- “按 development-workflow-router 处理”
- “先判断任务类型，确认计划前不要写代码”
- 用户没有明确要求“生成完整提示词”

第一轮读取 `references/mode-direct-flow.md`，输出简短流程卡片。用户确认后，再读取对应 workflow 和 checklist，进入 `writing-plans`。

如果任务是 feature 或行为变更，第一轮推荐流程必须显式包含 `superpowers:brainstorming`。用户确认继续后，必须先完成 brainstorming 的设计确认，再进入 `writing-plans`。

### prompt-preview

提示词预览模式。适用于用户只想先得到完整可复制的 Codex 开发提示词，自行检查、修改后再执行。

触发信号：

- “生成完整提示词”
- “先不要开发，帮我整理成提示词”
- “我想复制提示词再发给 Codex”
- “让我先检查流程有没有漏步骤”
- 明确要求 `prompt-preview`

读取 `references/mode-prompt-preview.md`、对应 workflow 和 checklist，只输出可复制提示词。不修改代码、不执行命令、不进入 `executing-plans`。

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

本 skill 可以在 `direct-flow` 中按需启动子代理；`prompt-preview` 只生成提示词，不启动子代理、不执行命令、不修改文件。

先区分两类能力：

- Skill：加载后改变主 agent 的流程或检查标准，例如 `feature-doc-pack`、`backend-feature-design-review`、`playwright-local-runtime`、`ui-ux-pro-max` 和 superpowers。
- Subagent：通过子代理工具启动的独立角色，例如 `spring-boot-engineer`、`frontend-developer`、`api-designer`、`sql-pro`、`reviewer`、`debugger`。

启动子代理必须同时满足：

1. 用户显式调用 `development-workflow-router`，并确认继续当前流程。
2. 当前任务分类和影响范围足够明确。
3. 已完成流程确认和 `writing-plans` 确认；只读审查任务可以在用户明确要求审查时按只读边界启动。
4. 每个子代理任务都写清职责边界、可读写范围、禁止事项和交付物。
5. 不允许多个子代理同时修改同一文件或同一模块。
6. 实现型子代理启动前，必须明确可修改目录或文件、禁止修改范围、是否允许新增依赖、验证命令和交付格式。

具体路由表见 `references/agent-skill-routing.md`。

某个 agent 或子代理不可用时，必须说明不可用，并由主 agent 按同等职责继续执行；不得编造子代理已执行的结果。

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
6. 可复制的完整 Codex 开发提示词
7. 本次需求可追加的独有步骤建议

最后提醒：“你可以先检查这份提示词，如果本次需求有特殊要求，可以在【本次需求特殊要求】部分追加后再发给 Codex。”
