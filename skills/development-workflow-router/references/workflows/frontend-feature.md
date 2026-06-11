# Frontend Feature Workflow

适用于只做前端功能开发、不改后端接口的需求。如果发现接口缺失、字段契约变化或需要后端改动，必须重新分类为 `fullstack-feature`。

## 标准流程

### 1. `superpowers:brainstorming`

- 使用：
  - `superpowers:brainstorming`
- 输入：
  - 用户需求
  - 项目上下文
  - 现有页面、组件和接口依赖
- 目标：
  - 澄清页面目标、交互边界、权限、接口依赖和验收标准
- 输出：
  - 页面目标
  - 交互边界
  - 权限影响
  - 接口依赖判断
  - 不做事项
  - 验收标准初稿
  - 需要用户确认的问题
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 是

---

### 2. `ui-designer` / `ui-ux-pro-max`

- 使用：
  - `ui-designer`
  - `ui-ux-pro-max`
- 输入：
  - 已确认的 brainstorm 结果
  - 现有设计系统、页面结构和组件
  - 响应式、可访问性和交互约束
- 目标：
  - 定义页面入口、路由、表格、表单、按钮、状态、校验和错误提示
- 输出：
  - UI / 交互方案
  - 组件拆分建议
  - 状态和错误处理说明
  - 响应式和可访问性检查点
  - 接口字段映射，如涉及
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 视觉、交互、用户路径或字段映射有取舍时需要确认

---

### 3. `api-designer` 接口依赖确认

- 使用：
  - `api-designer`
- 输入：
  - 前端数据需求
  - 现有 API 调用方式
  - 字段来源和兼容性要求
- 目标：
  - 确认复用现有接口还是需要后端变更
- 输出：
  - 可复用接口结论
  - 字段契约说明
  - 是否需要后端改动
  - 前端 mock 或降级方案，如允许
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 发现接口缺失或需要后端改动时必须确认，并建议改为 `fullstack-feature`

---

### 4. `superpowers:writing-plans`

- 使用：
  - `superpowers:writing-plans`
- 输入：
  - 已确认的 UI 方案
  - 接口依赖确认结果
  - 项目前端构建和测试约束
- 目标：
  - 生成前端文件级实现计划和验证计划
- 输出：
  - 修改文件清单
  - 组件和状态管理计划
  - 测试计划
  - Playwright 或真实浏览器验证路径
  - 风险和回滚方案
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 是，计划确认前不得写代码

---

### 5. `superpowers:executing-plans` with TDD / regression test

- 使用：
  - `superpowers:executing-plans`
  - `frontend-developer`
- 输入：
  - 已确认的 writing-plans
  - UI / 交互方案
  - 测试和浏览器验证计划
- 目标：
  - 使用 `frontend-developer` 实现
  - 先补必要测试或回归用例，再实现
  - 保持最小改动
- 输出：
  - 前端实现
  - 新增或调整的测试
  - 实际修改文件
  - 初步验证结果
  - 子代理交接报告，如使用 subagent
- 是否允许改代码：
  - 是，仅限用户确认后的计划范围
- 是否需要用户确认：
  - 执行前必须已经确认 writing-plans；偏离计划时需要再次确认

---

### 6. `ui-ux-pro-max` / `reviewer` 前端审查

- 使用：
  - `ui-ux-pro-max`
  - `reviewer`
- 输入：
  - 当前 diff
  - UI / 交互方案
  - 测试和浏览器验证结果
- 目标：
  - 审查交互、状态、校验、接口调用、错误提示、权限展示、响应式和可访问性
- 输出：
  - UI/UX 审查结论
  - 通用代码审查结论
  - 必须修复项
- 是否允许改代码：
  - 审查阶段不改代码；不通过则回到 executing-plans 修改
- 是否需要用户确认：
  - 涉及范围扩大或交互取舍时需要确认

---

### 7. 构建测试 / Playwright

- 使用：
  - 项目前端测试命令
  - `playwright-local-runtime`
  - `superpowers:verification-before-completion`
- 输入：
  - 修改后的前端代码
  - 验证路径
  - 审查修复结果
- 目标：
  - 执行项目构建、lint、类型检查或组件测试
  - 涉及关键页面时使用 Playwright 或真实浏览器验证
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
  - 测试和浏览器验证结果
  - 审查结果
- 目标：
  - 汇总前端交付内容和用户验收路径
- 输出：
  - 页面清单
  - 修改文件
  - 测试结果
  - 浏览器验证结果
  - 已知风险
  - 未完成项
  - 后续建议
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 是
