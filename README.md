# feature-doc-pack

> English: A Codex skill for generating traceable feature collaboration docs, including plans, API contracts, business rules, task boards, and test cases.  
> This project is currently written mainly in Chinese for Chinese-speaking engineering teams.

`feature-doc-pack` 是一个用于生成和维护 feature 级协作文档的 Codex skill。

它适合用于需要团队协作的功能切片，尤其是涉及前后端联调、接口变更、字段变更、复杂业务规则、任务分工、进度跟踪或测试覆盖对齐的场景。

这个 skill 的目标不是默认生成一堆看起来完整的文档，而是帮助 AI 编码代理先判断文档是否真的有价值，先询问用户，再生成一组可追踪、可分工、可联调、可验收的协作文档。

## 为什么需要它

很多 AI 生成的项目文档看起来很完整，但团队真正准备开发时仍然会卡住：

- 计划文档只写了要改什么，却没有说明每个开发者具体要做什么。
- API 契约只写了 DTO 或 VO 名称，却没有展开当前接口下的字段、必填和校验差异。
- 业务规则写得太概括，前后端容易各自理解。
- 测试用例不是从业务规则反推出来的。
- 任务看板看不出负责人、依赖、阻塞和进度。
- 文档之间没有追踪关系，一条规则无法追到接口、任务和测试用例。

`feature-doc-pack` 关注的是能服务真实协作的文档，而不是只追求形式完整。

## 四层架构

这个 skill 把协作文档拆成四层，避免把需求澄清、协作事实、技术实现和发布治理混在一起：

- 输入层：承接 PRD、口述需求、截图、聊天记录和待澄清问题。边界不清时先生成 `REQUIREMENTS.md` 草案，并停下来等待确认。
- 协作事实层：承接当前 feature 切片已经确认的目标、规则、接口、任务和测试，即 `PLAN.md`、`BUSINESS-RULES.md`、`API-CONTRACT.md`、`TASK-BOARD.md`、`TEST-CASES.md`。
- 技术设计层：承接需要评审的技术草案，例如涉及数据库变更时的 `DATABASE-DESIGN.md`。它是设计草案，不是默认最终 DDL。
- 变更发布层：承接变更记录、问题跟踪和发布检查，即 `CHANGELOG.md`、`ISSUES.md`、`RELEASE.md`。

## PRD 与 REQUIREMENTS.md

如果项目已经有清晰 PRD、需求文档或任务说明，feature-doc-pack 可以直接按用户选择生成最小、标准或完整文档包。

如果输入只有口述、截图、聊天记录、零散反馈，或者目标、范围、角色、规则、接口、数据边界不清，推荐先使用可选前置模式：只生成 `REQUIREMENTS.md` 草案。`REQUIREMENTS.md` 用于收敛需求事实和待确认问题，不属于最小、标准、完整三档文档包的默认文件清单。

确认 `REQUIREMENTS.md` 后，再进入协作文档包；协作文档完成后，后续实现应交给对应的设计、计划、编码、测试或审查流程。

```mermaid
flowchart LR
  A["PRD / 口述需求 / 截图 / 聊天记录"] --> B{"需求边界清楚吗？"}
  B -->|"不清楚"| C["REQUIREMENTS.md 草案"]
  C --> D["用户确认范围与待确认项"]
  B -->|"清楚"| E["选择文档级别"]
  D --> E
  E --> F["feature-doc-pack 协作文档"]
  F --> G["brainstorming / writing-plans"]
  G --> H["executing-plans / TDD / review"]
```

## 生成哪些文档

这个 skill 支持三个文档级别。

### 可选前置模式

当需求边界不清时，先只生成：

- `REQUIREMENTS.md`

生成后停止，等待用户确认。它不自动触发后续 `PLAN.md`、`API-CONTRACT.md` 或其它文档。

### 最小文档包

适合小范围功能改动或协作复杂度较低的需求。

- `PLAN.md`
- `API-CONTRACT.md`，仅在涉及接口或字段时生成
- `BUSINESS-RULES.md`，仅在业务规则复杂、容易误解、需要共享细则时生成

### 标准文档包

适合前后端联调、多人协作、跨模块改动或中等复杂度功能。

- `PLAN.md`
- `BUSINESS-RULES.md`
- `API-CONTRACT.md`
- `TASK-BOARD.md`
- `TEST-CASES.md`

### 完整文档包

适合高风险交付、跨仓库协作、长周期协作、提测发布或问题追踪场景。

- 标准文档包的全部内容
- `CHANGELOG.md`
- `ISSUES.md`
- `RELEASE.md`
- 可选 `PROGRESS.md`，仅在需要单独进度视图时生成

`DATABASE-DESIGN.md` 不是默认必生成文件。只有在本次需求涉及数据库变更、数据模型、表结构、字段、索引、数据迁移、历史数据兼容或持久化数据结构时，才创建或更新；它在 feature-doc-pack 阶段只作为数据库设计草案，不默认输出最终可执行 DDL。

## 核心原则

- 先询问，再生成协作文档。
- 只为当前 feature 切片生成文档。
- 不默认为整个老项目补齐历史文档。
- 优先更新已有文档，而不是重建。
- `PLAN.md` 是范围基准。
- 详细业务规则写入 `BUSINESS-RULES.md`，不要全部堆到 `PLAN.md`。
- 接口事实、字段语义、请求结构、响应结构和错误场景写入 `API-CONTRACT.md`。
- 任务归属、依赖、阻塞和进度写入 `TASK-BOARD.md`。
- 规则验收、边界场景和联调检查写入 `TEST-CASES.md`。
- 业务规则、接口、任务和测试用例之间应通过可点击编号建立追踪关系。

