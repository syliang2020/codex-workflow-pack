# backend-feature-design-review

`backend-feature-design-review` 是一个后端功能设计与代码审查门禁 skill。它用于在后端编码前或代码 review 时，检查数据模型、命名、分层、校验、事务、重复流程、历史数据兼容和测试风险。

这个 skill 来自一次后端功能开发复盘：功能能跑通并不代表设计合理。字段语义混用、表名和 Service 命名不一致、save/update 重复、校验散落在多个层里，都会在后续维护中增加复杂度。

## 适用场景

- 新增或修改数据库表、字段、索引、字典映射、历史数据兼容。
- 新增或修改 API 契约、请求字段、响应字段、校验规则。
- 开发保存、编辑、删除、发布、导入、附件绑定等后端流程。
- 需要判断 Controller、Service、DAO/Mapper/Repository 的分层是否合理。
- save/update/delete/import 等方法出现重复编排，需要判断哪些步骤值得复用。
- 存在循环查库、内存补齐展示字段、手写分页或难以维护的 SQL。
- 想在编码前做后端设计门禁，避免后期返工。
- 只想做后端代码审查，不修改文件。

## 核心检查项

- 数据模型：一个字段只表达一种含义，区分 ID、名称快照、展示路径、自定义输入、派生值和搜索 token。
- 命名一致性：表、Entity/DO/PO、Service、Controller、DTO/VO、DAO/Mapper、Converter、Validator 等表达同一业务域。
- 阻塞分层：Controller/Api 只依赖 Service；业务查询默认经 Service 收口；DAO/Mapper 结果不能直接透传到入口层。
- 可读性与复用：保持主流程直观，只抽取有明确职责或稳定复用价值的部分，不默认新增上下文对象、构建器或通用框架。
- 数据访问：MyBatis 自定义 SQL 写在对应 XML 中；关联字段优先联表读取，避免循环查库、重复查询和内存补齐。
- 分页：复用项目分页插件和返回模式，不自行实现内存分页，不擅自增加分页上限。
- 校验依据：以已确认需求和项目规则为准，不擅自增加业务限制、过滤条件或前置依赖。
- 注释与组织：Java 使用中文多行 Javadoc，常量、属性、依赖和方法位置规整。
- 校验分层：DTO/Request 做基础结构校验，Validator/Rules/Policy 做可复用业务规则，Service 负责编排。
- 事务一致性：明确事务边界，识别外部调用、文件、缓存、消息等无法随数据库回滚的操作。
- 兼容性：检查历史数据、迁移、回填、回滚、旧前端 payload、读写展示和删除行为。
- 测试：关键业务流程需要行为测试，不能只靠源码字符串断言；页面验收还需真实浏览器证据，动态视觉问题检查交互过程。

## 工作模式

### 设计门禁

用于编码前。Codex 先输出设计审查、风险、必要复用和待确认问题，等待用户确认后才进入实现。已有确认不重复询问同一范围，新增业务取舍再澄清。

### 只读审查

用于已写代码的 review。Codex 不修改文件，按严重程度输出 findings，并区分：

- 已存在历史问题
- 本次新增问题
- 本次修改扩大了历史问题

本次新增或扩大的问题不能标成历史遗留。

## 推荐搭配

- `development-workflow-router`：负责在复杂需求里决定什么时候调用本 skill。
- `feature-doc-pack`：负责协作文档，不替代后端设计审查。
- `superpowers:writing-plans`：设计确认后生成实现计划。
- `reviewer` subagent：可用于 PR 风格代码审查。
- `spring-boot-engineer` subagent：可用于 Spring Boot 后端实现。
- `api-designer` 和 `sql-pro` subagents：可分别处理接口契约和 SQL/数据库草案。

## 安装方式

Windows:

```powershell
Copy-Item -Recurse -Force .\skills\backend-feature-design-review "$env:USERPROFILE\.codex\skills\backend-feature-design-review"
```

macOS / Linux:

```bash
cp -R skills/backend-feature-design-review ~/.codex/skills/backend-feature-design-review
```

## 示例提示词

```text
使用 backend-feature-design-review，先审查这个后端功能设计，确认前不要写代码。
```

```text
帮我 review 这次后端代码，只做审查，不修改文件。
```

```text
这个接口涉及新增字段、保存和编辑流程，先做后端设计门禁。
```

## 目录结构

```text
backend-feature-design-review/
  SKILL.md
  agents/
    openai.yaml
  references/
    api-and-validation.md
    data-model.md
    data-access.md
    naming-and-layering.md
    service-flow.md
    test-and-delivery.md
```

## 设计边界

- 不绑定某个具体项目、表名、字段名或业务类型。
- 不替代具体编码实现。
- review-only 请求下不修改文件。
- 如果项目 `AGENTS.md` 有更具体分层或命名规则，以项目规则为准。
