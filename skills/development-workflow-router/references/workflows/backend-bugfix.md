# Backend Bugfix Workflow

适用于 bug 根因主要在后端的修复。如果问题依赖前端页面、接口联调或浏览器表现，必须重新评估为 `fullstack-bugfix`。

## 标准流程

### 1. `bug-reproduce` / `superpowers:systematic-debugging`

- 使用：
  - `superpowers:systematic-debugging`
  - `debugger`
- 输入：
  - 用户描述
  - 报错信息
  - 失败测试
  - 日志、请求参数或复现数据
- 目标：
  - 复现 bug
  - 记录现象、复现步骤、期望结果和实际结果
  - 不盲改
- 输出：
  - 复现路径
  - 期望结果
  - 实际结果
  - 影响范围
  - 初步根因假设
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 复现信息不足、影响范围不清或无法复现时需要确认

---

### 2. 根因定位

- 使用：
  - `superpowers:systematic-debugging`
  - `debugger`
- 输入：
  - 复现结果
  - 相关后端代码
  - 日志、测试和调用链
- 目标：
  - 定位后端根因
  - 判断是否涉及接口契约、SQL、事务、权限、缓存或数据状态
- 输出：
  - 已验证根因
  - 受影响调用链
  - 受影响数据或接口
  - 回归风险
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 根因不唯一或修复会改变业务行为时需要确认

---

### 3. 修复方案设计

- 使用：
  - `api-designer`
  - `sql-pro`
  - `backend-feature-design-review`
  - `superpowers:brainstorming`（修复会改变业务规则、扩大范围、影响公共工具或变成 feature 时）
- 输入：
  - 已验证根因
  - 受影响接口、Service、Mapper / DAO / Repository、SQL
  - 历史数据和兼容性约束
- 目标：
  - 设计最小修复方案
  - 确认是否需要接口、SQL、权限或事务调整
- 输出：
  - 修复方案
  - 回归测试点
  - API 兼容性结论
  - SQL / 数据库风险
  - 后端设计审查结论，如适用
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 修复影响接口、数据库、权限、历史数据或业务语义时需要确认

---

### 4. `superpowers:writing-plans`

- 使用：
  - `superpowers:writing-plans`
- 输入：
  - 根因定位结果
  - 修复方案
  - 回归测试点
  - 项目测试约束
- 目标：
  - 输出最小修复计划
- 输出：
  - 文件级修复计划
  - 回归测试计划
  - 风险和回滚方案
  - 子代理分工，如需要
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 是，计划确认前不得写代码

---

### 5. `superpowers:executing-plans` with bugfix TDD

- 使用：
  - `superpowers:executing-plans`
  - `superpowers:test-driven-development`
  - `spring-boot-engineer`
- 输入：
  - 已确认的修复计划
  - 回归测试计划
  - 可修改范围
- 目标：
  - 必须先写或调整失败回归测试，证明当前 bug 存在
  - 必须确认该测试在修复前失败
  - 再做最小代码修复
  - 重新运行测试，确认失败测试变为通过
  - 无法编写自动化测试时，必须说明原因、可重复的最小复现步骤、替代验证方式和风险
  - 不得把未运行的测试或验证标记为 `passed`
  - 不做无关重构，不扩大修复范围
- 输出：
  - 后端修复
  - 修复前失败、修复后通过的回归测试或验证用例
  - 实际修改文件
  - 测试初步结果
  - 无法自动化测试时的原因、可重复的最小复现步骤、替代验证方式和风险，如适用
  - 子代理交接报告，如使用 subagent
- 是否允许改代码：
  - 是，仅限用户确认后的计划范围
- 是否需要用户确认：
  - 执行前必须已经确认 writing-plans；偏离计划时需要再次确认

---

### 6. `backend-feature-design-review` / `reviewer`

- 使用：
  - `backend-feature-design-review`
  - `reviewer`
- 输入：
  - 当前 diff
  - 根因和修复方案
  - 回归测试
- 目标：
  - 审查修复是否最小
  - 判断是否引入新风险
- 输出：
  - 后端审查结论
  - 通用代码审查结论
  - 必须修复项
- 是否允许改代码：
  - 审查阶段不改代码；发现本次新增阻塞问题时回到 executing-plans 修复
- 是否需要用户确认：
  - 涉及范围扩大或修复取舍时需要确认

---

### 7. 回归测试

- 使用：
  - 项目测试命令
  - `superpowers:verification-before-completion`
- 输入：
  - 修复后的代码
  - 回归测试计划
  - 审查修复结果
- 目标：
  - 证明复现场景通过
  - 证明相关接口测试或最小回归测试通过
- 输出：
  - 测试命令
  - 测试结果：`passed` / `failed` / `not-run`
  - 失败说明，如有
  - 未运行说明、风险和替代验证，如有
- 是否允许改代码：
  - failed 且确认是本次改动导致时，回到 executing-plans 修复
- 是否需要用户确认：
  - 验收前需要给出测试结果；not-run 必须确认风险

---

### 8. 验收总结

- 使用：
  - `superpowers:verification-before-completion`
  - acceptance checklist
- 输入：
  - 最终 diff
  - 回归测试结果
  - 审查结果
- 目标：
  - 汇总 bug 复现、根因、修复和验证证据
- 输出：
  - bug 现象
  - 根因
  - 修复摘要
  - 修改文件
  - 测试命令和结果
  - 剩余风险
  - 建议验收路径
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 是
