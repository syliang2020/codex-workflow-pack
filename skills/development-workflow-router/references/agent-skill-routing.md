# Agent And Skill Routing

用于选择、执行和回收本机已有 skills、plugins 和 subagents。核心规则：列出名称不等于使用；必须执行对应职责，或说明不可用并由主 agent 替代。

## 与 Workflow 的关系

- `references/workflows/*.md` 是阶段顺序和阶段要求的唯一来源。
- 本文件只解释如何做阶段绑定、按需路由和不可用降级。
- 如果本文件的推荐映射与 workflow 阶段冲突，以 workflow 为准。

## 阶段绑定规则

不得只列出 skill 或 subagent 名称。

每个 workflow 阶段必须明确：

1. 本阶段使用哪个 skill 或 subagent。
2. 本阶段输入是什么。
3. 本阶段输出是什么。
4. 本阶段是否允许改代码。
5. 本阶段结束后是否需要用户确认。

### `superpowers:brainstorming`

- 输入：
  - 用户需求
  - 项目上下文
  - 相关代码和文档
- 输出：
  - 需求澄清
  - 影响边界
  - 不做事项
  - 验收标准
  - 需要用户确认的问题
- 是否允许改代码：
  - 否
- 是否需要确认：
  - 是

### `bug-reproduce` / `superpowers:systematic-debugging`

- 输入：
  - 用户描述
  - 错误信息
  - 日志、测试、页面路径或接口请求
- 输出：
  - 复现路径
  - 期望结果
  - 实际结果
  - 影响范围
  - 根因假设
- 是否允许改代码：
  - 否
- 是否需要确认：
  - 复现信息不足或影响范围不清时需要确认

### `superpowers:writing-plans`

- 输入：
  - 已确认的需求、设计或修复方案
  - 项目规则、构建约束和测试约束
- 输出：
  - 文件级计划
  - 测试计划
  - 风险和回滚方案
  - 子代理分工，如需要
- 是否允许改代码：
  - 否
- 是否需要确认：
  - 是，计划确认前不得写代码

### `superpowers:executing-plans with TDD`

- 输入：
  - 已确认 writing-plans
  - 可修改范围
  - 测试计划
- 输出：
  - 代码实现
  - 测试或回归用例
  - 测试结果
  - 子代理交接报告，如使用 subagent
- 是否允许改代码：
  - 是
- 是否需要确认：
  - 执行前需要确认 writing-plans；偏离计划时需要再次确认

## Prompt-preview 路由生成规则

prompt-preview 默认不生成独立的【Skill / Subagent 路由】章节。

默认应把本次任务需要的 skill / subagent 写入每个 Workflow 阶段的“使用”字段。

只有在用户明确要求“完整 skills/subagents 使用计划”时，才展开：

- 必须使用
- 条件使用
- 明确不使用
- 必须启动
- 条件启动
- 明确不启动

默认阶段内写法：

```text
【阶段 1：superpowers:brainstorming】
- 使用：superpowers:brainstorming。
- 输出：需求澄清、影响边界、不做事项、验收标准。

【阶段 2：接口 / 数据库设计】
- 使用：api-designer；涉及数据库时使用 sql-pro。
- 输出：接口契约、数据来源、字段语义、数据库影响说明。
```

## 不可用降级规则

如果某个 skill 或 subagent 不可用：

1. 必须明确说明不可用的名称。
2. 必须说明它原本负责什么。
3. 主 agent 必须按同等职责执行。
4. 必须输出替代执行结果。
5. 不得假装已经调用。
6. 不得因为不可用而跳过阶段。

建议输出：

```text
未使用/未启动 <skill/subagent>。
原因：<不可用原因>。
原职责：<它原本负责的阶段和产物>。
替代：主 agent 按同等职责执行。
替代产出：<实际产出>。
```

## 常用按需路由

- `backend-feature`：`superpowers:brainstorming`、`api-designer`、`sql-pro`（涉及数据库时）、`backend-feature-design-review`、`superpowers:writing-plans`、`superpowers:executing-plans with TDD`、`spring-boot-engineer`、`reviewer`、`superpowers:verification-before-completion`。
- `frontend-feature`：`superpowers:brainstorming`、`ui-designer`、`ui-ux-pro-max`、`api-designer`（接口依赖确认时）、`superpowers:writing-plans`、`superpowers:executing-plans with TDD / regression test`、`frontend-developer`、`reviewer`、`playwright-local-runtime`、`superpowers:verification-before-completion`。
- `fullstack-feature`：`superpowers:brainstorming`、`api-designer`、`sql-pro`（涉及数据库时）、`ui-designer`、`ui-ux-pro-max`、`backend-feature-design-review`、`superpowers:writing-plans`、`superpowers:executing-plans with TDD`、`spring-boot-engineer`、`frontend-developer`、`reviewer`、`playwright-local-runtime`。
- `backend-bugfix`：`superpowers:systematic-debugging`、`debugger`、`api-designer` / `sql-pro` / `backend-feature-design-review`（按影响范围）、`superpowers:writing-plans`、`superpowers:executing-plans with regression test`、`spring-boot-engineer`、`reviewer`、`superpowers:verification-before-completion`。
- `frontend-bugfix`：`superpowers:systematic-debugging`、`debugger` / `ui-fixer`、`ui-ux-pro-max`、`superpowers:writing-plans`、`superpowers:executing-plans with regression test`、`frontend-developer`、`reviewer`、`playwright-local-runtime`。
- `fullstack-bugfix`：`superpowers:systematic-debugging`、`debugger`、`api-designer`、`backend-feature-design-review`、`ui-ux-pro-max`、`sql-pro`（涉及数据库时）、`superpowers:writing-plans`、`superpowers:executing-plans with regression test`、`spring-boot-engineer`、`frontend-developer`、`reviewer`、`playwright-local-runtime`。

## 子代理任务模板

启动子代理前，主 agent 必须写清：

1. 任务目标。
2. 是否只读。
3. 可读取范围。
4. 可修改范围；只读任务写“不得修改文件”。
5. 禁止事项。
6. 输入文档或关键上下文。
7. 交付物格式。
8. 验证命令或无法验证的说明。
9. 是否允许新增依赖；默认不允许。
10. 与其它子代理的边界，避免同文件或同模块并行修改。
