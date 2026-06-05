# Fullstack Feature Workflow

适用于前端和后端一起开发的完整功能。

## 推荐流程

`superpowers:brainstorming` -> 项目上下文读取 -> 询问并按需使用 `feature-doc-pack` -> 数据库设计或 DDL 草案 -> 接口契约定义 -> `backend-feature-design-review` 设计门禁 -> UI 交互方案 -> `superpowers:writing-plans` -> 用户确认 -> `superpowers:executing-plans` 或 `superpowers:subagent-driven-development` -> 后端实现 -> 前端实现 -> 后端代码审查 -> 前端代码审查 -> 联调 -> Playwright 或浏览器真实测试 -> 验收。

## 规则

- 数据库、接口、UI 三者必须先对齐。
- 数据库方案未确认前，不得使用任何数据库 MCP、迁移工具或 SQL 执行工具真实变更数据库。
- 接口契约未确认前，不得大规模写前端调用。
- UI 交互边界确认前，不得大规模写页面。
- 前后端实现后必须联调。
- Playwright 必须覆盖主业务路径。
- 在当前 Windows Codex 环境运行 Playwright 时，使用 `playwright-local-runtime`。

## 推荐职责

- Skill：`feature-doc-pack`、`backend-feature-design-review`、`ui-ux-pro-max`、`playwright-local-runtime`、`superpowers:test-driven-development`。
- Subagent：`sql-pro`、`api-designer`、`ui-designer`、`spring-boot-engineer`、`frontend-developer`、`reviewer`。
