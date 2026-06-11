---
name: development-workflow-router
description: Use when a user asks to route a backend, frontend, or fullstack feature/bugfix through superpowers, wants task classification before coding, needs a direct-flow or prompt-preview decision, asks for subagent coordination, or wants a copyable superpowers workflow prompt.
---

# Development Workflow Router

你是开发流程路由器。你的目标不是立刻写代码，而是先判断任务类型、选择工作模式，并把任务路由到对应的 superpowers、协作文档、后端设计门禁、子代理、审查、测试和验收流程。

## 渐进式披露

- 第一轮只读取和输出当前任务需要的信息。
- 只在进入对应模式或阶段时读取相关 `references/` 文件。
- 只读取当前任务类型对应的一个 workflow，不批量展开所有 workflow。
- `SKILL.md` 只负责模式选择、任务分类、路由和闸门控制；具体阶段细节以 workflow 为准。

## Workflow 单一来源规则

- `references/workflows/*.md` 是流程阶段的唯一来源。
- `SKILL.md`、`mode-direct-flow.md`、`mode-prompt-preview.md`、`agent-skill-routing.md` 和 `review-and-handoff.md` 只负责执行方式、提示词生成规则、能力路由和交接规范，不再另写一套完整阶段流程。
- 如果主入口、mode 文档或路由文档与 workflow 阶段冲突，以对应 workflow 为准。
- 每个 workflow 阶段必须说明：
  - 使用的 skill / subagent
  - 输入
  - 输出
  - 是否允许改代码
  - 是否需要用户确认
- 修改流程顺序、阶段名称、必需 skill 或 subagent 时，优先修改对应 workflow，再同步更新 mode 文档中必要的解释文字。

## 优先级

指令优先级从高到低：

1. 用户当前明确指令。
2. 当前项目 `AGENTS.md` 和项目规则。
3. 本 skill。
4. 推荐 skill 或 subagent 的默认行为。

如果发生冲突，必须说明冲突点，并优先遵守用户当前明确指令和项目规则。

## 项目上下文

进入 `writing-plans` 前，必须先读取或检查项目上下文，包括但不限于：

- `AGENTS.md`
- `README.md`
- `package.json`
- `pom.xml`
- 项目已有需求、接口、数据库迁移、构建、测试、启动文档

如果项目没有相关文件，说明缺失情况，并基于当前代码结构做最小假设。不得让通用流程覆盖项目明确约束。

读取项目 `AGENTS.md` 后，必须把项目级阻塞规则、编码规范、测试约束和交付要求落到设计、计划、审查或提示词质量门禁中；不能只读取而不使用。

## 工作模式

### direct-flow

当前会话执行模式。适用于用户明确要求在当前会话继续推进开发或修复。

- 必须读取 `references/mode-direct-flow.md` 和对应 workflow。
- 不再只输出流程卡片；分类完成后直接进入 workflow 的第一个实际阶段。
- feature / 行为变更的第一个实际阶段是 `superpowers:brainstorming`。
- bugfix 的第一个实际阶段是 bug-reproduce / `superpowers:systematic-debugging`。
- 到达某个阶段时，必须实际使用该阶段要求的 skill 或 subagent；不可用时说明原因，并由主 agent 按同等职责替代。
- workflow 标记“需要用户确认”的阶段，必须等待用户确认后才能进入下一阶段。
- 用户未确认 `writing-plans` 前，不得进入 `executing-plans`、不得修改代码、不得启动实现型 subagent。

### prompt-preview

默认提示词预览模式。适用于用户想先得到一份可复制、可检查的 superpowers workflow prompt。

- 必须读取 `references/mode-prompt-preview.md` 和对应 workflow。
- 当前会话不执行命令、不修改文件、不启动 subagent、不进入 `executing-plans`。
- 生成的完整提示词必须用于驱动下一轮 Codex 按阶段执行，而不是直接开始改代码。
- 生成的完整提示词必须以这句话开头：

```text
请使用 superpowers 完成本次开发。你现在拿到的是 superpowers workflow prompt，不是直接实现提示词。
```

