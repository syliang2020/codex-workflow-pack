# Direct Flow Mode

适用于用户希望 Codex 在当前会话内直接推进需求的情况。

## 定义

`direct-flow` 是当前会话执行模式，不是流程预览模式，也不是提示词生成模式。

它必须读取对应 `references/workflows/*.md`，然后从该 workflow 的第一个实际阶段开始执行。

## 执行方式

1. 判断任务类型和分类置信度。
2. 根据任务类型读取对应 workflow：
   - `backend-feature`
   - `frontend-feature`
   - `fullstack-feature`
   - `backend-bugfix`
   - `frontend-bugfix`
   - `fullstack-bugfix`
3. 如果 `confidence=low`，先提出澄清问题，不进入开发流程。
4. 如果 `confidence=medium`，列出假设条件；除非用户明确要求继续，否则先等待确认。
5. 如果 `confidence=high`，直接进入 workflow 的第一个实际阶段。
6. 不输出“推荐流程卡片”。
7. 不要求用户先确认流程。
8. 第一阶段结束后，输出阶段产物、风险和下一步，等待用户确认。
9. 用户确认后，继续执行 workflow 的下一阶段。
10. 到达 `superpowers:writing-plans` 时，必须输出计划并等待用户确认。
11. 用户确认 writing-plans 后，才进入 `superpowers:executing-plans`。
12. 执行阶段必须按 workflow 指定的 skill / subagent 路由执行。
13. 完成后进入审查、测试、验收。

## 第一个实际阶段规则

feature 类任务：

- `backend-feature`
- `frontend-feature`
- `fullstack-feature`

第一个实际阶段必须是：

```text
superpowers:brainstorming
```

bugfix 类任务：

- `backend-bugfix`
- `frontend-bugfix`
- `fullstack-bugfix`

第一个实际阶段必须是：

```text
bug-reproduce / superpowers:systematic-debugging
```

如果 bugfix 会新增功能或改变业务行为，必须在根因确认后补充：

```text
superpowers:brainstorming
```

## 第一轮输出格式

direct-flow 第一轮必须输出阶段产物，而不是流程预览。

```text
工作模式：direct-flow
任务类型：<backend-feature / frontend-feature / fullstack-feature / backend-bugfix / frontend-bugfix / fullstack-bugfix>
分类置信度：<high / medium / low>
当前阶段：<workflow 的第一个实际阶段>

【阶段目标】
...

【阶段产物】
...

【风险和不确定点】
...

【需要用户确认的问题】
...

请确认以上阶段产物。确认后我再进入下一阶段。
```

## Skill / Subagent 执行规则

- workflow 写到的 skill 必须真实读取并执行。
- workflow 写到的 subagent 必须真实启动并交接；不可用时由主 agent 按同等职责替代。
- 不得只列名称而不执行职责。
- 不得假装某个 skill 或 subagent 已经调用。
- 每个阶段结束都要说明实际使用了哪些 skill / subagent，以及不可用替代情况。

## 禁止事项

- 禁止在 direct-flow 中生成完整可复制提示词。
- 禁止只输出“简短流程卡片”后等待用户确认。
- 禁止跳过 workflow 的第一个实际阶段。
- 禁止 feature 跳过 `superpowers:brainstorming`。
- 禁止 bugfix 跳过 `superpowers:systematic-debugging`。
- 禁止跳过 `superpowers:writing-plans`。
- 禁止未确认 writing-plans 就修改代码。
- 禁止跳过 TDD 或回归测试策略、审查、测试和验收。
