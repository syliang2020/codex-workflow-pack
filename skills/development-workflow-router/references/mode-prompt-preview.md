# Prompt Preview Mode

适用于用户希望先生成完整 Codex 开发提示词，然后自行检查、修改、再复制执行的情况。

## 定义

`prompt-preview` 只生成提示词，不执行任何开发流程阶段。

它不会进入：

- brainstorm
- bug-reproduce
- 数据库设计
- 接口契约
- UI 设计
- writing-plans
- executing-plans
- 测试
- 验收

## Workflow 单一来源规则

prompt-preview 生成提示词时，必须读取当前任务类型对应的 `references/workflows/*.md`。

生成的提示词必须使用该 workflow 的阶段顺序，不得自己重新发明流程。

prompt-preview 只负责把 workflow 转换成可复制的 superpowers workflow prompt。

不得要求下一轮 Codex 再调用 `development-workflow-router`。

## 当前模式限制

1. 不修改代码。
2. 不执行命令。
3. 不使用任何项目 MCP、数据库连接工具或迁移执行工具。
4. 不进入 `executing-plans`。
5. 不创建、不修改、不删除数据库对象。
6. 不运行测试。
7. 不启动子代理。
8. 不生成虚假的测试结果。
9. 只输出可复制提示词。

## 输出开头硬规则

生成的完整提示词必须以类似下面的内容开头：

```text
请使用 superpowers 完成本次开发。你现在拿到的是 superpowers workflow prompt，不是直接实现提示词。
```

不得写要求下一轮再次调用 `development-workflow-router` 的递归提示。

## 输出结构

prompt-preview 默认生成中等长度的 superpowers workflow prompt，建议使用以下结构：

```text
【任务分类】
- 任务类型：
- 分类置信度：
- 已知需求：
- 不确定点和假设条件：

【总闸门】
- 不要直接开始改代码。
- 必须按下面阶段顺序执行。
- 每个阶段结束都要输出阶段产物、风险和下一步。
- 每个 Workflow 阶段都必须在“使用”字段中写明本阶段使用的 skill / subagent。
- writing-plans 未确认前不得写代码。
- executing-plans 必须遵循 TDD 或回归测试策略。
- 如果 skill 或 subagent 不可用，必须说明原因，并由主 agent 按同等职责执行，不得假装已调用。
- 默认不要输出独立路由章节；只有用户明确要求完整 skills/subagents 使用计划时才额外输出。

【Workflow 阶段】

1. 阶段名称
- 使用：
- 目标：
- 输出：
- 是否允许改代码：
- 是否需要用户确认：
- 阶段要求：

2. 阶段名称
...

【本次需求特殊要求】
- 用户可在这里追加本次需求特殊限制。

【验收输出要求】
- 修改摘要
- 修改文件
- 测试命令和结果
- 已知风险
- 未完成项
- 建议验收路径
- 实际使用的 skills / subagents 和替代说明
```

## Skill / Subagent 路由生成规则

默认不生成独立的【Skill / Subagent 路由】章节。

prompt-preview 应把本次任务需要的 skill / subagent 写进每个 Workflow 阶段的“使用”字段，例如：

```text
【阶段 1：bug-reproduce / superpowers:systematic-debugging】
- 使用：superpowers:systematic-debugging，必要时 debugger。
- 目标：复现 bug 并确认影响范围。
- 输出：复现路径、期望结果、实际结果、初步根因假设。
```

只有在用户明确要求“列出完整 skills 和 subagents 使用计划”时，才展开：

```text
- 必须使用
- 条件使用
- 明确不使用
- 必须启动
- 条件启动
- 明确不启动
```

额外输出独立路由章节时，也只列本次任务相关项，不列无关 skill 或 subagent。

## 范围保真规则

prompt-preview 生成提示词时，必须完整保留用户明确给出的开发范围。

如果用户明确说：

- 前后端都要改
- 前端和后端都要修改
- 接口和页面都要改
- 后端加接口，前端对接

则任务类型必须为 `fullstack-feature`，生成的提示词必须包含后端阶段和前端阶段。

禁止擅自缩小范围，例如：

- 用户说前后端都要改，却生成“只改后端”。
- 用户说需要前端对接，却生成“不修改前端”。
- 用户说不改数据库，却生成数据库迁移步骤。

## 禁止事项

- 禁止生成普通 implementation prompt。
- 禁止要求下一轮 Codex 再调用 `development-workflow-router`。
- 禁止默认展开所有无关 skills 和 subagents。
- 禁止跳过 workflow 阶段。
- 禁止用户未确认 writing-plans 就要求改代码。
