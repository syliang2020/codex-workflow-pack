# Fullstack Bugfix Workflow

适用于 bug 涉及前后端边界、接口契约、数据结构、权限、页面调用或联调问题的修复。

## 标准流程

### 1. `bug-reproduce` / `superpowers:systematic-debugging`

- 使用：
  - `superpowers:systematic-debugging`
  - `debugger`
  - `playwright-local-runtime`（需要真实浏览器复现时）
- 输入：
  - 用户描述
  - 页面路径或接口请求
  - 报错信息
  - 失败测试
  - 控制台、网络请求、后端日志
- 目标：
  - 复现 bug
  - 记录现象、复现步骤、期望结果和实际结果
- 输出：
  - 复现路径
  - 期望结果
  - 实际结果
  - 前后端影响范围
  - 初步根因假设
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 复现信息不足、页面或接口不明确、影响范围不清时需要确认

---

### 2. 判断前后端责任边界

- 使用：
  - `superpowers:systematic-debugging`
  - `debugger`
  - `api-designer`
- 输入：
  - 复现结果
  - 前端网络请求和状态
  - 后端接口、日志和测试
  - API 契约
- 目标：
  - 判断前端传参、后端返回、字段命名、权限、状态码和数据状态是否一致
- 输出：
  - 已验证根因
  - 前端责任
  - 后端责任
  - 接口契约差异
  - 回归风险
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 根因不唯一、需要改变契约或业务行为时需要确认

---

### 3. 修复方案设计

- 使用：
  - `backend-feature-design-review`
  - `ui-ux-pro-max`
  - `api-designer`
  - `sql-pro`
  - `superpowers:brainstorming`（修复会改变业务行为时）
- 输入：
  - 已验证根因
  - 受影响页面、接口、Service、Mapper / DAO / Repository、SQL
  - 历史数据和兼容性约束
- 目标：
  - 设计前后端修复方案
  - 对齐接口、字段、权限、状态码和数据口径
- 输出：
  - 前端修复方案
  - 后端修复方案
  - API 兼容性结论
  - SQL / 数据库风险
  - 浏览器和接口回归测试点
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 修复影响接口、数据库、权限、历史数据、UI 行为或业务语义时需要确认

---

### 4. `superpowers:writing-plans`

- 使用：
  - `superpowers:writing-plans`
- 输入：
  - 根因定位结果
  - 前后端修复方案
  - 回归测试点
  - 项目构建、测试和启动约束
- 目标：
  - 输出前后端最小修复计划和联调计划
- 输出：
  - 前后端文件级修复计划
  - 接口联调计划
  - 回归测试与 Playwright 验证计划
  - 风险和回滚方案
  - 子代理分工，如需要
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 是，计划确认前不得写代码

---

### 5. `superpowers:executing-plans` with regression test

- 使用：
  - `superpowers:executing-plans`
  - `spring-boot-engineer`
  - `frontend-developer`
- 输入：
  - 已确认的修复计划
  - 回归测试和联调计划
  - 可修改范围
- 目标：
  - 后端由 `spring-boot-engineer` 修复
  - 前端由 `frontend-developer` 修复
  - 先补能复现 bug 的测试或浏览器验证脚本，再修复
- 输出：
  - 后端修复
  - 前端修复
  - 回归测试或验证脚本
  - 实际修改文件
  - 子代理交接报告
- 是否允许改代码：
  - 是，仅限用户确认后的计划范围
- 是否需要用户确认：
  - 执行前必须已经确认 writing-plans；偏离计划时需要再次确认

---

### 6. 前后端代码审查

- 使用：
  - `backend-feature-design-review`
  - `ui-ux-pro-max`
  - `reviewer`
- 输入：
  - 当前 diff
  - 根因和修复方案
  - 回归测试和联调计划
- 目标：
  - 审查前端、后端、接口契约和计划外修改
- 输出：
  - 后端审查结论
  - UI/UX 审查结论
  - 通用代码审查结论
  - 必须修复项
- 是否允许改代码：
  - 审查阶段不改代码；不通过则回到 executing-plans 修改
- 是否需要用户确认：
  - 涉及范围扩大或修复取舍时需要确认

---

### 7. 联调

- 使用：
  - 主 agent
  - `api-designer`（接口契约存在疑问时）
- 输入：
  - 前后端修复
  - API 契约和字段映射
  - 错误处理和权限规则
- 目标：
  - 检查前端传参、后端返回、字段命名、状态码、错误提示、权限边界和页面反馈
- 输出：
  - 联调结论
  - 前后端不一致问题，如有
  - 需要回到对应端修复的问题
- 是否允许改代码：
  - 不通过时回到对应端 executing-plans 修复
- 是否需要用户确认：
  - 联调问题改变设计或范围时需要确认

---

### 8. Playwright 回归测试

- 使用：
  - `playwright-local-runtime`
  - 项目测试命令
  - `superpowers:verification-before-completion`
- 输入：
  - 已联调的修复结果
  - 页面复现路径
  - 回归测试计划
- 目标：
  - 证明原 bug 已修复
  - 覆盖接口联调和页面表现
- 输出：
  - 测试命令
  - 测试结果：`passed` / `failed` / `not-run`
  - 浏览器验证结果
  - 失败或未运行说明
- 是否允许改代码：
  - failed 且确认是本次改动导致时，回到 executing-plans 修复
- 是否需要用户确认：
  - 验收前需要给出测试结果；not-run 必须确认风险

---

### 9. 验收总结

- 使用：
  - `superpowers:verification-before-completion`
  - acceptance checklist
- 输入：
  - 最终 diff
  - 回归测试、联调和浏览器验证结果
  - 审查结果
- 目标：
  - 汇总 bug 复现、根因、前后端修复、联调和浏览器验证证据
- 输出：
  - bug 现象
  - 根因
  - 前后端修复摘要
  - 接口和页面影响
  - 修改文件
  - 测试结果
  - 浏览器验证结果
  - 剩余风险
  - 建议验收路径
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 是
