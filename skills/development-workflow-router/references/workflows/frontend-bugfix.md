# Frontend Bugfix Workflow

适用于 bug 根因主要在前端的修复。如果问题依赖后端接口、字段、权限或数据口径变化，必须重新分类为 `fullstack-bugfix`。

执行分流、授权、专业门禁与最终收尾遵守 [Superpowers 兼容约定](../superpowers-compatibility.md)。

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
  - `superpowers:brainstorming`（修复会改变业务规则、扩大范围、影响公共工具或变成 feature 时）
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
  - execution_mode、子代理授权依据、设计来源和落盘计划路径
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 是，确认落盘计划及执行方式后才实现；已有执行方式选择时沿用

---

### 5. 按已确认执行方式实现（bugfix TDD）

- 使用：
  - `superpowers:executing-plans`（execution_mode=inline，主 agent 实现）
  - `superpowers:subagent-driven-development`（execution_mode=subagent-driven，已获子代理授权）
  - `superpowers:test-driven-development`
  - `frontend-developer`（仅 subagent-driven 且已获授权时启动；inline 由主 agent 承担前端实现职责）
  - `ui-fixer`（仅 subagent-driven、已获授权且任务限于 UI 修复时启动）
- 输入：
  - 已确认的 execution_mode、子代理授权依据和适用 AGENTS.md
  - 已确认的修复计划
  - 回归测试计划
  - 可修改范围
- 目标：
  - 由主 agent 或已授权的前端实现角色按确认方式修复
  - 必须先补失败单测、组件测试、E2E 脚本或可重复浏览器验证脚本，证明当前前端 bug 存在
  - 必须确认该测试或验证脚本在修复前失败
  - 再做最小前端修复
  - 重新运行测试或浏览器验证，确认通过
  - 如果项目没有可用自动化测试条件，必须说明原因、可重复的最小复现步骤、替代验证路径和风险
  - 不得把未运行的测试或验证标记为 `passed`
  - 不做无关重构
  - 本阶段仅执行实现与任务检查，最终通用审查和 Finish 交回 router 后续阶段
- 输出：
  - 前端修复
  - 修复前失败、修复后通过的回归测试或验证脚本
  - 实际修改文件
  - 初步验证结果
  - 无法自动化测试时的原因、可重复的最小复现步骤、替代验证路径和风险，如适用
  - 实现及验证证据、当前计划的 workspace / 台账路径；实际委派时附子代理交接报告
- 是否允许改代码：
  - 是，仅限用户确认后的计划范围
- 是否需要用户确认：
  - 执行前确认落盘计划和 execution_mode；范围、契约、业务语义或授权变化时再次确认，已授权范围内的实现细节记录裁决后继续

---

### 6. `ui-ux-pro-max` / `reviewer`

- 使用：
  - `ui-ux-pro-max`
  - 所选执行器的最终通用审查：获准时由只读 `reviewer` 执行，否则主 agent 自查并注明限制；复用等价审查证据
- 输入：
  - 当前 diff
  - 根因和修复方案
  - 回归测试或浏览器验证计划
- 目标：
  - 审查修复是否最小，是否引入 UI/UX 或交互风险
  - 专业检查纳入同一审查输入；本次新增或扩大的真实缺陷必须修复，包括 Minor 缺陷
- 输出：
  - UI/UX 审查结论
  - 通用代码审查结论
  - 必须修复项
- 是否允许改代码：
  - 审查阶段不改代码；不通过则返回已确认的执行阶段修改
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
  - failed 且确认是本次改动导致时，返回已确认的执行阶段修复
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
  - 核对最终版本的专业门禁、审查和验证证据；后续代码修改必须已补审和回归
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
  - 执行方式、审查执行者、执行裁决及保留的 workspace / 台账路径
  - 全部验收证据齐备后才进入分支收尾；删除临时产物先遵守 AGENTS.md 的确认规则
- 是否允许改代码：
  - 否
- 是否需要用户确认：
  - 是
