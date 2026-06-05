# codex-workflow-pack

`codex-workflow-pack` 是一组面向 Codex 的开发流程 skills，用于把需求澄清、协作文档、后端设计门禁、计划执行、代码审查和浏览器验证串成可复用的工作流。

本仓库主要使用中文编写，适合中文工程团队或个人开发流程沉淀。

## 包含内容

```text
codex-workflow-pack/
  skills/
    feature-doc-pack/
    development-workflow-router/
    backend-feature-design-review/
  internal/
    skills/
      playwright-local-runtime/
```

### Public skills

- `feature-doc-pack`：生成和维护 feature 级协作文档，包括计划、业务规则、接口契约、任务看板、测试用例和数据库设计草案。详细说明见 [skills/feature-doc-pack/README.md](skills/feature-doc-pack/README.md)。
- `development-workflow-router`：根据后端、前端、全栈 feature/bugfix 判断任务类型，选择 direct-flow、prompt-preview 或 review-only，并路由到合适的 skills/subagents。
- `backend-feature-design-review`：后端功能设计和代码审查门禁，重点检查字段语义、命名一致性、分层、校验、事务、save/update 复用、历史数据兼容和测试。

### Internal skill

- `playwright-local-runtime`：当前作者 Windows Codex 环境的 Playwright 本机运行约定，包含本机路径和 Node/Chrome/缓存目录策略。它保留在 `internal/skills/` 中，适合作为 private/internal 参考，不建议直接作为通用公开模板使用。

## 不包含的外部依赖

本仓库不复制第三方 skills 或 subagents，只说明下载来源：

- 子代理配置：[VoltAgent/awesome-codex-subagents](https://github.com/VoltAgent/awesome-codex-subagents)
- Superpowers skills：[obra/superpowers](https://github.com/obra/superpowers)
- UI/UX skill：[nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)

如果使用 `development-workflow-router` 的完整流程，建议同时安装或配置这些外部能力。没有对应 subagent 时，router 会退回由主 Codex 按相同职责执行。

## 安装方式

将需要的 skill 目录复制到本机 Codex skills 目录。

Windows 示例：

```powershell
Copy-Item -Recurse -Force .\skills\feature-doc-pack "$env:USERPROFILE\.codex\skills\feature-doc-pack"
Copy-Item -Recurse -Force .\skills\development-workflow-router "$env:USERPROFILE\.codex\skills\development-workflow-router"
Copy-Item -Recurse -Force .\skills\backend-feature-design-review "$env:USERPROFILE\.codex\skills\backend-feature-design-review"
```

如果你确实使用同类 Windows Playwright 环境，可以按需复制 internal skill：

```powershell
Copy-Item -Recurse -Force .\internal\skills\playwright-local-runtime "$env:USERPROFILE\.codex\skills\playwright-local-runtime"
```

macOS / Linux 示例：

```bash
cp -R skills/feature-doc-pack ~/.codex/skills/feature-doc-pack
cp -R skills/development-workflow-router ~/.codex/skills/development-workflow-router
cp -R skills/backend-feature-design-review ~/.codex/skills/backend-feature-design-review
```

## 推荐使用顺序

复杂功能开发：

```text
development-workflow-router
-> superpowers:brainstorming
-> feature-doc-pack（需要协作文档时先询问）
-> backend-feature-design-review（涉及复杂后端设计时）
-> superpowers:writing-plans
-> superpowers:executing-plans / subagent-driven-development
-> reviewer / backend-feature-design-review / ui-ux-pro-max
-> Playwright 或接口/单元测试
-> verification-before-completion
```

只想生成可复制提示词：

```text
按 development-workflow-router 分析这个需求，先不要开发。请生成完整 Codex 开发提示词，我检查后再执行。
```

只做代码审查：

```text
按 development-workflow-router 进入 review-only，只审查当前改动，不修改文件。
```

## 设计边界

- 本仓库只维护作者自建或改造后的 Codex skills。
- 不把 `.codex` 运行态目录、会话、日志、鉴权信息、缓存、worktrees 或项目私有路径放入仓库。
- 不把具体项目的字段名、表名、接口路径、业务枚举、服务名写进通用 skill。
- `internal/` 下内容允许包含作者本机环境约定，使用前应按自己的机器环境修改。

## 仓库结构说明

```text
skills/
  feature-doc-pack/
    SKILL.md
    references/
    examples/
  development-workflow-router/
    SKILL.md
    references/
    agents/
  backend-feature-design-review/
    SKILL.md
    references/
    agents/
internal/
  skills/
    playwright-local-runtime/
      SKILL.md
```

## License

See [LICENSE](LICENSE).
