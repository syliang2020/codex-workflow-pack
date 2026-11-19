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
    ui-visual-testing/
  internal/
    skills/
      playwright-local-runtime/
```

### Public skills

- `feature-doc-pack`：生成和维护 feature 级协作文档，包括计划、业务规则、接口契约、任务看板、测试用例和数据库设计草案。详细说明见 [skills/feature-doc-pack/README.md](skills/feature-doc-pack/README.md)。
- `development-workflow-router`：根据后端、前端、全栈 feature/bugfix 判断任务类型，选择 direct-flow、prompt-preview 或 review-only，并路由到合适的 skills/subagents。详细说明见 [skills/development-workflow-router/README.md](skills/development-workflow-router/README.md)。
- `backend-feature-design-review`：后端功能设计和代码审查门禁，重点检查字段语义、命名一致性、分层、校验、事务、save/update 复用、历史数据兼容和测试。详细说明见 [skills/backend-feature-design-review/README.md](skills/backend-feature-design-review/README.md)。
- `ui-visual-testing`：独立执行或接入 router 的页面视觉检查，覆盖布局、样式和交互过程的视觉稳定性；不承担业务功能验收。使用说明见 [skills/ui-visual-testing/SKILL.md](skills/ui-visual-testing/SKILL.md)。
  - 需要自动化扫描时，可按需运行 `skills/ui-visual-testing/scripts/visual-scan.cjs`；它输出溢出、关键元素可见性、遮挡候选和位置采样，不替代人工复核或功能验收。
  - 需要截图基线或 CI 时，再读取 `skills/ui-visual-testing/references/baselines-and-ci.md`；不把通用 skill 绑定到特定项目的 runner 或启动命令。

### Internal skill

- `playwright-local-runtime`：Windows Codex 环境下的 Playwright 本机运行模板，使用占位符描述 Node、Chrome、缓存目录、输出目录、profile 目录和 MCP wrapper 的配置位置。它保留在 `internal/skills/` 中，适合作为 private/internal 参考，不建议直接作为通用公开模板使用。详细说明见 [internal/skills/playwright-local-runtime/README.md](internal/skills/playwright-local-runtime/README.md)。

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
Copy-Item -Recurse -Force .\skills\ui-visual-testing "$env:USERPROFILE\.codex\skills\ui-visual-testing"
```

如果你确实使用同类 Windows Playwright 环境，可以按需复制 internal skill，并在安装后替换全部路径占位符：

```powershell
Copy-Item -Recurse -Force .\internal\skills\playwright-local-runtime "$env:USERPROFILE\.codex\skills\playwright-local-runtime"
```

macOS / Linux 示例：

```bash
cp -R skills/feature-doc-pack ~/.codex/skills/feature-doc-pack
cp -R skills/development-workflow-router ~/.codex/skills/development-workflow-router
cp -R skills/backend-feature-design-review ~/.codex/skills/backend-feature-design-review
cp -R skills/ui-visual-testing ~/.codex/skills/ui-visual-testing
```

## 推荐使用顺序

复杂功能开发：

```text
development-workflow-router
-> superpowers:brainstorming
-> feature-doc-pack（需要协作文档时先询问）
-> backend-feature-design-review（涉及复杂后端设计时，编码前做门禁）
-> superpowers:writing-plans
-> superpowers:executing-plans / subagent-driven-development
-> reviewer / backend-feature-design-review / ui-ux-pro-max
-> Playwright 或接口 / 单元测试
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

独立测试已有页面：

```text
使用 ui-visual-testing 测试指定菜单，以项目现有组件和同类页面为视觉依据。
分别报告静态视觉和交互过程的视觉结论、参照、证据与缺陷；不做业务功能验收，不修改业务代码。
```

每次实际视觉执行默认保存本次 `REPORT.md`，链接截图及必要的过程证据，并在最终回复给出报告链接；未发现缺陷或执行受阻也留下记录，旧运行不覆盖。自动化回归脚本按需生成，不是每次必选产物。预览及明确禁止落盘等例外见 [报告交付约定](skills/ui-visual-testing/references/execution-and-evidence.md#报告交付)。

需要测试策划或自动化实现时，按需配置 `qa-expert` 和 `test-automator`；仍从上方外部子代理来源安装，本仓库不复制其配置。角色不可用时由主 agent 承担职责并说明实际执行者。

## 设计边界

- 本仓库只维护作者自建或改造后的 Codex skills。
- 不把 `.codex` 运行态目录、会话、日志、鉴权信息、缓存、worktrees 或项目私有路径放入仓库。
- 不把具体项目的字段名、表名、接口路径、业务枚举、服务名写进通用 skill。
- `internal/` 下内容允许保留个人环境运行约定，但应使用占位符或模板表达；安装前必须按自己的机器环境配置。

## 仓库结构说明

```text
skills/
  feature-doc-pack/
    SKILL.md
    README.md
    references/
    examples/
  development-workflow-router/
    SKILL.md
    README.md
    references/
    agents/
  backend-feature-design-review/
    SKILL.md
    README.md
    references/
    agents/
internal/
  skills/
    playwright-local-runtime/
      SKILL.md
      README.md
```

## License

See [LICENSE](LICENSE).
