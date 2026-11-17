# Agent And Skill Routing

用于选择、执行和回收本机已有 skills、plugins 和 subagents。核心规则：列出名称不等于使用；必须执行对应职责，或说明不可用并由主 agent 替代。

## 与 Workflow 的关系

- `references/workflows/*.md` 是阶段顺序和阶段要求的唯一来源。
- 本文件只解释如何做阶段绑定、按需路由和不可用降级。
- 如果本文件的推荐映射与 workflow 阶段冲突，以 workflow 为准。
- 执行器选择、派发授权和最终收尾遵守 [Superpowers 兼容约定](superpowers-compatibility.md)；所有规则继承适用 `AGENTS.md`。

## 自动分工与授权

用户描述需求并授权使用子代理后，由主 agent 根据当前 workflow 阶段和下表选择角色，不要求用户重复说明“后端交给谁、前端交给谁”。用户已指定角色或范围时优先遵守；指定角色与任务职责冲突时说明冲突，不越界派发。

- 角色表覆盖本 skill 支持的 16 个专业角色，是职责与触发条件的单一来源；已安装不等于本次需要启动。
- 每个阶段的“使用”字段记录：选择的角色、触发依据、输入与预期输出、读写范围，以及派发或由主 agent 承担的实际状态。未命中条件的角色不派发，无需为常规角色选择再次询问用户。
- 先检查模式、授权和阶段是否允许。`prompt-preview` 只把条件分工写入提示词，不启动子代理；`review-only` 仅允许已授权的只读分析；`inline` 不派发实现型子代理。使用子代理的授权不替代设计和计划确认，也不自动改变已选择的执行方式。
- 同一项工作选择一个主要负责人；只有证据表明跨领域时再拆分协作。职责重叠时优先交接已有证据，不重复复现、重复审查或让多个实现者修改同一文件。
- 浏览器角色使用当前可用且已授权的浏览器工具。工具或环境不可用时报告限制并按降级规则处理，不因角色文件中的工具示例自动安装依赖、启动服务或修改配置。

## 专业角色职责表

表中“只读”表示不得修改业务代码或配置；浏览器复现和测试角色可以在任务允许的证据目录保存脱敏截图、日志和报告。角色文件声明的权限不能放宽当前模式、阶段和任务的读写边界。

