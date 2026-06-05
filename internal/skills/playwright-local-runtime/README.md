# playwright-local-runtime

`playwright-local-runtime` 是一个 internal/private skill，用于记录作者当前 Windows Codex 环境中运行 Playwright 的本机约定。

它包含具体本机路径、Node 版本切换、Chrome 路径、缓存目录和 Playwright MCP wrapper 约定，不建议别人直接原样使用。放在 `internal/skills/` 是为了说明它属于个人环境运行手册，而不是通用公开模板。

## 适用场景

- 当前项目在 Node 14 和 Node 22 之间切换。
- Playwright MCP 报权限问题，例如 `.playwright-mcp`、`system32`、`permission denied`。
- PowerShell 的 `npm.ps1` / `npx.ps1` 被执行策略拦截。
- 临时需要运行 Playwright，但不想改变项目本身 Node 环境。
- 需要固定浏览器缓存、输出目录、用户目录，避免写到项目根目录或不可写目录。

## 主要约定

当前作者机器上固定使用：

- Google Chrome
- 独立 Node 22 运行时
- 可写 Playwright 输出目录
- 可写 npm/npx 缓存目录
- 可写浏览器缓存目录
- Playwright MCP wrapper

这些路径在 `SKILL.md` 中是作者本机路径，使用前必须按你的机器环境修改。

## 为什么放在 internal

这个 skill 不是通用 Playwright 教程，而是作者本机 Codex 环境的运行手册。

公开仓库保留它的原因：

- `development-workflow-router` 会在需要浏览器真实测试时提到它。
- 它能说明本机 Playwright / MCP / Node 切换问题的解决方式。
- 其他人可以参考结构，改成自己的 private runtime skill。

不建议把它当作可直接安装的公共 skill，除非你确认本机路径和运行环境一致。

## 安装方式

如果你确实要使用这份 internal skill，Windows 示例：

```powershell
Copy-Item -Recurse -Force .\internal\skills\playwright-local-runtime "$env:USERPROFILE\.codex\skills\playwright-local-runtime"
```

安装后请先检查并修改：

- Chrome 路径
- Node 22 路径
- npm/npx 缓存目录
- Playwright browser cache
- Playwright output/profile 目录
- MCP wrapper 路径

## 示例提示词

```text
运行 Playwright 前，使用 playwright-local-runtime 检查当前 Windows Codex 环境应该走项目 Node 还是独立 Node 22。
```

```text
Playwright MCP 报权限问题，按 playwright-local-runtime 排查。
```

## 目录结构

```text
playwright-local-runtime/
  SKILL.md
  README.md
```

## 设计边界

- 这是 internal/private 运行约定，不是公共 Playwright 最佳实践。
- 不包含浏览器账号、认证信息、token 或项目业务数据。
- 不应该把它的本机路径直接写进别人的项目 `AGENTS.md`。
- 如果只是普通 Node 22 项目且项目 Playwright 脚本正常，不需要使用完整本机链路。
