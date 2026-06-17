# Direct Flow Mode

适用于用户希望 Codex 在当前会话内直接推进需求的情况。

## 定义

`direct-flow` 是当前会话执行模式，不是流程预览模式，也不是提示词生成模式。

它和 `prompt-preview` 使用同一套 workflow prompt 流程结构：

```text
任务分类
-> 总闸门
-> Workflow 阶段
-> 本次需求特殊要求
-> 验收输出要求
```

区别只有一个：

- `prompt-preview` 把这套流程转换成可复制提示词，不执行。
- `direct-flow` 不输出可复制提示词，而是在当前会话里直接按同一套流程执行。

## Workflow 单一来源规则

direct-flow 必须读取当前任务类型对应的 `references/workflows/*.md`。

执行阶段顺序必须使用该 workflow，不得自己重新发明流程，也不得和 prompt-preview 使用两套不同流程。

## 执行方式

1. 判断任务类型和分类置信度。
2. 根据任务类型读取对应 workflow：
   - `backend-feature`
   - `frontend-feature`
   - `fullstack-feature`
   - `backend-bugfix`
   - `frontend-bugfix`
   - `fullstack-bugfix`
3. 按需读取 checklist、`agent-skill-routing.md` 和 `review-and-handoff.md`。
4. 如果 `confidence=low`，先提出澄清问题，不进入开发流程。
5. 如果 `confidence=medium`，列出假设条件；除非用户明确要求继续，否则先等待确认。
6. 如果 `confidence=high`，进入 workflow 的第一个实际阶段。
7. 不输出完整可复制提示词。
8. 不输出独立的 prompt-preview 模板。
9. 按 workflow 阶段逐步执行。
10. 每个阶段结束后，输出阶段产物、风险和下一步。
11. workflow 阶段标记需要用户确认时，必须等待确认后再进入下一阶段。
12. 到达 `superpowers:writing-plans` 时，必须输出计划并等待用户确认。
13. 用户确认 writing-plans 后，才进入 `superpowers:executing-plans`。
14. feature 类任务的 executing-plans 使用普通 TDD；bugfix 类任务的 executing-plans 必须遵循 bugfix TDD：先补失败回归测试证明当前 bug 存在，再做最小修复，再运行测试验证通过。无法编写自动化测试时，必须说明原因、可重复的最小复现步骤、替代验证方式和风险；不得把 not-run 说成 passed。
15. 完成后进入审查、测试、验收。

## 总闸门

direct-flow 必须遵守和 prompt-preview 生成提示词相同的总闸门：

- 不要直接开始改代码。
- 必须按 workflow 阶段顺序执行。
- 每个阶段结束都要输出阶段产物、风险和下一步。
- 每个 Workflow 阶段都必须在“使用”字段中写明本阶段使用的 skill / subagent。
- writing-plans 未确认前不得写代码。
- feature 的 executing-plans 必须遵循普通 TDD：先写失败测试，再实现功能，再测试通过。
- bugfix 的 executing-plans 必须遵循 bugfix TDD：先补失败回归测试证明当前 bug 存在，再做最小修复，再运行测试验证通过。无法编写自动化测试时，必须说明原因、可重复的最小复现步骤、替代验证方式和风险；不得把 not-run 说成 passed。
- 如果 skill 或 subagent 不可用，必须说明原因，并由主 agent 按同等职责执行，不得假装已调用。
- direct-flow 不输出独立路由章节；skill / subagent 使用情况随阶段输出和验收输出记录。

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

bugfix 不默认先 `superpowers:brainstorming`。只有 bugfix 修复会改变业务规则、扩大范围、影响公共工具或变成 feature 时，才在根因定位后补充：

```text
superpowers:brainstorming
```

## 输出结构

direct-flow 第一轮和后续阶段输出使用 workflow prompt 的同构结构，但不输出可复制提示词。

第一轮输出建议：

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

请确认以上阶段产物。确认后我再进入下一阶段。
```

## Skill / Subagent 执行规则

- workflow 写到的 skill 必须真实读取并执行。
- workflow 写到的 subagent 必须真实启动并交接；不可用时由主 agent 按同等职责替代。
- 不得只列名称而不执行职责。
- 不得假装某个 skill 或 subagent 已经调用。
- 每个阶段结束都要说明实际使用了哪些 skill / subagent，以及不可用替代情况。
- 验收输出中保留实际使用的 skills / subagents 和替代说明。

## 禁止事项

- 禁止在 direct-flow 中生成完整可复制提示词。
- 禁止只输出“简短流程卡片”后等待用户确认。
- 禁止使用与 prompt-preview 不一致的阶段流程。
- 禁止跳过 workflow 的第一个实际阶段。
- 禁止 feature 跳过 `superpowers:brainstorming`。
- 禁止 bugfix 跳过 `superpowers:systematic-debugging`。
- 禁止跳过 `superpowers:writing-plans`。
- 禁止未确认 writing-plans 就修改代码。
- 禁止 feature 跳过普通 TDD；禁止 bugfix 跳过 bugfix TDD、审查、测试和验收。
