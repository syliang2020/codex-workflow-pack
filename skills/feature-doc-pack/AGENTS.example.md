# AGENTS.md 示例

本文件是下游项目可复制使用的示例。复制到具体项目后，请按项目真实技术栈、团队流程和发布要求删改。

## 协作文档策略

- 默认采用“先判断、先询问、再生成”的协作文档策略。
- 小 bug、文案修改、样式微调、单点逻辑修复，通常不主动生成协作文档。
- 涉及多人协作、前后端联调、接口或字段变更、数据库变更、复杂业务规则、复杂校验、复杂统计、删除、编辑、发布、导入、附件、进度跟踪、提测或发布边界时，先询问用户是否需要使用 `feature-doc-pack`。
- 协作文档只服务当前 feature 切片，不为老项目补全历史文档；已有相关文档时优先更新，不重建。

## REQUIREMENTS 前置模式

- 当需求只有口述、截图、聊天记录或边界不清时，先询问是否只生成 `REQUIREMENTS.md` 草案。
- `REQUIREMENTS.md` 只用于收敛需求事实、合理推断和待确认事项。
- 生成 `REQUIREMENTS.md` 后必须停止，等待用户确认；不要自动继续生成开发计划、接口、任务或测试文档。

## 数据库设计门禁

- 涉及新增表、修改表、字段、索引、数据关系、数据迁移、历史数据兼容或持久化统计口径时，必须生成或更新 `DATABASE-DESIGN.md` 草案。
- `DATABASE-DESIGN.md` 在文档阶段是评审草案，不是默认最终 DDL。
- 如果数据库设计未确认，数据库实现、迁移、回填、索引调整和最终 DDL 任务不能标为可直接开工。
- 最终表结构、迁移脚本、回填脚本和回滚脚本由后端负责人在技术设计或实现阶段确认，除非用户明确要求当前阶段输出。

## Superpowers 边界

- `feature-doc-pack` 负责协作文档判断、生成范围和质量门槛。
- 需求澄清和方案探索使用 `brainstorming`。
- 多步骤实现计划使用 `writing-plans`。
- 执行计划使用 `executing-plans`。
- 功能实现和修复按风险使用 `test-driven-development`、`systematic-debugging`、`verification-before-completion` 和 `requesting-code-review`。
- 协作文档生成完成后，进入实现前应切换到对应技能，不要让 `feature-doc-pack` 承担编码流程。

## Subagents 边界

- 只有用户明确要求使用 subagent、多代理协作或指定角色时，才启动 subagent。
- 子任务必须写清读写范围、职责边界、禁止事项和交付物。
- 只读分析任务要明确“不修改文件”。
- 代码修改任务要明确允许修改的文件或模块，避免多人同时改同一范围。

## Feature docs progress update policy

当使用 feature-doc-pack 生成的文档进行开发时：

1. 不要直接按整个文档包开发，只按 `TASK-BOARD.md` 中指定任务包开发。
2. 开始开发任务时，更新 `TASK-BOARD.md` 的任务状态为 `开发中`。
3. 完成接口实现时，更新 `API-CONTRACT.md` 中对应接口的开发状态。
4. 完成联调时，更新 `API-CONTRACT.md` 中对应接口的联调状态。
5. 执行测试后，更新 `TEST-CASES.md` 中对应用例的执行状态。
6. 任务完成前检查三处状态是否一致：`TASK-BOARD.md`、`API-CONTRACT.md`、`TEST-CASES.md`。
7. 不要默认创建 `PROGRESS.md` 或 `TASK-PROGRESS.md`；只有用户明确要求单独进度文档，或任务板已经无法清晰承载进度时再创建 `PROGRESS.md`。

## 交付要求

- 修改完成后给出变更摘要、变更文件清单、验证结果、风险和未覆盖点。
- 不要修改与当前任务无关的文件。
- 不要把项目特有字段、接口、表名或业务模式写进全局 skill。
