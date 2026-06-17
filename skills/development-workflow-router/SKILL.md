---
name: development-workflow-router
description: Use when a user asks to route a backend, frontend, or fullstack feature/bugfix through superpowers, wants task classification before coding, needs a direct-flow or prompt-preview decision, asks for subagent coordination, or wants a copyable superpowers workflow prompt.
---

# Development Workflow Router

你是开发流程路由器。你的职责是判断任务类型、选择工作模式，并把任务路由到对应 workflow、superpowers、必要 subagents、审查、测试和验收流程。

## 渐进式披露

- 第一轮只读取和输出当前任务需要的信息。
- 只读取当前任务类型对应的一个 workflow。
- 进入对应模式时再读取对应 mode 文件。
- 需要选择 skill / subagent 时再读取 `references/agent-skill-routing.md`。
- 执行、审查、子代理回收和验收时再读取 `references/review-and-handoff.md`。

## Workflow 单一来源规则

本 skill 的任务流程以 `references/workflows/*.md` 为唯一来源。

- `direct-flow` 必须读取对应 workflow 并按阶段执行。
- `prompt-preview` 必须读取对应 workflow 并生成 superpowers workflow prompt。
- `SKILL.md`、`mode-direct-flow.md`、`mode-prompt-preview.md` 不得维护与 workflow 文件冲突的阶段顺序。
- 如果 mode 文件和 workflow 文件冲突，以 workflow 文件为准。
- 每个 workflow 阶段都必须写明：使用的 skill / subagent、输入、输出、是否允许改代码、是否需要用户确认。

## 工作模式

### direct-flow

当前会话执行模式，不是流程预览模式。

触发信号：

- “走 direct-flow”
- “在当前会话继续开发”
- “按 development-workflow-router 处理，并在当前会话继续开发”
- 用户明确希望当前会话推进开发流程，而不是只生成提示词

执行方式：

1. 判断任务类型和分类置信度。
2. 读取对应 `references/workflows/*.md`。
3. 使用和 prompt-preview 生成的 workflow prompt 同一套结构：任务分类、总闸门、Workflow 阶段、本次需求特殊要求、验收输出要求。
4. 不输出完整提示词，不只输出简短流程卡片。
5. 直接进入 workflow 的第一个实际阶段。
6. 每个阶段结束后，输出阶段产物、风险和下一步。
7. workflow 阶段标记需要用户确认时，必须等待用户确认。
8. 到达 `superpowers:writing-plans` 时，必须输出计划并等待用户确认。
9. 用户确认 writing-plans 后，才进入 `superpowers:executing-plans`。
10. executing-plans 必须遵循 TDD 或回归测试策略。
11. 完成后进入审查、测试、验收。

direct-flow 第一轮和后续阶段必须使用 workflow prompt 的同构结构，但不输出可复制提示词。

输出格式：

```text
工作模式：direct-flow

【任务分类】
- 任务类型：
- 分类置信度：
- 已知需求：
- 不确定点和假设条件：

【总闸门】
- 按 workflow 阶段执行。
- 每个阶段结束输出阶段产物、风险和下一步。
- writing-plans 未确认前不写代码。
- skill / subagent 不可用时说明原因，并由主 agent 替代。

【当前 Workflow 阶段】
阶段名称：
- 使用：
- 目标：
- 输入：
- 输出：
- 是否允许改代码：
- 是否需要用户确认：
- 阶段产物：
- 风险和不确定点：
- 下一步：
...

请确认以上阶段产物。确认后我再进入下一阶段。
```

### prompt-preview

提示词预览模式，只生成完整可复制的 superpowers workflow prompt。

触发信号：

- “生成完整提示词”
- “先不要开发”
- “我检查后再执行”
- “prompt-preview”
- 用户没有明确要求当前会话继续开发

执行方式：

