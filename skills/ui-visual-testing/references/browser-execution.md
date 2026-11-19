# 浏览器选择与派发

读取时机：准备实际浏览器测试或把浏览器操作派发给子代理之前读取；仅讨论或预览流程时无需加载。

## 默认执行顺序

1. **用户指定优先**：指定 Chrome、Edge、Firefox、Safari 或 Codex 内置浏览器等时，使用能控制该实际产品的工具。指定产品不可用时报告阻塞，不擅自替换，也不把 Playwright WebKit 引擎冒充 Safari。用户随后同意替代方案才切换。
2. **未指定时默认 Chrome**：优先通过 Playwright 新开本机 **Google Chrome 可见窗口**。Playwright MCP 可用且已配置 Chrome 时使用 MCP；否则检查项目已有 Playwright CLI / 库，显式使用 `channel: "chrome"`、`headless: false`。不因为 MCP 工具缺失就直接切换 Codex 内置浏览器。
3. Windows 环境执行前读取已安装的 `playwright-local-runtime`，使用其运行时、浏览器路径、专用 profile、输出和缓存约定，不改变全局 Node，不自动安装依赖。新开的是测试会话或专用 profile，不默认接管日常窗口或导入密码、cookies。未指定浏览器且 Playwright 经检查仍不可用时，说明具体阻塞再考虑降级；不得只因已有登录态、工具方便或子代理习惯而静默替换。
4. 用户要求的窗口尺寸通过浏览器 viewport 设置并读取 `innerWidth` / `innerHeight` 验证；Codex 侧栏的宽度不能自动成为被测 viewport。检查滚动条、缩放和设备像素比，不能把窄侧栏引起的换行当作目标桌面页面缺陷。

CI 或用户明确要求无界面测试时，允许显式使用所选浏览器的 headless 模式；本机人工视觉检查默认保留可见窗口。`visual-scan.cjs` 支持 `--browser`，未指定时新开 Chrome；CI 使用 `--headless`，失败时不自动换浏览器。

## 子代理交接

主代理派发 `ui-ux-tester` 时传递：

- 本 skill 的路径、目标页面、参照、状态矩阵和只读边界。
- 用户指定的浏览器；未指定则明确传递“Playwright 新开 Google Chrome 可见窗口”，以及实际可用的 MCP 工具或现有库入口；子代理先核对自己可用工具，不能假设与父代理完全一致。
- 约定 viewport、缩放、测试专用 profile 和证据目录；凭据通过可用的安全登录方式交接，不把它们写入脚本或报告。
- 降级前返回阻塞原因和已尝试入口，由主代理统一说明或接手；禁止父子代理同时操作同一浏览器页面导致尺寸、路由或状态互相覆盖。

主代理回收结果时核对实际浏览器与控制工具、是否 headless、viewport 实测值和证据来源；不能只因子代理返回“真实浏览器”就认定满足 Chrome 要求。

## 报告

在 `REPORT.md` 记录浏览器产品/版本、控制工具（Playwright MCP、CLI/库或内置浏览器）、是否可见窗口、viewport 实测尺寸、缩放或设备像素比。发生降级时列出原入口、具体错误、替代入口和比较限制；无可用浏览器时保留 `not-run`，不声明视觉验收通过。
