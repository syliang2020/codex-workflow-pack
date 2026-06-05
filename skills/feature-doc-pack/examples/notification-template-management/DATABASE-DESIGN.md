# 通知模板管理 DATABASE-DESIGN

状态：Draft

## 数据库设计目标

- 持久化通知模板标题、正文、场景和状态。
- 支持按场景编码和状态查询。
- 为后续实际发送能力预留读取条件，但本期不实现发送。

## 确认角色

| 角色 | 负责人 | 状态 |
| --- | --- | --- |
| 后端负责人 | 待分配 | 待确认 |
| 业务负责人或产品负责人 | 待分配 | 待确认 |
| 测试负责人 | 待分配 | 待确认 |
| 发布负责人 | 待分配 | 待确认 |

## 涉及的数据对象

| 对象 | 说明 | 关联规则 |
| --- | --- | --- |
| 通知模板 | 标题、正文、场景编码、状态和变量说明 | [BR-001](BUSINESS-RULES.md#br-001), [BR-002](BUSINESS-RULES.md#br-002), [BR-003](BUSINESS-RULES.md#br-003) |

## 表清单

| 表 | 设计类型 | 说明 | 状态 |
| --- | --- | --- | --- |
| `notification_template` | 新增表 | 保存通知模板 | Draft |

## 表关系说明

- 本期先按单表设计。
- 变量说明是否拆分为独立表待确认。

## 字段草案

| 编号 | 表 | 字段 | 类型建议 | 必填 | 默认值 | 含义 | 约束 | 关联规则 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| <a id="db-001"></a>[DB-001](#db-001) | `notification_template` | `id` | string 或 bigint，待后端确认 | 是 | 无 | 主键 | 唯一 | 不适用 |
| <a id="db-002"></a>[DB-002](#db-002) | `notification_template` | `scene_code` | string，长度待后端确认 | 是 | 无 | 场景编码 | 启用模板唯一性待确认 | [BR-001](BUSINESS-RULES.md#br-001) |
| <a id="db-003"></a>[DB-003](#db-003) | `notification_template` | `title` | string，长度待后端确认 | 是 | 无 | 模板标题 | 非空 | [BR-002](BUSINESS-RULES.md#br-002) |
| <a id="db-004"></a>[DB-004](#db-004) | `notification_template` | `content` | text 或 string，待后端确认 | 是 | 无 | 模板正文 | 非空 | [BR-002](BUSINESS-RULES.md#br-002) |
| <a id="db-005"></a>[DB-005](#db-005) | `notification_template` | `status` | string，长度待后端确认 | 是 | `disabled` | 启停状态 | 枚举约束 | [BR-003](BUSINESS-RULES.md#br-003) |
| <a id="db-006"></a>[DB-006](#db-006) | `notification_template` | `variables` | json 或 text，待后端确认 | 否 | 空 | 变量说明 | 格式待确认 | [BR-004](BUSINESS-RULES.md#br-004) |

## 主键和唯一约束

- 主键：`id`。
- 唯一约束：同一场景是否只允许一个启用模板待确认。

## 索引建议

- 建议评估 `scene_code` 查询索引。
- 建议评估 `status` 查询索引。

## 枚举/字典映射

| 字段 | 值 | 含义 |
| --- | --- | --- |
| `status` | `enabled` | 启用 |
| `status` | `disabled` | 停用 |

## 数据迁移影响

- 新增表无历史数据迁移。
- 如果后续从旧配置迁移模板，需要另行补充迁移设计。

## 历史数据兼容方案

- 本期无历史表结构兼容。
- 后续读取模板时，应兼容不存在启用模板的场景。

## 待确认项

- `id` 类型由后端负责人确认。
- `variables` 是否使用 JSON 字段由后端负责人确认。
- 启用模板唯一性是否通过数据库唯一约束实现待确认。