1. 判断任务类型和分类置信度。
2. 读取对应 `references/workflows/*.md`。
3. 按需读取 checklist、`agent-skill-routing.md` 和 `review-and-handoff.md`。
4. 根据 workflow 生成中等长度、可复制的 superpowers workflow prompt。
5. 当前会话不得修改代码。
6. 当前会话不得执行命令。
7. 当前会话不得启动子代理。
8. 生成的提示词不得要求下一轮再次调用 `development-workflow-router`。

prompt-preview 生成的提示词必须以类似下面的内容开头：

```text
请使用 superpowers 完成本次开发。这是 workflow prompt，请按阶段执行，计划确认前不要写代码。
```

不得写要求下一轮再次调用 `development-workflow-router` 的递归提示。

prompt-preview 默认不输出独立的【Skill / Subagent 路由】章节。每个 Workflow 阶段必须在“使用”字段中说明本阶段使用的 skill / subagent；只有用户明确要求完整 skills/subagents 使用计划时，才额外输出独立路由章节并展开“必须使用 / 条件使用 / 明确不使用 / 必须启动 / 条件启动 / 明确不启动”。

### review-only

只读审查模式。适用于用户要求“只审查、不修改代码”“先看问题”“review 当前改动”。

- 不进入 `executing-plans`。
- 不启动实现型 subagent。
- 不修改文件。
- 可以按只读边界使用 `reviewer`、`api-designer`、`sql-pro`、`debugger`、`security-auditor` 或相关 skill。
- 输出必须区分历史问题、本次新增问题、本次修改扩大历史问题。

## 任务分类

将任务判断为以下 6 类之一：

- `backend-feature`：只做后端功能开发。
- `frontend-feature`：只做前端功能开发。
- `fullstack-feature`：前端和后端一起开发。
- `backend-bugfix`：只修复后端 bug。
- `frontend-bugfix`：只修复前端 bug。
- `fullstack-bugfix`：修复涉及前后端边界、接口契约、数据结构、页面调用或联调链路的 bug。

判断任务类型时必须输出 `confidence`：

- `high`：需求边界明确。
- `medium`：大致明确，但有少量假设。
- `low`：无法判断前后端边界、bug 根因或影响范围。

`confidence=low` 时不得进入开发流程，必须先澄清。`confidence=medium` 时必须列出假设条件，并在需要确认的阶段等待用户确认。

## fullstack-feature 强制分类规则

只要用户明确说：

- 前后端都要改
- 前端和后端都要修改
- 后端加接口，前端对接
- 接口和页面都要改
- 页面点击后调用新接口

则任务类型必须为 `fullstack-feature`，不得分类为 `backend-feature` 或 `frontend-feature`。

除非用户后续明确改口说“本次只做后端”或“本次只做前端”。

## fullstack-bugfix 强制分类规则

如果 bug 现象在页面出现，并且根因可能来自接口、字段、权限、数据口径、状态码、错误处理或前后端联调链路，默认分类为 `fullstack-bugfix`，直到根因证明只属于单侧。

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

## 核心闸门

- feature 类任务的第一个实际阶段必须是 `superpowers:brainstorming`。
- bugfix 类任务的第一个实际阶段必须是 bug-reproduce / `superpowers:systematic-debugging`。
- bugfix 如果会新增功能或改变业务行为，必须在根因确认后补充 `superpowers:brainstorming`。
- 不得跳过 `superpowers:writing-plans`。
- writing-plans 未经用户确认前不得修改代码。
- `superpowers:executing-plans` 阶段必须内置 TDD 或回归测试策略。
- 后端功能流程中 `backend-feature-design-review` 必须出现两次：编码前设计门禁、编码后代码审查。
- `api-designer` 和 `sql-pro` 要作为明确的协同设计阶段，是否真实启动按任务影响范围和可用性判断。
- 不得跳过审查、测试和验收。

## 能力不可用降级

如果某个 skill 或 subagent 不可用：

1. 必须明确说明不可用的名称。
2. 必须说明它原本负责什么。
3. 主 agent 必须按同等职责执行。
4. 必须输出替代执行结果。
5. 不得假装已经调用。
6. 不得因为不可用而跳过阶段。
