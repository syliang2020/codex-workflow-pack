# development-workflow-router

`development-workflow-router` 是一个 Codex 开发流程路由 skill，用于在编码前判断任务类型、选择工作模式，并把需求路由到合适的 superpowers、协作文档、后端设计门禁、子代理和测试验证流程。

它不是具体实现型 skill，而是“流程总控”。它帮助 Codex 在复杂功能开发或 bug 修复中先做判断，再决定是否进入计划、文档、审查、执行或只读 review。

## 适用场景

- 不确定一个需求应该走后端、前端还是全栈流程。
- 希望 Codex 在写代码前先判断任务类型和影响范围。
- 希望使用 superpowers 流程开发，但不想每次写很长提示词。
- 需要把 `feature-doc-pack`、`backend-feature-design-review`、`writing-plans`、`executing-plans` 和 subagents 串起来。
- 需要生成一份可复制给 Codex 的完整开发提示词。
- 只想做代码审查，不希望 Codex 修改文件。

## 工作模式

### direct-flow

默认模式。Codex 会先输出简短流程卡片，等待用户确认；确认后再读取对应 workflow、checklist，并进入 `writing-plans`。

适合继续在当前会话中推进开发。

### prompt-preview

只生成完整可复制提示词，不修改代码、不执行命令、不启动子代理。

适合你想先检查流程是否完整，再复制提示词重新发送给 Codex。

### review-only

只做只读审查，不进入实现流程。

适合“先看问题”“只 review，不修改代码”“帮我审查这次改动”这类请求。

## 任务分类

这个 skill 会把任务分成 6 类：

- `backend-feature`
- `frontend-feature`
- `fullstack-feature`
- `backend-bugfix`
- `frontend-bugfix`
- `fullstack-bugfix`

同时输出分类置信度：

- `high`：边界明确，可以继续。
- `medium`：有假设，需要用户确认。
- `low`：边界不清，必须先澄清。

## 推荐流程

复杂功能开发通常走：

```text
development-workflow-router
-> superpowers:brainstorming
-> feature-doc-pack（需要协作文档时先询问）
-> backend-feature-design-review（涉及复杂后端设计时）
-> superpowers:writing-plans
-> superpowers:executing-plans / subagent-driven-development
-> code review
-> tests / Playwright
-> verification-before-completion
```

## 依赖和配合

推荐安装或配置：

- `feature-doc-pack`
- `backend-feature-design-review`
- `playwright-local-runtime`，仅当前 Windows Codex 环境需要
- Superpowers skills：[obra/superpowers](https://github.com/obra/superpowers)
- 子代理配置：[VoltAgent/awesome-codex-subagents](https://github.com/VoltAgent/awesome-codex-subagents)
- UI/UX skill：[nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)

如果对应子代理不可用，router 会要求主 Codex 按相同职责继续执行，不会编造子代理结果。

## 安装方式

Windows:

```powershell
Copy-Item -Recurse -Force .\skills\development-workflow-router "$env:USERPROFILE\.codex\skills\development-workflow-router"
```

macOS / Linux:

```bash
cp -R skills/development-workflow-router ~/.codex/skills/development-workflow-router
```

## 示例提示词

```text
按 development-workflow-router 处理这个需求，先判断任务类型，确认计划前不要写代码。
```

```text
按 development-workflow-router 分析这个需求，先不要开发。请生成完整 Codex 开发提示词，我检查后再执行。
```

```text
按 development-workflow-router 进入 review-only，只审查当前改动，不修改文件。
```

## 目录结构

```text
development-workflow-router/
  SKILL.md
  agents/
    openai.yaml
  references/
    agent-skill-routing.md
    mode-direct-flow.md
    mode-prompt-preview.md
    review-and-handoff.md
    checklists/
    workflows/
```

## 设计边界

- 不固化项目专属路径、端口、数据库连接、表名前缀或业务字段。
- 不替代具体实现 skill；它只负责选择流程和路由。
- prompt-preview 模式不执行任何操作。
- review-only 模式不修改文件。
