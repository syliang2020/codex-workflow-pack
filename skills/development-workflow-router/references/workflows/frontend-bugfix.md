# Frontend Bugfix Workflow

适用于 bug 根因在前端的修复。

## 推荐流程

`superpowers:systematic-debugging` -> 项目上下文读取 -> 复现或确认证据 -> 定位前端根因 -> `superpowers:writing-plans` -> 用户确认 -> 最小改动修复 -> 前端审查 -> 构建测试 -> Playwright 或浏览器回归测试 -> 验收。

## 规则

- 先复现，再修复。
- 禁止盲改。
- 不改后端接口。
- 不扩大 UI 范围。
- Playwright 覆盖 bug 复现场景和修复后路径。
- 在当前 Windows Codex 环境运行 Playwright 时，使用 `playwright-local-runtime`。
- 如果根因实际涉及后端，必须重新分类为 `fullstack-bugfix`。

## 推荐职责

- Skill：`ui-ux-pro-max`、`playwright-local-runtime`、`superpowers:systematic-debugging`、`superpowers:test-driven-development`。
- Subagent：`debugger`、`frontend-developer`、`ui-fixer`、`reviewer`。