## 追踪编号模型

推荐使用以下追踪编号：

- `BR-001`：业务规则
- `API-001`：接口契约
- `TASK-FE-001`、`TASK-BE-001`、`TASK-QA-001`：任务包
- `TC-001`：测试用例
- `DB-001`：仅在已确认存在数据库变更文档或迁移文档时使用

关联编号应写成可点击的 Markdown 链接。不要用 `BR-001 到 BR-005` 这类范围写法替代逐条追踪链接。

## API 契约要求

`API-CONTRACT.md` 应让前端和后端开发者不靠猜测就能实现接口。

每个接口建议包含：

- 路径和请求方法
- 接口目的
- 权限或登录假设
- 请求字段，包括类型、是否必填、含义、校验和示例
- 基于当前项目实际响应结构的响应说明
- 当前接口下的字段视图，即使这些字段也存在于共享对象定义中
- 错误场景和业务校验失败场景
- 关联业务规则、开发任务和测试用例

可以维护共享对象定义，但共享对象定义只能作为补充，不能替代每个接口附近的请求和响应字段表。

## 业务规则要求

`BUSINESS-RULES.md` 应详细到让另一个开发者或另一个编码代理可以按文档实现，而不会出现明显理解偏差。

根据具体需求，它应覆盖：

- 页面级规则
- 字段级规则
- 模式或类型差异
- 不同操作下的行为差异
- 状态流转
- 字段显示、隐藏和必填变化
- 前端校验和后端兜底
- 错误提示或失败结果
- 边界场景和不做范围

数据库 DDL、索引、迁移 SQL、回填 SQL 和回滚 SQL 不应放入 `BUSINESS-RULES.md`。

## 任务看板要求

`TASK-BOARD.md` 应支持真实团队分工。

任务应拆成清晰的任务包，并说明：

- 角色或负责人
- 状态
- 范围
- 输入
- 输出
- 依赖
- 阻塞
- 关联业务规则
- 关联接口
- 关联测试用例
- 完成标准

如果实际团队人数或负责人姓名暂时未知，任务包仍然应清楚到可以被后续认领。

## 测试用例要求

`TEST-CASES.md` 应从业务规则和接口契约反推。

每个测试用例建议包含：

- 前置条件
- 操作步骤
- 测试数据
- 期望结果
- 关联业务规则
- 关联接口
- 关联任务

目标不是简单罗列测试点，而是证明关键规则、边界场景和联调链路都有覆盖。

## 适用场景

当一个功能可能涉及以下情况时，可以使用这个 skill：

- 多人协作
- 前后端联调
- 新增接口
- 接口字段变更
- 复杂表单
- 复杂校验
- 多种业务模式
- 状态流转
- 导入、发布、删除、编辑或附件限制
- 多个页面或服务共享同一批业务规则
- 进度跟踪
- 测试和验收对齐

如果只是小 bug 修复、文案调整、样式微调或单点逻辑修复，通常不需要生成协作文档，除非用户明确要求。

## 安装方式

将整个目录放到 Codex skills 目录下：

```text
~/.codex/skills/feature-doc-pack/
```

Windows 环境可以放到：

```text
C:\Users\<you>\.codex\skills\feature-doc-pack\
```

运行时必需文件是：

```text
feature-doc-pack/SKILL.md
```

`references/` 目录存放详细规则，AI 代理会在需要时按场景读取。

## 示例提示词

```text
这个功能涉及前后端联调和多条业务规则，帮我生成标准协作文档包。
```

```text
检查这些 feature 文档，另一个开发者能不能直接按文档开工？
```

```text
这次字段兼容关系有调整，帮我更新 API 契约和测试用例。
```

```text
这是一个老项目，只为本次改动生成最小必要文档。
```

## 仓库结构

```text
feature-doc-pack/
  AGENTS.example.md
  SKILL.md
  README.md
  examples/
    _templates/
      API-CONTRACT.template.md
      BUSINESS-RULES.template.md
      CHANGELOG.template.md
      DATABASE-DESIGN.template.md
      PLAN.template.md
      REQUIREMENTS.template.md
      TASK-BOARD.template.md
      TEST-CASES.template.md
    notification-template-management/
      API-CONTRACT.md
      BUSINESS-RULES.md
      CHANGELOG.md
      DATABASE-DESIGN.md
      PLAN.md
      REQUIREMENTS.md
      TASK-BOARD.md
      TEST-CASES.md
  references/
    api-contract.md
    business-rules.md
    change-management.md
    database-design.md
    doc-levels.md
    quality-gates.md
    requirements-capture.md
    review-checklist.md
    task-board-and-tests.md
```

## 设计边界

这个 skill 应保持项目中立。

它不应包含某个具体项目的字段名、枚举值、表名、接口路径、响应包装对象、产品术语或业务模式。需要示例时，应使用中性占位符，例如：

- `primaryField`
- `legacyField`
- `ExampleVO`
- `table_name.column_name`

具体项目细节应出现在生成后的 feature 文档中，而不是写进这个全局 skill。
