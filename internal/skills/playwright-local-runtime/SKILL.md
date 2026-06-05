---
name: playwright-local-runtime
description: Use when running Playwright in Windows Codex environments, especially when projects switch Node versions, Playwright MCP hits permission errors, PowerShell npm or npx shims are blocked, or browser, cache, profile, and output paths must be pinned to writable local directories.
---

# Playwright Local Runtime

## Overview

这是一个 Windows Codex 环境下的 Playwright 本地运行模板。核心原则：项目命令优先跟随项目自己的 Node 环境；一旦涉及 Playwright 兼容性、MCP 权限、本机浏览器路径或缓存目录问题，就切到一套明确、可写、可替换的本机运行链路。

## When to Use

在以下场景使用本 skill：

- 项目会在 Node 14、Node 18、Node 22 或其他版本之间切换。
- Playwright MCP 报 `EPERM`、`.playwright-mcp`、`permission denied`、默认目录不可写等错误。
- `npm.ps1` / `npx.ps1` 因 PowerShell 执行策略被拦截。
- 需要固定浏览器缓存、输出目录、用户目录，避免写到项目根目录或不可写目录。
- 需要判断当前应直接用项目自己的 Playwright，还是改用独立 Node 22 运行时。

如果只是普通 Node 18+ / Node 22 项目，项目内 Playwright 依赖和脚本都正常，且没有本机权限问题，可以直接使用项目自己的命令，不必套完整本机链路。

## Path Placeholders

本 skill 不保存作者机器的真实路径。使用前先把以下占位符替换成本机可用路径：

- `<CHROME_EXE_PATH>`：Google Chrome 可执行文件路径。
- `<WRITABLE_TEMP_ROOT>`：Codex/Playwright 专用可写临时根目录。
- `<PLAYWRIGHT_OUTPUT_DIR>`：Playwright 输出目录。
- `<PLAYWRIGHT_PROFILE_DIR>`：Playwright 用户数据目录。
- `<NPM_CACHE_DIR>`：npm / npx 缓存目录。
- `<PLAYWRIGHT_BROWSERS_DIR>`：Playwright 浏览器缓存目录。
- `<NODE22_DIR>`：独立 Node 22 安装目录。
- `<NODE22_EXE>`：独立 Node 22 的 `node.exe` 路径。
- `<NPX_CLI_JS>`：独立 Node 22 对应 npm 包内的 `npx-cli.js` 路径。
- `<PLAYWRIGHT_MCP_WRAPPER>`：本机 Playwright MCP wrapper 脚本路径。
- `<UNSAFE_SYSTEM_DIR>`：不可作为输出目录的系统目录，用于提醒不要写入系统路径。

不要依赖默认 `.playwright-mcp` 目录，也不要把输出、profile、缓存写到 `<UNSAFE_SYSTEM_DIR>`、项目根目录或受限安装目录。

## Decision Rules

### 1. 先判断项目自身环境

优先查看：

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
$env:PATH = '<NODE22_DIR>;' + $env:PATH
$env:npm_config_cache = '<NPM_CACHE_DIR>'
$env:PLAYWRIGHT_BROWSERS_PATH = '<PLAYWRIGHT_BROWSERS_DIR>'
```

关键点：即使显式用 Node 22 启动 `npx-cli.js`，`npx` 的派生命令仍可能通过 `PATH` 找到低版本 Node，所以必须把 `<NODE22_DIR>` 放到当前命令的 `PATH` 最前面。

### 独立 Node 22 CLI 方式

```powershell
$env:PATH = '<NODE22_DIR>;' + $env:PATH
$env:npm_config_cache = '<NPM_CACHE_DIR>'
$env:PLAYWRIGHT_BROWSERS_PATH = '<PLAYWRIGHT_BROWSERS_DIR>'
& '<NODE22_EXE>' '<NPX_CLI_JS>' -y playwright --version
```

其他 Playwright CLI 命令沿用同样的环境变量，只替换最后的 Playwright 参数。

### Playwright MCP 方式

Codex 的 Playwright MCP 建议通过 wrapper 启动，`config.toml` 模板如下：

```toml
[mcp_servers.playwright]
command = "<NODE22_EXE>"
args = ["<PLAYWRIGHT_MCP_WRAPPER>"]

[mcp_servers.playwright.env]
npm_config_cache = "<NPM_CACHE_DIR>"
PLAYWRIGHT_BROWSERS_PATH = "<PLAYWRIGHT_BROWSERS_DIR>"
```

`<PLAYWRIGHT_MCP_WRAPPER>` 负责：

- 固定 `<CHROME_EXE_PATH>`。
- 固定 `<PLAYWRIGHT_OUTPUT_DIR>` 和 `<PLAYWRIGHT_PROFILE_DIR>`。
- 固定 `<NPM_CACHE_DIR>` 和 `<PLAYWRIGHT_BROWSERS_DIR>`。
- 把 `<NODE22_DIR>` 放到子进程 `PATH` 最前面。

修改 `config.toml` 后，需要重启 Codex，当前会话不会热加载新的 MCP 配置。

## Login State Notes

- Playwright 默认不会直接接管平时普通打开的 Chrome 窗口。
- 最稳的方式是复用固定用户目录：`<PLAYWRIGHT_PROFILE_DIR>`。
- 如果一定要接管已启动浏览器，需要远程调试端口或 MCP Bridge 扩展；普通已打开的 Chrome 通常不能直接附着。

## Common Mistakes

- 直接用 PowerShell 的 `npm` / `npx`，命中 `npm.ps1` / `npx.ps1` 后被执行策略拦截。
- 没有固定输出目录和用户目录，导致 Playwright 默认写到 `.playwright-mcp` 或不可写路径。
- 只显式运行 `<NODE22_EXE> <NPX_CLI_JS>`，但没有把 `<NODE22_DIR>` 放到 `PATH` 最前面，导致 `npx` 派生进程仍可能误用低版本 Node。
- 把本机运行手册塞进 AGENTS.md，导致 AGENTS 越写越像排障文档；本机细节应放在私有配置或本 internal skill 中。

## Quick Reference

- 项目 Node 18+ / 22 且依赖正常：直接用项目自己的 Playwright。
- 项目 Node 14、版本不明确，或有本机兼容性问题：切到独立 Node 22 运行时。
- MCP 权限问题优先检查：是否固定了输出目录、用户目录、npm cache、browser cache。
- PowerShell 下优先使用 `npm.cmd` / `npx.cmd`，或直接使用 `<NODE22_EXE> <NPX_CLI_JS>`。
