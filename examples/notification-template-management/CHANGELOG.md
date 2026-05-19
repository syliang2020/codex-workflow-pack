# 通知模板管理 CHANGELOG

状态：Draft

## 变更摘要

| 日期 | 变更类型 | 摘要 | 关联项 |
| --- | --- | --- | --- |
| 示例日期 | Added | 新增通知模板维护能力 | [PLAN.md](PLAN.md) |
| 示例日期 | Added | 新增模板保存、查询、预览和状态接口 | [API-001](API-CONTRACT.md#api-001)、[API-002](API-CONTRACT.md#api-002)、[API-003](API-CONTRACT.md#api-003)、[API-004](API-CONTRACT.md#api-004)、[API-005](API-CONTRACT.md#api-005) |
| 示例日期 | Added | 新增通知模板数据库设计草案 | [DB-001](DATABASE-DESIGN.md#db-001)、[DB-002](DATABASE-DESIGN.md#db-002)、[DB-003](DATABASE-DESIGN.md#db-003)、[DB-004](DATABASE-DESIGN.md#db-004)、[DB-005](DATABASE-DESIGN.md#db-005)、[DB-006](DATABASE-DESIGN.md#db-006) |

## Added

- 支持通知模板列表、创建、编辑、启停和预览。
- 支持通知模板持久化草案，详见 [DATABASE-DESIGN.md](DATABASE-DESIGN.md)。
- 支持业务规则到接口、任务和测试的追踪矩阵。

## Changed

- 无。本示例为新增能力。

## Removed

- 无。

## Compatibility

- 本期不迁移历史配置。
- 后续读取模板时应兼容不存在启用模板的场景。

## 待确认项

- 数据库设计仍为 Draft，最终表结构和唯一约束需要后端负责人确认。
