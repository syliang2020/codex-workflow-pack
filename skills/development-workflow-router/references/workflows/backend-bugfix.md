# Backend Bugfix Workflow

适用于 bug 根因在后端的修复。

## 推荐流程

`superpowers:systematic-debugging` -> 项目上下文读取 -> 复现或确认证据 -> 定位后端根因 -> 判断是否涉及数据库或接口契约 -> 必要时使用 `backend-feature-design-review` -> `superpowers:writing-plans` -> 用户确认 -> 最小改动修复 -> 后端审查 -> 单元测试或接口回归测试 -> 验收。

## 规则

- 先复现，再修复。
- 禁止盲改。
- 默认最小改动。
- 不做需求外重构。
- 如果接口契约变化，必须明确影响前端。
- 如果根因实际涉及前端，必须重新分类为 `fullstack-bugfix`。
- 修复后必须补充能证明问题不再复发的测试或可验证步骤。

## 推荐职责

- Skill：`backend-feature-design-review`、`superpowers:systematic-debugging`、`superpowers:test-driven-development`。
- Subagent：`debugger`、`spring-boot-engineer`、`api-designer`、`sql-pro`、`reviewer`。