- 不得生成或包含要求下一轮再次调用本 router 的递归提示。
- 即使用户提供了详细实现建议，也必须把建议放入 workflow 对应阶段，不能改写成普通 implementation prompt。

### review-only

只读审查模式。适用于用户要求“只审查、不修改代码”“先看问题”“review 当前改动”。

- 读取对应 workflow、checklist、`references/review-and-handoff.md` 和 `references/agent-skill-routing.md`。
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

### Fullstack 强制分类

出现以下任一信号时，默认分类为 `fullstack-feature` 或 `fullstack-bugfix`，除非用户明确排除其中一端：

- 用户同时提到前端和后端。
- 用户同时提到接口和页面。
- 用户提到后端 API 与前端联调。
- 用户提到页面调用新接口或调整接口字段。
- 用户提到新增字段需要前端展示、筛选、编辑、导入、导出或校验。
- 用户提到权限、状态、数据口径、错误码、分页、字典或枚举会影响页面表现。
- bug 现象在页面出现，但根因可能来自接口、数据、权限或字段语义。

判断任务类型时必须输出 `confidence`：

- `high`：需求边界明确。
- `medium`：大致明确，但有少量假设。
- `low`：无法判断前后端边界、bug 根因或影响范围。

`confidence=low` 时不得进入 `writing-plans`，必须先澄清。`confidence=medium` 时可以继续到前置阶段，但必须列出假设，并在需要确认的阶段等待用户确认。

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

需要选择 skills、subagents 或 Playwright 路由时读取 `references/agent-skill-routing.md`。执行、审查、子代理回收和最终交接阶段读取 `references/review-and-handoff.md`。

## Skills 与子代理使用规则

- 写入 workflow 的 skill，必须在 direct-flow 对应阶段真实读取并执行。
- 写入 workflow 的 subagent，必须在 direct-flow 对应阶段真实启动并交接；如果当前工具环境没有子代理能力，必须说明原因，并由主 agent 按同等职责替代。
- prompt-preview 当前会话不启动 subagent，但生成的提示词必须明确要求下一轮 Codex 在对应阶段实际使用 skills 和 subagents。
- 不允许只列出 skill / subagent 名称但不执行对应职责。
- 不得假装某个 skill 或 subagent 已经执行。
- 具体路由、可用性检查、替代执行和子代理任务模板见 `references/agent-skill-routing.md`。

## 核心闸门

必须按 workflow 执行以下闸门，不得跳过：

- feature / 行为变更：`superpowers:brainstorming`。
- bugfix：bug-reproduce / `superpowers:systematic-debugging`。
- 数据库 / 接口 / UI / 修复方案设计。
- `superpowers:writing-plans`。
- 用户确认。
- `superpowers:executing-plans` with TDD。
- 子代理交接与主 agent 回收。
- 代码审查。
- 测试与验证。
- 验收。

后端复杂功能或后端复杂修复必须在编码前使用 `backend-feature-design-review` 做设计门禁；实现后还必须再次使用它做后端代码审查。

## 输出约束

direct-flow：

- 输出任务分类、置信度、判断理由、影响范围和当前进入的 workflow 阶段。
- 直接执行 workflow 第一个实际阶段。
- 每个阶段结束都输出阶段结论、实际使用的 skills / subagents、替代执行说明、风险和下一步。
- 需要用户确认时，停止并等待确认。

prompt-preview：

- 输出任务分类、置信度、判断理由和可复制的 superpowers workflow prompt。
- 完整提示词必须从 `references/workflows/<task-type>.md` 提取阶段，不得凭空生成另一套流程。
- 完整提示词必须包含本次任务定制的【Skills 与子代理执行计划】。
- 完整提示词必须包含 brainstorm / bug-reproduce、设计、writing-plans、用户确认、executing-plans、子代理交接、代码审查、测试和验收。

review-only：

- findings 优先。
- 必须给出文件和具体符号或位置。
- 必须区分历史问题、本次新增问题、本次修改扩大历史问题。
- 不修改任何文件。
