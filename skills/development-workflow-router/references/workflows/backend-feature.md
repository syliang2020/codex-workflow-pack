# Backend Feature Workflow

适用于只做后端功能开发，不开发前端页面的需求。

## 推荐流程

`superpowers:brainstorming` -> 项目上下文读取 -> 必要时询问并使用 `feature-doc-pack` -> 数据库影响分析 -> 接口契约定义 -> `backend-feature-design-review` 设计门禁 -> `superpowers:writing-plans` -> 用户确认 -> `superpowers:executing-plans` 或 `superpowers:subagent-driven-development` -> 后端实现 -> 后端代码审查 -> 单元测试或接口测试 -> 验收。

## 规则

- 涉及数据库时，先输出数据库影响分析和 DDL 草案，不直接执行数据库变更。
- 涉及接口时，必须先定义接口契约。
- 不开发前端页面。
- 默认不需要 Playwright，除非影响已有页面或用户要求真实浏览器验证。
- 如果发现需求实际需要前端改动，必须停止并重新分类为 `fullstack-feature`。
- 后端设计和实现必须遵守项目 `AGENTS.md` 的分层、事务、权限、校验和注释规则。
- 读取项目 `AGENTS.md` 后，必须把项目级阻塞规则写入计划质量门禁。

## 推荐职责

- Skill：`feature-doc-pack`、`backend-feature-design-review`、`superpowers:test-driven-development`。
- Subagent：`api-designer`、`spring-boot-engineer`、`sql-pro`、`reviewer`。
