# Backend Feature Workflow

适用于只做后端功能开发、不开发前端页面的需求。如果发现需要前端页面、前端调用链或联调改动，必须重新分类为 `fullstack-feature`。

## 标准流程

### 1. `superpowers:brainstorming`

- 使用：
  - `superpowers:brainstorming`
- 输入：
  - 用户需求
  - 项目上下文
  - 相关文档
  - 现有代码结构
- 目标：
  - 澄清后端需求
  - 明确业务边界、数据流、权限影响、数据库影响、接口影响和不做事项
  - 形成验收标准初稿
- 输出：
  - 需求目标
  - 业务边界
  - 数据流
  - 权限影响
  - 数据库影响判断
  - 接口影响判断
  - 不做事项
  - 验收标准初稿
  - 需要用户确认的问题
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 是

---

### 2. `api-designer` / `sql-pro` 协同设计

- 使用：
  - `api-designer`
  - `sql-pro`
- 输入：
  - 已确认的 brainstorm 结果
  - 项目接口规范
  - 项目数据库规范
  - 现有 Controller / Service / Mapper / DAO / Repository / SQL
- 目标：
  - 设计接口契约
  - 设计数据访问方案
  - 判断是否涉及数据库结构变更
- 输出：
  - Controller 接口清单
  - 入参、出参、错误码和兼容性说明
  - 权限校验位置
  - 数据来源和字段语义
  - SQL / Mapper / DAO / Repository 方案
  - 数据库结构变更判断；如涉及，只输出 DDL 草案，不执行变更
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 涉及接口兼容、字段语义、权限、数据库结构或历史数据兼容时需要确认

---

### 3. `backend-feature-design-review` 编码前设计门禁

- 使用：
  - `backend-feature-design-review`
- 输入：
  - 已确认的需求边界
  - 接口契约草案
  - 数据访问方案
  - 数据库影响说明
  - 计划修改的 Controller / Service / Mapper / DAO / Repository
- 目标：
  - 在编码前检查后端设计是否会引入结构性问题
- 输出：
  - 接口契约审查结论
  - 数据库方案审查结论
  - 分层设计、权限、异常、事务和兼容性审查结论
  - 阻塞问题和修正建议
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 存在阻塞问题、设计取舍或风险上升时需要确认

---

### 4. `superpowers:writing-plans`

- 使用：
  - `superpowers:writing-plans`
- 输入：
  - 已确认的需求、接口契约、数据访问方案和设计门禁结论
  - 项目构建和测试约束
- 目标：
  - 生成可执行的文件级实现计划和测试计划
- 输出：
  - 修改文件清单
  - 分步骤实现计划
  - 测试计划
  - 子代理分工，如需要
  - 风险、回滚和验收标准
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 是，计划确认前不得写代码

---

### 5. `superpowers:executing-plans` with TDD

- 使用：
  - `superpowers:executing-plans`
  - `spring-boot-engineer`
- 输入：
  - 已确认的 writing-plans
  - 已确认的可修改范围
  - 测试计划
- 目标：
  - 按计划实现后端功能
  - 先写失败测试或回归测试，再实现代码，再运行测试
- 输出：
  - 后端代码实现
  - 新增或调整的测试
  - 实际修改文件
  - 测试初步结果
  - 子代理交接报告，如使用 subagent
- 是否允许改代码：
  - 是，仅限用户确认后的计划范围
- 是否需要用户确认：
  - 执行前必须已经确认 writing-plans；偏离计划时需要再次确认

---

### 6. `backend-feature-design-review` / `reviewer` 编码后代码审查

- 使用：
  - `backend-feature-design-review`
  - `reviewer`
- 输入：
  - 当前 diff
  - writing-plans
  - 编码前设计门禁结论
  - 测试结果
- 目标：
  - 审查 Controller、Service、Mapper / DAO / Repository、SQL、DTO、VO、测试和计划外修改
- 输出：
  - 后端代码审查结论
  - 通用代码审查结论
  - 历史问题 / 本次新增问题 / 本次扩大问题分类
  - 必须修复项
- 是否允许改代码：
  - 审查阶段不改代码；发现本次新增阻塞问题时回到 executing-plans 修复
- 是否需要用户确认：
  - 涉及范围扩大、设计取舍或无法立即修复时需要确认

---

### 7. 测试与验证

- 使用：
  - 项目测试命令
  - `superpowers:verification-before-completion`
- 输入：
  - 修改后的代码
  - 测试计划
  - 审查修复结果
- 目标：
  - 验证实现符合需求和回归要求
- 输出：
  - 测试命令
  - 测试结果：`passed` / `failed` / `not-run`
  - 失败说明，如有
  - 未运行说明、风险和替代验证，如有
- 是否允许改代码：
  - 测试失败且确认是本次改动导致时，可以回到 executing-plans 修复
- 是否需要用户确认：
  - 验收前需要给出测试结果；测试无法运行时需要确认风险

---

### 8. 验收总结

- 使用：
  - `superpowers:verification-before-completion`
  - acceptance checklist
- 输入：
  - 最终 diff
  - 测试结果
  - 审查结果
- 目标：
  - 汇总交付内容并给出用户验收路径
- 输出：
  - 任务类型
  - 完成功能
  - 接口清单
  - 修改文件清单
  - 数据库变更说明，如有
  - 测试命令和结果
  - 已知风险
  - 未完成项
  - 回滚建议
  - 后续建议
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 是
