# 通知模板管理 TASK-BOARD

状态：Draft

## 进度视图

| 状态 | 数量 | 说明 |
| --- | --- | --- |
| 未开始 | 5 | 示例任务均未开始 |
| 阻塞 | 1 | 数据库设计待确认 |
| 已完成 | 0 | 无 |

## 任务清单

| 任务编号 | 任务 | 负责人 | 角色 | 范围 | 依赖 | 输出物 | 完成标准 | 状态 | 当前问题 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="task-fe-001"></a>[TASK-FE-001](#task-fe-001) | 模板列表和表单 | 待分配 | 前端 | 列表、创建、编辑、启停、预览入口 | [API-001](API-CONTRACT.md#api-001)、[API-002](API-CONTRACT.md#api-002)、[API-003](API-CONTRACT.md#api-003)、[API-004](API-CONTRACT.md#api-004)、[API-005](API-CONTRACT.md#api-005) | 页面和交互 | 覆盖 [BR-001](BUSINESS-RULES.md#br-001)、[BR-002](BUSINESS-RULES.md#br-002)、[BR-003](BUSINESS-RULES.md#br-003)、[BR-004](BUSINESS-RULES.md#br-004) | 未开始 | 无 |
| <a id="task-be-001"></a>[TASK-BE-001](#task-be-001) | 模板保存和查询接口 | 待分配 | 后端 | [API-001](API-CONTRACT.md#api-001)、[API-002](API-CONTRACT.md#api-002)、[API-003](API-CONTRACT.md#api-003) | [DB-001](DATABASE-DESIGN.md#db-001)、[DB-002](DATABASE-DESIGN.md#db-002)、[DB-003](DATABASE-DESIGN.md#db-003)、[DB-004](DATABASE-DESIGN.md#db-004)、[DB-005](DATABASE-DESIGN.md#db-005)、[DB-006](DATABASE-DESIGN.md#db-006) | 接口和校验 | 通过 [TC-001](TEST-CASES.md#tc-001)、[TC-002](TEST-CASES.md#tc-002) | 阻塞 | 数据库设计未确认 |
| <a id="task-be-002"></a>[TASK-BE-002](#task-be-002) | 预览和状态接口 | 待分配 | 后端 | [API-004](API-CONTRACT.md#api-004)、[API-005](API-CONTRACT.md#api-005) | [TASK-BE-001](#task-be-001) | 接口和校验 | 通过 [TC-003](TEST-CASES.md#tc-003)、[TC-004](TEST-CASES.md#tc-004) | 未开始 | 无 |
| <a id="task-qa-001"></a>[TASK-QA-001](#task-qa-001) | 规则和接口测试 | 待分配 | 测试 | 业务规则、接口字段和错误场景 | 文档确认 | 测试记录 | 关键用例全部执行 | 未开始 | 无 |
| <a id="task-release-001"></a>[TASK-RELEASE-001](#task-release-001) | 变更记录确认 | 待分配 | 发布 | [CHANGELOG.md](CHANGELOG.md) | 文档确认 | 发布前检查项 | 风险和待确认项清楚 | 未开始 | 无 |

## 追踪矩阵

| 业务规则 | 接口 | 数据库设计 | 开发任务 | 测试用例 | 覆盖状态 |
| --- | --- | --- | --- | --- | --- |
| [BR-001](BUSINESS-RULES.md#br-001) | [API-002](API-CONTRACT.md#api-002), [API-003](API-CONTRACT.md#api-003) | [DB-002](DATABASE-DESIGN.md#db-002) | [TASK-BE-001](#task-be-001) | [TC-001](TEST-CASES.md#tc-001) | 部分覆盖 |
| [BR-002](BUSINESS-RULES.md#br-002) | [API-002](API-CONTRACT.md#api-002), [API-003](API-CONTRACT.md#api-003) | [DB-003](DATABASE-DESIGN.md#db-003), [DB-004](DATABASE-DESIGN.md#db-004) | [TASK-FE-001](#task-fe-001), [TASK-BE-001](#task-be-001) | [TC-002](TEST-CASES.md#tc-002) | 已覆盖 |
| [BR-003](BUSINESS-RULES.md#br-003) | [API-005](API-CONTRACT.md#api-005) | [DB-005](DATABASE-DESIGN.md#db-005) | [TASK-BE-002](#task-be-002) | [TC-003](TEST-CASES.md#tc-003) | 已覆盖 |
| [BR-004](BUSINESS-RULES.md#br-004) | [API-004](API-CONTRACT.md#api-004) | [DB-006](DATABASE-DESIGN.md#db-006) | [TASK-BE-002](#task-be-002) | [TC-004](TEST-CASES.md#tc-004) | 已覆盖 |

## 阻塞项

- `DATABASE-DESIGN.md` 仍为 Draft，后端数据库实现任务暂不能开工。
