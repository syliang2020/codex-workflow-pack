# 通知模板管理 API-CONTRACT

状态：Draft

## 接口总览

| 接口编号 | 方法 | 路径 | 目的 | 关联规则 | 关联任务 | 测试用例 |
| --- | --- | --- | --- | --- | --- | --- |
| <a id="api-001"></a>[API-001](#api-001) | GET | `/api/notification-templates` | 查询模板列表 | [BR-001](BUSINESS-RULES.md#br-001) | [TASK-FE-001](TASK-BOARD.md#task-fe-001), [TASK-BE-001](TASK-BOARD.md#task-be-001) | [TC-001](TEST-CASES.md#tc-001) |
| <a id="api-002"></a>[API-002](#api-002) | POST | `/api/notification-templates` | 新增模板 | [BR-001](BUSINESS-RULES.md#br-001), [BR-002](BUSINESS-RULES.md#br-002) | [TASK-BE-001](TASK-BOARD.md#task-be-001) | [TC-001](TEST-CASES.md#tc-001), [TC-002](TEST-CASES.md#tc-002) |
| <a id="api-003"></a>[API-003](#api-003) | PUT | `/api/notification-templates/{id}` | 编辑模板 | [BR-001](BUSINESS-RULES.md#br-001), [BR-002](BUSINESS-RULES.md#br-002) | [TASK-BE-001](TASK-BOARD.md#task-be-001) | [TC-002](TEST-CASES.md#tc-002) |
| <a id="api-004"></a>[API-004](#api-004) | POST | `/api/notification-templates/preview` | 预览模板 | [BR-004](BUSINESS-RULES.md#br-004) | [TASK-BE-002](TASK-BOARD.md#task-be-002) | [TC-004](TEST-CASES.md#tc-004) |
| <a id="api-005"></a>[API-005](#api-005) | POST | `/api/notification-templates/{id}/status` | 启用或停用模板 | [BR-003](BUSINESS-RULES.md#br-003) | [TASK-BE-002](TASK-BOARD.md#task-be-002) | [TC-003](TEST-CASES.md#tc-003) |

## <a id="api-001"></a>API-001 查询模板列表

- 权限：管理员登录。
- 响应结构：按当前项目统一响应约定返回列表数据。

### 请求字段

| 字段 | 类型 | 必填 | 说明 | 校验 | 示例 |
| --- | --- | --- | --- | --- | --- |
| `sceneCode` | string | 否 | 场景编码筛选 | 长度待确认 | `welcome` |
| `status` | string | 否 | 模板状态 | `enabled` 或 `disabled` | `enabled` |

### 响应字段

| 字段 | 类型 | 是否返回 | 说明 | 空值规则 |
| --- | --- | --- | --- | --- |
| `id` | string | 是 | 模板 ID | 不为空 |
| `sceneCode` | string | 是 | 场景编码 | 不为空 |
| `title` | string | 是 | 模板标题 | 不为空 |
| `status` | string | 是 | 模板状态 | 不为空 |

## <a id="api-002"></a>API-002 新增模板

### 请求字段

| 字段 | 类型 | 必填 | 说明 | 校验 | 示例 |
| --- | --- | --- | --- | --- | --- |
| `sceneCode` | string | 是 | 场景编码 | 唯一性见 [BR-001](BUSINESS-RULES.md#br-001) | `welcome` |
| `title` | string | 是 | 模板标题 | 非空 | `欢迎通知` |
| `content` | string | 是 | 模板正文 | 非空 | `你好，{{name}}` |
| `variables` | array | 否 | 变量说明 | 结构待确认 | `[]` |

### 响应字段

| 字段 | 类型 | 是否返回 | 说明 | 空值规则 |
| --- | --- | --- | --- | --- |
| `id` | string | 是 | 新增模板 ID | 不为空 |
| `status` | string | 是 | 初始状态 | 默认停用 |

## <a id="api-003"></a>API-003 编辑模板

请求字段同 [API-002](#api-002)，但 `sceneCode` 是否允许修改待确认。

## <a id="api-004"></a>API-004 预览模板

### 请求字段

| 字段 | 类型 | 必填 | 说明 | 校验 | 示例 |
| --- | --- | --- | --- | --- | --- |
| `title` | string | 是 | 模板标题 | 非空 | `欢迎通知` |
| `content` | string | 是 | 模板正文 | 非空 | `你好，{{name}}` |
| `sampleData` | object | 否 | 示例变量值 | 键值格式待确认 | `{ "name": "Alex" }` |

### 响应字段

| 字段 | 类型 | 是否返回 | 说明 | 空值规则 |
| --- | --- | --- | --- | --- |
| `previewTitle` | string | 是 | 替换后的标题 | 不为空 |
| `previewContent` | string | 是 | 替换后的正文 | 不为空 |

## <a id="api-005"></a>API-005 启用或停用模板

### 请求字段

| 字段 | 类型 | 必填 | 说明 | 校验 | 示例 |
| --- | --- | --- | --- | --- | --- |
| `status` | string | 是 | 目标状态 | `enabled` 或 `disabled` | `enabled` |

### 响应字段

| 字段 | 类型 | 是否返回 | 说明 | 空值规则 |
| --- | --- | --- | --- | --- |
| `id` | string | 是 | 模板 ID | 不为空 |
| `status` | string | 是 | 更新后的状态 | 不为空 |

## 错误场景

| 场景 | 触发条件 | 结果 |
| --- | --- | --- |
| 场景编码重复 | 新增或启用重复模板 | 业务校验失败 |
| 标题或正文为空 | 保存或启用 | 业务校验失败 |
| 模板不存在 | 编辑或更新状态 | 业务校验失败 |
