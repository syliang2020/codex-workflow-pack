# Agent And Skill Routing

用于选择本机已有 skills、plugins 和 subagents。先按项目规则判断是否允许启动子代理；不允许时，只给职责建议并由主 agent 执行同等检查。

## Skill 路由

- 需求不清、需要澄清范围：使用 `superpowers:brainstorming`。
- 需要协作文档、前后端联调、接口字段、数据库、复杂规则或进度追踪：先询问是否使用 `feature-doc-pack`。
- 后端复杂功能、数据库字段、接口变更、复杂校验、保存/编辑/删除流程、事务边界、外部调用或历史数据兼容：编码前使用 `backend-feature-design-review`。
- 新功能或 bugfix 实现：使用 `superpowers:test-driven-development`，除非用户明确允许例外。
- 已有计划并开始执行：使用 `superpowers:writing-plans` 后再进入 `superpowers:executing-plans` 或 `superpowers:subagent-driven-development`。
- 运行 Playwright 或浏览器真实测试，且处于当前 Windows Codex 环境：使用 `playwright-local-runtime`。
- 前端体验、UI/UX 审查或页面交互质量：使用 `ui-ux-pro-max`。
- 完成前声明通过或完成：使用 `superpowers:verification-before-completion`。

## Subagent 路由

- `spring-boot-engineer`：Spring Boot 后端实现、配置、Service、Controller、数据访问落地。
- `api-designer`：接口契约、字段兼容性、REST 设计和版本演进。
- `sql-pro`：SQL、迁移草案、索引建议、查询设计、数据库问题分析。
- `database-optimizer`：执行计划、慢查询、索引性能、数据库性能优化。
- `frontend-developer`：前端实现、前端功能、生产级交互行为。
- `ui-designer`：UI 方案、交互边界、实现前设计决策。
- `ui-fixer`：已复现 UI 问题的最小安全修复。
- `reviewer`：PR 风格代码审查，重点是正确性、安全、行为回归和缺失测试。
- `debugger`：报错、失败测试、运行时行为和深度 bug 定位。
- `security-auditor`：鉴权、权限、敏感信息、输入校验和安全风险。
- `microservices-architect`：服务边界、服务间契约、分布式一致性和架构取舍。
- `product-manager`：产品范围、优先级、用户影响和需求收敛。

## 子代理任务模板

启动子代理前，主 agent 必须写清：

1. 任务目标。
2. 是否只读。
3. 可读取范围。
4. 可修改范围；只读任务写“不得修改文件”。
5. 禁止事项。
6. 输入文档或关键上下文。
7. 交付物格式。
8. 验证命令或需要说明无法验证的原因。
9. 是否允许新增依赖；默认不允许。
10. 与其它子代理的边界，避免同文件或同模块并行修改。

## 协作文档门禁

命中 `feature-doc-pack` 场景时，不要直接生成文档。先询问用户是否生成协作文档；用户确认后再进入文档流程。文档确认后，仍需按任务类型继续进入后端设计门禁、计划、实现、审查和测试。

推荐顺序：

1. `superpowers:brainstorming` 澄清需求和影响范围。
2. 需要协作时询问并使用 `feature-doc-pack`。
3. 涉及后端复杂设计时使用 `backend-feature-design-review`。
4. 文档和设计确认后进入 `superpowers:writing-plans`。
5. 计划确认后进入实现或子代理协作。

## Playwright 路由

- `frontend-feature` 和 `fullstack-feature`：默认需要浏览器真实测试。
- `frontend-bugfix` 和 `fullstack-bugfix`：默认需要复现路径和回归路径。
- `backend-feature`：只有影响已有页面、接口行为需要前端验证或用户要求时才需要。
- `backend-bugfix`：默认以单元测试或接口测试为主；影响页面表现时再补浏览器测试。
- 一旦需要 Playwright，在当前 Windows Codex 环境优先加载 `playwright-local-runtime`。
