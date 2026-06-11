# development-workflow-router

`development-workflow-router` 是一个 Codex 开发流程路由 skill，用于在编码前判断任务类型、选择工作模式，并把需求路由到合适的 superpowers、协作文档、后端设计门禁、子代理和测试验证流程。

它不是具体实现型 skill，而是“流程总控”。真正的阶段顺序来自 `references/workflows/*.md`。

## 适用场景

- 不确定一个需求应该走后端、前端还是全栈流程。
- 希望 Codex 在写代码前先判断任务类型和影响范围。
- 希望使用 superpowers 流程开发，但不想每次写很长提示词。
- 需要把 `feature-doc-pack`、`backend-feature-design-review`、`writing-plans`、`executing-plans` 和 subagents 串起来。
- 需要生成一份可复制给 Codex 的完整 superpowers workflow prompt。
- 只想做代码审查，不希望 Codex 修改文件。

## Workflow 单一来源

`references/workflows/*.md` 是唯一流程来源。每个 workflow 阶段都写清：

- 使用的 skill / subagent
- 输入
- 输出
- 是否允许改代码
- 是否需要用户确认

`SKILL.md`、mode 文档、routing 文档和 handoff 文档只说明如何选择模式、如何执行阶段、如何生成 prompt、如何路由和交接，不再重复维护另一套流程。

## 工作模式

### direct-flow

当前会话执行模式。Codex 会判断任务类型，读取对应 workflow，并直接进入第一个实际阶段。

- feature / 行为变更从 `superpowers:brainstorming` 开始。
- bugfix 从 bug-reproduce / `superpowers:systematic-debugging` 开始。
- 阶段要求的 skill 必须实际读取并执行。
- 阶段要求的 subagent 必须真实启动并交接；不可用时由主 Codex 按同等职责替代并说明。
- `writing-plans` 未经用户确认前，不进入 `executing-plans`，不修改代码。

### prompt-preview

默认模式。只生成完整可复制的 superpowers workflow prompt，不修改代码、不执行命令、不启动子代理。

生成的提示词必须用于驱动下一轮 Codex 按阶段执行，不能直接开始改代码。提示词必须以：

```text
请使用 superpowers 完成本次开发。你现在拿到的是 superpowers workflow prompt，不是直接实现提示词。
```

开头，并且不得要求下一轮再调用 `development-workflow-router`。

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

当用户同时提到前端和后端、接口和页面、页面调用新接口、字段需要前端展示，或 bug 涉及页面与接口联调时，默认走 fullstack 流程。

## 典型流程

复杂功能开发通常走：

```text
superpowers:brainstorming
-> feature-doc-pack（需要协作文档时先询问）
-> 数据库 / 接口 / UI 设计
-> backend-feature-design-review（涉及复杂后端设计时）
-> superpowers:writing-plans
-> 用户确认
-> superpowers:executing-plans with TDD
-> subagent handoff
-> code review
-> tests / Playwright
-> verification-before-completion
-> acceptance
```

Bugfix 通常走：

```text
bug-reproduce / superpowers:systematic-debugging
-> 根因定位
-> 修复方案设计
-> superpowers:writing-plans
-> 用户确认
-> superpowers:executing-plans with TDD
-> subagent handoff
-> code review
-> regression tests / Playwright
-> acceptance
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
按 development-workflow-router 处理这个需求，先生成完整 superpowers workflow prompt，我检查后再执行。
```

```text
按 development-workflow-router 处理这个需求，并在当前会话继续开发。先判断任务类型，确认计划前不要写代码。
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
- prompt-preview 模式不执行任何操作，只生成 superpowers workflow prompt。
- review-only 模式不修改文件。
