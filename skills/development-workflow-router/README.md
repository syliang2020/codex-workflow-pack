# development-workflow-router

`development-workflow-router` 是一个 Codex 开发流程路由 skill，用于在编码前判断任务类型、选择工作模式，并把需求路由到合适的 superpowers、协作文档、后端设计门禁、子代理和测试验证流程。

它不是具体实现型 skill，而是“流程总控”。真正的阶段顺序来自 `references/workflows/*.md`。

## 适用场景

- 不确定一个需求应该走后端、前端还是全栈流程。
- 希望 Codex 在写代码前先判断任务类型和影响范围。
- 希望使用 superpowers 流程开发，但不想每次写很长提示词。
- 需要把 `feature-doc-pack`、`backend-feature-design-review`、`writing-plans`、`executing-plans` 和 subagents 串起来。
- 需要生成一份可复制给 Codex 的 superpowers workflow prompt。
- 只想做代码审查，不希望 Codex 修改文件。
- 需要分析 Superpowers 会话中的重复工作、技能未触发或成本异常。

## Workflow 单一来源

`references/workflows/*.md` 是唯一流程来源。每个 workflow 阶段都写清：

- 使用的 skill / subagent
- 输入
- 输出
- 是否允许改代码
- 是否需要用户确认

`SKILL.md`、mode 文档、routing 文档和 handoff 文档只说明如何选择模式、如何执行阶段、如何生成 prompt、如何路由和交接，不重复维护另一套流程。

## 工作模式

### direct-flow

当前会话执行模式。

Codex 会先判断任务类型和置信度，然后读取对应 workflow，并使用和 prompt-preview 生成的 workflow prompt 同一套流程结构直接执行：

```text
任务分类 -> 总闸门 -> Workflow 阶段 -> 本次需求特殊要求 -> 验收输出要求
```

第一个实际阶段规则：

- feature 类任务进入 `superpowers:brainstorming`
- bugfix 类任务进入 `bug-reproduce` / `superpowers:systematic-debugging`

direct-flow 不生成完整提示词，也不只输出流程卡片。它和 prompt-preview 的区别只是是否输出可复制提示词：prompt-preview 只生成提示词，direct-flow 在当前会话里按同一套阶段执行。每个阶段结束后输出阶段产物，仅在该阶段需要确认时等待；落盘计划和执行方式确认前不写代码。

执行方式与子代理授权分别确定：`inline` 使用 `executing-plans`，由主 agent 实现；`subagent-driven` 使用 `subagent-driven-development`，由已获授权的专业子代理实现。用户已有选择时沿用；不因角色或工具可用而自动获准派发。项目 `AGENTS.md` 比全局规则更严格时，继续遵守项目限制。

### prompt-preview

提示词预览模式。

只生成完整可复制的 superpowers workflow prompt，不修改代码、不执行命令、不启动子代理。

prompt-preview 会读取对应 workflow，并把该 workflow 转换成可复制提示词。生成的提示词不得要求下一轮再次调用 `development-workflow-router`，而应直接要求使用 superpowers 按阶段执行。

默认输出中等长度的 workflow prompt，不单独生成【Skill / Subagent 路由】章节；每个阶段在“使用”字段中说明本阶段使用的 skill / subagent。只有用户明确要求完整清单时，才额外展开独立路由章节。

### review-only

只做只读审查，不进入实现流程。

适合“先看问题”“只 review，不修改代码”“帮我审查这次改动”这类请求。

该模式不自动授予只读子代理权限；没有授权时由主 agent 只读审查，并如实注明执行者。

### session-diagnosis

将会话层面的重复执行、忽略计划、技能未触发或成本异常交给 `superpowers:diagnosing-superpowers`。不归入业务开发六分类，不自动修改项目或配置；分析子代理、导出诊断包和创建 issue 分别遵守授权边界。

## 与 Superpowers 7.x 的交接

具体约定见 [Superpowers 兼容约定](references/superpowers-compatibility.md)。router 维护执行分流、专业门禁和收尾边界，上游负责计划格式、任务循环和运行台账。

- 实现结束后回到 router 的编码后审查阶段，执行一次最终通用审查，专业检查并入同一输入；已有等价证据复用。
- 联调、测试后的新代码补审及回归，全部验收证据齐备后才进入分支收尾。
- 本次新增或扩大的真实缺陷必须修复，不能因 Minor 标签延后；删除临时目录和台账前继续遵守 `AGENTS.md` 的确认要求。
- 协作文档包继续先判断、先询问；设计、计划与协作文档优先复用已有输入，用户明确拒绝落盘时不绕过其选择。
- 工具参数以当前 schema、角色配置和可用模型为准，不修改上游源码或本机默认配置。

## 任务分类

进入业务开发流程时分为以下 6 类；review-only 和 session-diagnosis 独立处理：

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

复杂后端功能通常走：

```text
superpowers:brainstorming
-> api-designer / sql-pro
-> backend-feature-design-review（编码前设计门禁）
-> superpowers:writing-plans
-> 已确认执行器（inline / subagent-driven）with TDD
-> backend-feature-design-review / reviewer（编码后代码审查）
-> tests
-> acceptance
```

全栈功能通常走：

```text
superpowers:brainstorming
-> api-designer / sql-pro / ui-designer
-> backend-feature-design-review / ui-ux-pro-max
-> superpowers:writing-plans
-> 已确认执行器（inline / subagent-driven）with TDD
-> code review
-> integration
-> Playwright / browser test
-> acceptance
```

Bugfix 通常走：

```text
bug-reproduce / superpowers:systematic-debugging
-> root cause
-> fix design
-> superpowers:writing-plans
-> 已确认执行器（inline / subagent-driven）with bugfix TDD
-> code review
-> regression tests / Playwright
-> acceptance
```

bugfix 不默认先 brainstorming；bugfix 默认先 systematic-debugging，在所选执行器中执行 bugfix TDD：先写失败回归测试证明 bug 存在，再最小修复，再验证测试通过。

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
按 development-workflow-router 处理这个需求，并在当前会话继续开发。确认计划前不要写代码。
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
    superpowers-compatibility.md
    checklists/
    workflows/
```

## 设计边界

- 不固化项目专属路径、端口、数据库连接、表名前缀或业务字段。
- 不替代具体实现 skill；它只负责选择流程和路由。
- prompt-preview 模式不执行任何操作，只生成 superpowers workflow prompt。
- review-only 模式不修改文件。
