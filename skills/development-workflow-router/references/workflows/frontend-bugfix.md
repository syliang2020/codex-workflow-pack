# Frontend Bugfix Workflow

适用于 bug 根因主要在前端的修复。如果问题依赖后端接口、字段、权限或数据口径变化，必须重新分类为 `fullstack-bugfix`。

## 标准流程

### 1. `bug-reproduce` / `superpowers:systematic-debugging`

- 使用：
  - `superpowers:systematic-debugging`
  - `debugger`
  - `playwright-local-runtime`（需要真实浏览器复现时）
- 输入：
  - 用户描述
  - 页面路径
  - 报错信息
  - 失败测试
  - 浏览器现象
- 目标：
  - 复现 bug
  - 记录现象、复现步骤、期望结果和实际结果
- 输出：
  - 复现路径
  - 期望结果
  - 实际结果
  - 影响范围
  - 初步根因假设
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 复现信息不足、页面路径不明确或影响范围不清时需要确认

---

### 2. 定位前端根因

- 使用：
  - `superpowers:systematic-debugging`
  - `debugger`
  - `ui-fixer`
- 输入：
  - 复现结果
  - 相关前端代码
  - 控制台、网络请求和 UI 状态
- 目标：
  - 定位前端根因
  - 判断是否涉及后端接口或业务行为变化
- 输出：
  - 已验证根因
  - 受影响组件或页面
  - 是否涉及后端接口
  - 回归风险
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 根因不唯一、需要后端改动或修复会改变交互行为时需要确认

---

### 3. 修复方案设计

- 使用：
  - `ui-ux-pro-max`
  - `api-designer`（涉及接口契约时）
  - `superpowers:brainstorming`（修复会改变业务行为时）
- 输入：
  - 已验证根因
  - 受影响页面、组件、状态和接口调用
  - 现有 UI/UX 规则
- 目标：
  - 设计最小修复方案
  - 确认是否需要 UI/UX、接口或交互调整
- 输出：
  - 修复方案
  - UI/UX 风险
  - 接口依赖结论
  - 回归测试点
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 修复影响交互、视觉、接口依赖或用户路径时需要确认

---

### 4. `superpowers:writing-plans`

- 使用：
  - `superpowers:writing-plans`
- 输入：
  - 根因定位结果
  - 修复方案
  - 回归测试点
  - 项目前端构建和测试约束
- 目标：
  - 输出最小修复计划
- 输出：
  - 文件级修复计划
  - 回归测试计划
  - 浏览器验证计划
  - 风险和回滚方案
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 是，计划确认前不得写代码

---

### 5. `superpowers:executing-plans` with regression test

- 使用：
  - `superpowers:executing-plans`
  - `frontend-developer`
  - `ui-fixer`
- 输入：
  - 已确认的修复计划
  - 回归测试计划
  - 可修改范围
- 目标：
  - 使用 `frontend-developer` 或 `ui-fixer` 修复
  - 先补复现问题的失败测试或浏览器验证脚本，再修复
  - 不做无关重构
- 输出：
  - 前端修复
  - 回归测试或验证脚本
  - 实际修改文件
  - 初步验证结果
  - 子代理交接报告，如使用 subagent
- 是否允许改代码：
  - 是，仅限用户确认后的计划范围
- 是否需要用户确认：
  - 执行前必须已经确认 writing-plans；偏离计划时需要再次确认

---

### 6. `ui-ux-pro-max` / `reviewer`

- 使用：
  - `ui-ux-pro-max`
  - `reviewer`
- 输入：
  - 当前 diff
  - 根因和修复方案
  - 回归测试或浏览器验证计划
- 目标：
  - 审查修复是否最小，是否引入 UI/UX 或交互风险
- 输出：
  - UI/UX 审查结论
  - 通用代码审查结论
  - 必须修复项
- 是否允许改代码：
  - 审查阶段不改代码；不通过则回到 executing-plans 修改
- 是否需要用户确认：
  - 涉及范围扩大或交互取舍时需要确认

---

### 7. 构建测试 / Playwright 回归测试

- 使用：
  - 项目前端测试命令
  - `playwright-local-runtime`
  - `superpowers:verification-before-completion`
- 输入：
  - 修复后的代码
  - 回归测试计划
  - 页面复现路径
- 目标：
  - 证明原前端问题已修复
  - 执行构建、lint、类型检查或真实浏览器回归验证
- 输出：
  - 测试命令
  - 测试结果：`passed` / `failed` / `not-run`
  - 浏览器验证结果，如适用
  - 失败或未运行说明
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
  - 回归测试和浏览器验证结果
  - 审查结果
- 目标：
  - 汇总 bug 复现、根因、修复和浏览器验证证据
- 输出：
  - bug 现象
  - 根因
  - 修复摘要
  - 修改文件
  - 测试结果
  - 浏览器验证结果
  - 剩余风险
  - 建议验收路径
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 是
