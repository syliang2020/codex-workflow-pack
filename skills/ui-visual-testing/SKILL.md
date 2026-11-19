---
name: ui-visual-testing
description: Use when checking frontend page layout, spacing, overlap, clipping, overflow, visual consistency, or layout shifts during real browser interactions. Not for business functional acceptance, API or database testing, or backend-only tasks.
---

# 页面视觉测试

检查页面的静态视觉和交互过程稳定性，输出可复核的证据与报告。这个 skill 不判定业务功能、接口、权限或数据库是否正确。

## 先做路由判断

只读取当前任务需要的 reference：

| 当前需要 | 读取 |
| --- | --- |
| 确定页面、状态、窗口和参照范围 | [范围与页面状态](references/scope-and-states.md) |
| 检查布局、间距、遮挡、溢出或动态视觉 | [视觉与交互检查](references/visual-and-interaction.md) |
| 实际执行、判定、缺陷、复测或报告 | [执行与证据](references/execution-and-evidence.md) 和 [报告模板](references/report-template.md) |
| 需要客观扫描或回归自动化 | [自动化扫描](references/automated-scan.md)；需要截图基线或 CI 时再读取 [基线与 CI](references/baselines-and-ci.md) |
| 视觉问题原因不清 | `superpowers:systematic-debugging`，再回到当前检查 |
| UI 规范或视觉取舍不明确 | `ui-ux-pro-max`；项目规范和同类组件优先 |
| Windows 本机 Playwright / MCP 运行问题 | `playwright-local-runtime` |

不要因为 skill 被触发就读取全部 reference。没有实际执行测试时，不读取报告模板、自动化扫描或基线资料，也不生成执行报告。

## 核心边界

- 页面地址和账号只能支持探索、操作冒烟和客观视觉检查；操作成功不能推导业务功能正确。
- 视觉预期优先来自设计稿、项目规范、公共组件或可靠的同类页面。没有参照时记录限制，不凭审美猜测标准。
- 点击、查询、展开、提交等动作只用于触发被测视觉状态；真实写入、删除和其他副作用须另有授权。
- 只测试时报告缺陷，不修改业务代码。获准修复后交给 `ui-fixer` 或 `frontend-developer`，再复测最终版本。
- 合法浮层、内部滚动和明确的文本省略不自动算缺陷；关键内容遮挡、非预期裁切、溢出和异常跳动按实际影响判断。
- 每次实际执行或受阻停止都保存本次 `REPORT.md`；报告和证据不覆盖旧运行。自动化回归脚本按需且获准后才创建。

## 最小执行流程

1. 读取范围 reference，确认页面、状态、参照、窗口和可逆操作。
2. 读取视觉 reference，执行静态检查和真实交互过程检查。
3. 读取执行与证据 reference，分别判定静态视觉和交互过程。
4. 读取报告模板，保存 `REPORT.md`、截图和必要的过程证据。
5. 核对报告、证据链接、脱敏和未覆盖项，最终回复提供报告链接。

功能验收需要独立的需求、规则和预期，不由本 skill 承担。可重复运行的测试脚本、像素基线和 fixture 只有在用户授权且确有需要时才创建。
