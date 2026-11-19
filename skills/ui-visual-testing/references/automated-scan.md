# 自动化扫描

读取时机：用户明确要求自动化扫描、可重复回归、客观溢出检查或脚本化证据时读取。

## 工具

仓库内提供 `scripts/visual-scan.cjs`。它只依赖调用项目已经安装的 `playwright` 或 `@playwright/test`，不会自动安装依赖。运行方式：

```powershell
node skills/ui-visual-testing/scripts/visual-scan.cjs --url http://localhost:3000 --out .tmp/visual-scan.json
```

常用参数：

- `--url <url>`：必填，页面地址。
- `--out <file>`：必填，JSON 结果路径；父目录不存在时创建。
- `--viewport <width>x<height>`：可重复指定，默认 `1280x720`。
- `--wait-ms <n>`：页面稳定等待时间，默认 500。
- `--sample-ms <n>`：关键元素位置采样时长，默认 1000；设为 0 可跳过。
- `--critical <selector>`：关键元素选择器，可重复指定；检查可见性、是否在视口内及中心点是否被其他元素覆盖。
- `--ignore-overflow <selector>`：允许内部横向滚动的容器，可重复指定。

脚本输出 `status`、`url`、viewport、horizontal overflow、critical element findings、overflow candidates、position samples、error 和 `notRunReason`。扫描发现是证据和候选，不自动等于视觉缺陷：合法浮层、固定列、内部滚动和应用专属层级要回到页面规范与人工复核。

`status` 的含义：`passed-candidates` 表示脚本没有发现客观候选，不等于完整视觉通过；`review-required` 表示存在候选，需要人工复核；`not-run` 表示环境或参数阻塞。无论哪种状态，都要把 JSON 结果链接到 `REPORT.md`。

## 判定边界

- 页面横向溢出和关键元素被遮挡属于高价值客观信号，但脚本只报告选择器与几何信息，不擅自修复。
- 通用元素两两相交会产生误报，脚本只对 `--critical` 元素检查覆盖，并把其他相交标为候选。
- 位置采样用于发现过程位移，不等同于 CLS；采样结束后仍需结合用户动作判断是否是预期动画。
- Playwright 不可用、页面不可访问或参数不足时输出 `status: not-run` 和原因，不生成 `passed`。
- 结果文件是执行证据，仍需按 `execution-and-evidence.md` 生成 `REPORT.md`，链接结果 JSON 和截图。
