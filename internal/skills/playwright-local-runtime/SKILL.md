---
name: playwright-local-runtime
description: Use when running Playwright in this Windows Codex environment, especially when projects switch between Node 14 and Node 22, Playwright MCP hits permission errors, npm or npx PowerShell shims are blocked, or browser, cache, and output paths must be pinned to writable local directories.
---

# Playwright Local Runtime

## Overview

这是当前这台 Windows 机器上的 Playwright 本地运行约定。
核心原则：项目命令尽量跟随项目自身 Node 环境；一旦涉及 Playwright 兼容性、MCP 权限或本机运行差异，就切到固定的本机 Playwright 运行链路。

## When to Use

在以下场景使用本 skill：

- 项目会在 Node 14 和 Node 22 之间切换。
- Playwright MCP 报 `EPERM`、`.playwright-mcp`、`system32`、`permission denied` 一类错误。
- `npm.ps1` / `npx.ps1` 因 PowerShell 执行策略被拦截。
- 需要固定浏览器缓存、输出目录、用户目录，避免写到项目根目录或不可写目录。
- 需要确认当前应该直接用项目自己的 Playwright，还是改用独立 Node 22 运行时。

如果只是普通 Node 22 项目、项目内 Playwright 依赖和脚本都正常，且没有本机权限问题，可以直接用项目自己的命令，不必套这个 skill 的完整本机链路。

## Fixed Local Paths

本机 Playwright 统一固定使用以下路径：

- Chrome 路径：`C:\Program Files\Google\Chrome\Application\chrome.exe`
- Playwright 输出目录：`D:\codex_work\.tmp\playwright-output`
- Playwright 用户目录：`D:\codex_work\.tmp\playwright-profile`
- npm/npx 缓存目录：`D:\codex_work\.tmp\npm-cache`
- Playwright 浏览器缓存目录：`D:\codex_work\.ms-playwright`
- Playwright MCP wrapper：`D:\codex_work\.tmp\playwright_mcp.js`

不要依赖默认 `.playwright-mcp` 目录，也不要把输出目录落到 `C:\WINDOWS\system32`、项目根目录或 `Program Files`。

## Decision Rules

### 1. 先判断项目自身环境

优先看：

- `package.json`
- `engines.node`
- `.nvmrc`
- `.node-version`
- README / AGENTS.md / 启动脚本
- 当前 shell 的 `node -v`、`where node`

### 2. 什么时候直接用项目自己的 Playwright

满足以下条件时，可以直接使用项目自己的命令：

- 当前项目本身使用 Node 18+ / Node 22。
- Playwright 是项目依赖或脚本的一部分。
- 当前没有本机权限问题、PowerShell shim 问题或目录写入问题。

即使直接使用项目自己的 Playwright，只要任务涉及截图、下载、浏览器 profile、输出文件或浏览器缓存，仍应优先显式指定可写目录，避免回落到默认路径。

示例：

```powershell
node -v
npm.cmd run test
npx.cmd playwright test
```

### 3. 什么时候改用独立 Node 22 运行时

遇到以下任一情况时，切到独立 Node 22 运行时：

- 项目固定使用 Node 14 或更低版本。
- 当前 shell 的 Node 版本不足以运行新版 Playwright。
- 当前任务只是临时用 Playwright 自动化浏览器，不应影响项目本身 Node 环境。
- `npx` 派生的包命令可能误用低版本 Node。

## Core Pattern

### 通用临时环境变量

```powershell
$env:PATH = 'D:\Program Files\nvm-setup\nvm\v22.9.0;' + $env:PATH
$env:npm_config_cache = 'D:\codex_work\.tmp\npm-cache'
$env:PLAYWRIGHT_BROWSERS_PATH = 'D:\codex_work\.ms-playwright'
```

关键点：即使显式用 Node 22 启动 `npx-cli.js`，`npx` 的派生进程仍可能通过 `PATH` 找到全局 Node 14，所以必须把 Node 22 目录放到当前命令的 `PATH` 最前面。

### 独立 Node 22 CLI 方式

```powershell
$env:PATH = 'D:\Program Files\nvm-setup\nvm\v22.9.0;' + $env:PATH
$env:npm_config_cache = 'D:\codex_work\.tmp\npm-cache'
$env:PLAYWRIGHT_BROWSERS_PATH = 'D:\codex_work\.ms-playwright'
& 'D:\Program Files\nvm-setup\nvm\v22.9.0\node.exe' 'D:\Program Files\nvm-setup\nvm\v22.9.0\node_modules\npm\bin\npx-cli.js' -y playwright --version
```

其他 Playwright CLI 命令沿用同样的环境变量，只替换最后的 Playwright 参数。

### Playwright MCP 方式

当前本机 Codex 的 Playwright MCP 通过 wrapper 启动，`config.toml` 应保持为：

```toml
[mcp_servers.playwright]
command = "D:\\Program Files\\nvm-setup\\nvm\\v22.9.0\\node.exe"
args = ["D:\\codex_work\\.tmp\\playwright_mcp.js"]

[mcp_servers.playwright.env]
npm_config_cache = "D:\\codex_work\\.tmp\\npm-cache"
PLAYWRIGHT_BROWSERS_PATH = "D:\\codex_work\\.ms-playwright"
```

`playwright_mcp.js` 负责：

- 固定 Chrome 路径
- 固定输出目录和用户目录
- 固定 npm 缓存和浏览器缓存目录
- 把 Node 22 目录放到子进程 `PATH` 最前面

修改 `config.toml` 后，需要重启 Codex，当前会话不会热加载新的 MCP 配置。

## Login State Notes

- Playwright 默认不会直接接管你平时普通打开的 Chrome 窗口。
- 最稳的方式是复用固定用户目录：`D:\codex_work\.tmp\playwright-profile`。
- 如果一定要接管已启动浏览器，需要远程调试端口或 MCP Bridge 扩展；普通已打开的 Chrome 通常不能直接附着。

## Common Mistakes

- 直接用 PowerShell 的 `npm` / `npx`，命中 `npm.ps1` / `npx.ps1` 后被执行策略拦截。
- 没有固定输出目录和用户目录，导致 Playwright 默认写到 `.playwright-mcp` 或不可写路径。
- 明明全局 Node 已切回 14，却以为显式运行 Node 22 的 `npx-cli.js` 就足够；实际上如果不改 `PATH`，`npx` 派生进程仍可能误用 Node 14。
- 把本机运行手册塞回 `AGENTS.md`，导致 AGENTS 越写越像排障文档。

## Quick Reference

- 项目 Node 18+ / 22 且依赖正常：直接用项目自己的 Playwright。
- 项目 Node 14、版本不明确、或有本机兼容性问题：切到独立 Node 22 运行时。
- MCP 权限问题优先检查：是否固定了输出目录、用户目录、npm cache、browser cache。
- PowerShell 下优先使用 `npm.cmd` / `npx.cmd`，或直接使用 Node 22 `node.exe + npx-cli.js`。