| 角色 | 触发条件 | 适用阶段 | 输入 → 输出 | 读写范围与职责边界 |
| --- | --- | --- | --- | --- |
| `product-manager` | 目标、优先级、功能范围或验收标准存在影响交付的歧义 | feature 需求澄清；bugfix 方案设计中确需业务取舍时 | 原始需求、现状、约束 → 范围选项、取舍、可测试验收标准、待确认问题 | 只读分析；不替用户作业务决定，不替代 brainstorming，不承担技术实现 |
| `api-designer` | 新增或修改接口、字段、错误码、兼容性；联调契约存在疑问 | 协同设计、接口依赖确认、bugfix 方案设计、联调 | 调用方需求、现有接口、数据语义 → 契约、兼容方案、字段映射 | 只读设计；实现交给对应后端或前端角色，不直接修改业务代码 |
| `microservices-architect` | 服务边界、跨服务调用、分布式一致性或架构取舍影响本次方案 | 后端 / 全栈协同设计；相关 bugfix 方案设计 | 服务拓扑、调用链、失败证据、契约 → 边界方案、一致性策略、风险和交接约束 | 只读设计；不承担 Controller / Service / Repository 等具体业务实现，不因普通 CRUD 扩大到微服务重构 |
| `sql-pro` | SQL、数据访问、联表、分页、表结构或迁移方案需要设计或核对 | 后端 / 全栈协同设计、根因定位、bugfix 方案设计 | 数据模型、查询需求、现有 SQL → SQL / 数据访问方案、结构与兼容性建议 | 默认只读输出建议；后端代码由 `spring-boot-engineer` 实现，数据库执行须另有授权 |
| `database-optimizer` | 有慢查询、执行计划、索引、锁竞争或数据库容量方面的性能问题 | 后端 / 全栈根因定位、协同设计或 bugfix 方案设计 | 查询、执行计划、已有指标与数据规模 → 性能证据、索引 / 查询建议、验证方法 | 默认只读分析；与 `sql-pro` 按性能诊断和 SQL 设计分工，无需对同一查询重复分析；不直接修改后端代码或执行 DDL |
| `ui-designer` | 新页面或交互需要布局、状态、响应式、可访问性等明确方案 | 前端 / 全栈协同设计；涉及交互取舍的修复方案设计 | 用户流程、现有设计系统、页面约束 → 可实现的 UI / 交互方案与状态说明 | 只读设计；结合 `ui-ux-pro-max` 检查规则，不承担组件实现 |
| `debugger` | 根因尚未验证，需要分析代码、日志、测试或跨层调用链 | bugfix 复现、根因定位 | 复现描述、失败证据、相关调用链 → 可验证根因、影响范围、最小修复方向 | 只读定位；复用浏览器证据，修复交给所属实现角色，不在根因阶段改业务代码 |
| `browser-debugger` | 必须在真实浏览器复现，或需要分析请求、控制台、DOM、事件、缓存、会话及动态视觉问题 | 前端 / 全栈 bugfix 复现与根因定位；联调、浏览器测试失败后的诊断 | 页面路径、操作步骤、可用环境 → 最小复现、浏览器证据、根因或待验证假设、修复建议 | 默认仅操作浏览器并保存脱敏证据，不修改业务代码；局部 UI 修复交给 `ui-fixer`，其他前端修改交给 `frontend-developer`，后端修改交给 `spring-boot-engineer` |
| `spring-boot-engineer` | 已确认任务涉及 Spring Boot 后端业务或配置实现 | 已确认计划后的后端 / 全栈实现与修复 | 设计、契约、文件级计划、测试约束 → 最小后端改动、行为测试、验证证据 | 仅已授权的 `subagent-driven` 实现范围；遵守分层和项目数据访问规范，不承担前端修改或擅自改跨模块公共行为 |
| `frontend-developer` | 已确认任务涉及前端功能、状态、接口调用或较完整的逻辑修复 | 已确认计划后的前端 / 全栈实现与修复 | UI 方案、接口契约、计划、复现证据 → 前端改动、回归用例、验证证据 | 仅已授权的 `subagent-driven` 实现范围；不修改后端接口，不与 `ui-fixer` 同时修改同一组件 |
| `ui-fixer` | UI 问题已复现、根因和边界明确，适合局部最小补丁 | 已确认计划后的前端 / 全栈 UI 修复 | 已验证复现、根因、允许修改的组件 → 最小补丁、相邻交互回归证据 | 仅已授权的 `subagent-driven` UI 修复范围；不能在只读定位阶段提前改代码，不承担新功能或大范围前端重构 |
| `reviewer` | 需要核对实现与计划、正确性、回归和测试缺口 | 执行器任务审查、编码后最终通用审查、review-only | 当前 diff、设计、计划、测试证据 → 文件行号、触发条件、影响、修复建议和风险 | 只读代码审查；领域检查并入同一输入，修复退回实现者；已有等价且覆盖当前 diff 的证据复用 |
| `security-auditor` | 鉴权、数据权限、敏感数据、上传、外部输入等存在需要专项核验的安全边界 | 相关设计门禁、编码后审查、review-only | 权限规则、信任边界、方案或 diff、验证证据 → 安全发现、风险、修复与测试建议 | 只读安全专项检查；不替代 `reviewer` 的通用审查，不擅自攻击生产环境或执行破坏性验证 |
| `qa-expert` | 风险、跨模块、多状态或发布验收需要测试策划和覆盖分析 | 计划中的测试策划、测试结果与验收覆盖核对；独立测试或只读 QA 分析 | 规则、改动范围、环境与结果 → 测试矩阵、数据策略、覆盖缺口和验收条件 | 只读测试策划与结果分析，不修改业务或测试代码，不代替 reviewer 做通用代码审查，不将小改动扩大为全系统穷举 |
| `test-automator` | 需要新增或改进自动化测试、fixtures 或回归脚本 | 已确认实现阶段的测试任务；独立测试中获准的脚本实现 | 测试计划、失败证据、已有框架 → 行为测试、数据准备、运行命令与执行证据 | 仅已授权的测试及必要配置范围，不修改业务代码、不新增未经确认依赖；router 内实现型派发仍限已授权的 subagent-driven，inline 由主 agent 实现 |
| `ui-ux-tester` | 已有可运行页面，需要按已确认用户流程验收、交互回归或覆盖多个页面状态 | 前端 / 全栈浏览器测试与验收回归 | 验收标准、测试计划、可用环境 → 流程覆盖、复现步骤、脱敏证据、缺陷和未验证项 | 浏览器验证与证据记录，不修改业务代码；复现不稳定或原因不清时交给 `browser-debugger`，缺陷修复退回已确认实现阶段；影响真实数据的操作须在授权范围内 |

## 阶段绑定规则

不得只列出 skill 或 subagent 名称。

每个 workflow 阶段必须明确：

1. 本阶段使用哪个 skill 或 subagent。
2. 本阶段输入是什么。
3. 本阶段输出是什么。
4. 本阶段是否允许改代码。
5. 本阶段结束后是否需要用户确认。
6. 涉及子代理时，给出触发依据、读写范围和实际执行者；按职责表自动选择，不把角色选择问题重复交给用户。

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
  - `execution_mode`、子代理授权依据、设计来源及计划文件路径
- 是否允许改代码：
  - 否
- 是否需要确认：
  - 是，计划确认前不得写代码

### 已确认执行方式：feature TDD

