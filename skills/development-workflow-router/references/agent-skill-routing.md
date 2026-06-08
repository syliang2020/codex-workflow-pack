# Agent And Skill Routing

用于选择、执行和回收本机已有 skills、plugins 和 subagents。核心规则：列出名称不等于使用；必须执行对应职责，或说明不可用并由主 agent 替代。

## 使用定义

### Skill 使用

只有满足以下条件，才算实际使用 skill：

1. 已读取该 skill 的 `SKILL.md` 或相关 reference。
2. 已按该 skill 的流程、门禁或检查清单执行。
3. 已输出该 skill 要求的产出物，例如设计确认、协作文档、审查结论、运行策略或验证结果。

只在流程中列名、口头说“建议使用”、或没有产出物，都不算使用。

### Subagent 使用

只有满足以下条件，才算实际使用 subagent：

1. 真实启动对应 subagent。
2. 任务说明写清职责边界、可读写范围、禁止事项、输入、输出和验证要求。
3. 回收 subagent 的交接报告。
4. 主 agent 检查交接报告和工作区状态。

没有真实启动时，不得说该 subagent 已执行。

### 不可用替代

如果 skill 或 subagent 不可用，必须输出：

```text
未使用 <skill/subagent>。
原因：<不可用原因>。
替代：由主 agent 按 <skill/subagent> 的职责执行。
替代产出：<设计/审查/实现/验证结果>。
```

不可用原因可以是：未安装、当前工具列表没有该 subagent、用户禁止启动子代理、当前模式为 prompt-preview、权限或环境限制。

## direct-flow 路由规则

`direct-flow` 是当前会话执行模式：

- 阶段触发 skill 时，必须实际读取并执行该 skill。
- 阶段需要 subagent 且用户已确认计划时，必须启动 subagent；不可用时主 agent 替代执行。
- 每个阶段输出必须记录“实际使用的 skill / subagent / 替代执行”。

## prompt-preview 路由规则

`prompt-preview` 当前会话不启动 subagent、不执行命令、不修改文件。

但是生成的 superpowers workflow prompt 必须要求下一轮 Codex：

- 在对应阶段实际使用 superpowers skills、`feature-doc-pack`、`backend-feature-design-review`、`ui-ux-pro-max`、`playwright-local-runtime` 等必要 skills。
- 在用户确认计划后启动必要 subagents。
- 如果 skill 或 subagent 不可用，说明原因并由主 agent 按同等职责替代。
- 不允许只列出名称但不执行对应职责。

## Skill 路由

- 新功能、创建组件、修改业务行为、需求不清或需要澄清范围：使用 `superpowers:brainstorming`。
- bugfix、失败测试、报错、异常行为：使用 `superpowers:systematic-debugging`。
- 新功能或 bugfix 实现前：使用 `superpowers:test-driven-development`，除非用户明确允许例外或项目不适用，并说明原因。
- 需要协作文档、前后端联调、接口字段、数据库、复杂规则或进度追踪：先询问是否使用 `feature-doc-pack`；用户确认后使用。
- 后端复杂功能、数据库字段、接口变更、复杂校验、保存/编辑/删除流程、事务边界、外部调用或历史数据兼容：编码前使用 `backend-feature-design-review`。
- 文档和设计确认后：使用 `superpowers:writing-plans`。
- 计划确认后开始执行：使用 `superpowers:executing-plans` 或 `superpowers:subagent-driven-development`。
- 运行 Playwright 或浏览器真实测试，且处于 Windows Codex 环境：按需要使用 `playwright-local-runtime`。
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
8. 验证命令或无法验证的说明。
9. 是否允许新增依赖；默认不允许。
10. 与其它子代理的边界，避免同文件或同模块并行修改。

## 协作文档门禁

命中 `feature-doc-pack` 场景时，不要直接生成文档。先询问用户是否生成协作文档；用户确认后再进入文档流程。文档确认后，仍需按任务类型继续进入后端设计门禁、计划、实现、审查和测试。

推荐顺序：

1. 实际使用 `superpowers:brainstorming` 澄清需求和影响范围。
2. 需要协作时询问并使用 `feature-doc-pack`。
3. 涉及后端复杂设计时实际使用 `backend-feature-design-review`。
4. 文档和设计确认后实际使用 `superpowers:writing-plans`。
5. 计划确认后实际使用 `superpowers:executing-plans` 或启动子代理协作。

## Playwright 路由

- `frontend-feature` 和 `fullstack-feature`：默认需要浏览器真实测试。
- `frontend-bugfix` 和 `fullstack-bugfix`：默认需要复现路径和回归路径。
- `backend-feature`：只有影响已有页面、接口行为需要前端验证或用户要求时才需要。
- `backend-bugfix`：默认以单元测试或接口测试为主；影响页面表现时再补浏览器测试。
- 一旦需要 Playwright，在 Windows Codex 环境优先使用 `playwright-local-runtime`；不可用时说明原因并给出替代验证。
