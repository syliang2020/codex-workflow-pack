# Frontend Feature Workflow

适用于只做前端功能开发，不改后端接口的需求。

## 推荐流程

`superpowers:brainstorming` -> 项目上下文读取 -> 必要时询问并使用 `feature-doc-pack` -> UI 交互边界定义 -> 确认是否复用现有接口 -> `superpowers:writing-plans` -> 用户确认 -> `superpowers:executing-plans` 或 `superpowers:subagent-driven-development` -> 前端实现 -> 前端体验审查 -> 构建测试 -> Playwright 或浏览器真实测试 -> 验收。

## 规则

- 不修改后端代码。
- 如果发现接口缺失，停止开发，输出接口变更建议。
- 不擅自 mock 后端长期逻辑。
- UI 方案确认前，不要大规模写页面。
- Playwright 覆盖核心页面路径。
- 在当前 Windows Codex 环境运行 Playwright 时，使用 `playwright-local-runtime`。
- 如果发现需求实际需要后端改动，必须停止并重新分类为 `fullstack-feature`。

## 推荐职责

- Skill：`feature-doc-pack`、`ui-ux-pro-max`、`playwright-local-runtime`、`superpowers:test-driven-development`。
- Subagent：`ui-designer`、`frontend-developer`、`ui-fixer`、`reviewer`。