- `inline`：使用 `superpowers:executing-plans`，由主 agent 实现。
- `subagent-driven`：使用 `superpowers:subagent-driven-development`，仅在获准派发时由相应专业子代理实现。

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
  - 执行前确认计划及执行方式；范围、契约、业务语义或授权变化时确认，已授权范围内的实现细节记录裁决后继续

### 已确认执行方式：bugfix TDD

执行器按上述 `execution_mode` 选择，修复与回归失败不得静默切换执行器。

- 输入：
  - 已确认 writing-plans
  - 已验证根因
  - 可修改范围
  - 回归测试计划
- 输出：
  - 修复前失败、修复后通过的回归测试或验证证据
  - 最小代码修复
  - 测试结果
  - 无法编写自动化测试时的原因、可重复的最小复现步骤、替代验证方式和风险，如适用
- 是否允许改代码：
  - 是
- 是否需要确认：
  - 执行前确认计划及执行方式；范围、契约、业务语义或授权变化时确认，已授权范围内的实现细节记录裁决后继续

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

下列路由中的执行技能按已确认方式二选一，专业角色只有在授权及阶段边界允许时才派发；inline 由主 agent 承担对应职责。编码后通用审查复用所选执行器的最终审查，不重复派发。

- `backend-feature`：`superpowers:brainstorming`、`api-designer`、`sql-pro`（涉及数据库时）、`backend-feature-design-review`、`superpowers:writing-plans`、所选执行器（feature TDD）、`spring-boot-engineer`、`reviewer`、`superpowers:verification-before-completion`。
- `frontend-feature`：`superpowers:brainstorming`、`ui-designer`、`ui-ux-pro-max`、`api-designer`（接口依赖确认时）、`superpowers:writing-plans`、所选执行器（feature TDD）、`frontend-developer`、`reviewer`、`playwright-local-runtime`、`superpowers:verification-before-completion`。
- `fullstack-feature`：`superpowers:brainstorming`、`api-designer`、`sql-pro`（涉及数据库时）、`ui-designer`、`ui-ux-pro-max`、`backend-feature-design-review`、`superpowers:writing-plans`、所选执行器（feature TDD）、`spring-boot-engineer`、`frontend-developer`、`reviewer`、`playwright-local-runtime`。
- `backend-bugfix`：`superpowers:systematic-debugging`、`debugger`、`api-designer` / `sql-pro` / `backend-feature-design-review`（按影响范围）、`superpowers:writing-plans`、所选执行器（bugfix TDD）、`superpowers:test-driven-development`、`spring-boot-engineer`、`reviewer`、`superpowers:verification-before-completion`。
- `frontend-bugfix`：`superpowers:systematic-debugging`、`debugger` / `browser-debugger`（只读复现定位）、`ui-ux-pro-max`、`superpowers:writing-plans`、所选执行器（bugfix TDD）、`superpowers:test-driven-development`、`frontend-developer` / `ui-fixer`（按修复范围选择）、`reviewer`、`playwright-local-runtime`、`ui-ux-tester`（用户流程回归时）。
- `fullstack-bugfix`：`superpowers:systematic-debugging`、`debugger`、`api-designer`、`backend-feature-design-review`、`ui-ux-pro-max`、`sql-pro`（涉及数据库时）、`superpowers:writing-plans`、所选执行器（全栈 bugfix TDD）、`superpowers:test-driven-development`、`spring-boot-engineer`、`frontend-developer`、`reviewer`、`playwright-local-runtime`。

上述基础路由按职责表补充条件角色：feature 澄清或业务取舍使用 `product-manager`；后端 / 全栈架构取舍使用 `microservices-architect`；数据库性能问题使用 `database-optimizer`；安全专项使用 `security-auditor`；前端 / 全栈浏览器复现和诊断使用 `browser-debugger`，用户流程验收使用 `ui-ux-tester`。具体绑定位置见各 workflow，不在本文件重排阶段。

功能测试依据需求、契约和已确认预期策划执行，按风险使用 `qa-expert`，按已授权测试实现范围使用 `test-automator`。页面视觉检查使用 [ui-visual-testing](../../ui-visual-testing/SKILL.md)，单独报告静态视觉和交互过程的视觉稳定性，不代替功能验收。UI 规范及体验判断使用 `ui-ux-pro-max`，以项目标准和同类组件为准，不由通用建议自动引入重设计。独立测试不要求先进入 router。

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
11. 本次派发授权依据和已确认执行方式；只读检查、诊断或最终审查也不能省略授权判断。
12. 应继承的 `AGENTS.md` 约束、当前计划及设计来源，以及最终审查、清理和分支收尾由 router 统筹的边界。

具体调用参数以本会话工具 schema 为准。角色、模型与 reasoning effort 使用当前可用配置；不覆盖固定角色设置，不把完整历史 fork 与不支持的模型覆盖参数组合使用。
