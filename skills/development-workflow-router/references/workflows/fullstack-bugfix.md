# Fullstack Bugfix Workflow

适用于 bug 涉及前后端边界、接口契约、数据结构或联调问题。

## 推荐流程

`superpowers:systematic-debugging` -> 项目上下文读取 -> 复现或确认证据 -> 判断前后端责任边界 -> 检查接口契约一致性 -> 必要时使用 `backend-feature-design-review` -> `superpowers:writing-plans` -> 用户确认 -> 后端修复 -> 前端修复 -> 后端审查 -> 前端审查 -> 联调 -> Playwright 或浏览器回归测试 -> 验收。

## 规则

- 必须先判断责任边界。
- 优先检查前端传参、后端返回、字段命名、权限、状态码、数据状态。
- 前后端修复后必须联调。
- Playwright 必须覆盖 bug 复现路径。
- 在当前 Windows Codex 环境运行 Playwright 时，使用 `playwright-local-runtime`。
- 不允许只改一端后直接验收，除非有明确证据证明另一端无需修改。

## 推荐职责

- Skill：`backend-feature-design-review`、`ui-ux-pro-max`、`playwright-local-runtime`、`superpowers:systematic-debugging`、`superpowers:test-driven-development`。
- Subagent：`debugger`、`api-designer`、`spring-boot-engineer`、`frontend-developer`、`reviewer`。
