# Service Flow Review

Use this reference for save, update, delete, import, publish, audit, attachment, relation, transaction, and external-call flows.

## Reuse Checklist

Compare similar flows before coding:

- Basic validation
- Permission and identity resolution
- Dictionary or reference-data lookup
- Business rule validation
- Title or derived-field generation
- Entity field assignment
- Relation replacement
- Attachment binding
- Log or audit writing
- External service calls

If repeated logic exceeds a small block, propose a shared method, context object, command object, Converter, Assembler, or domain builder.

## Suggested Abstractions

- Context object: holds request, current user, identity, dictionary map, old entity, derived values, and flags.
- `prepareContext`: validates input, loads dependencies, and calculates derived values.
- `applyEntityFields`: assigns shared persistent fields for create and update.
- `replaceRelations`: deletes/rebuilds relation data consistently.
- `saveAttachments`: binds attachments after the main object identity is known.

## Transaction and Consistency

- Identify which database writes must succeed or fail together.
- Mark external calls that cannot join the local transaction.
- For external calls, consider idempotency, retry, compensation, or explicit failure handling.
- Avoid saving local state that says an external operation succeeded before it actually did.

## Red Flags

- Save and update duplicate a long sequence with tiny differences.
- Relation delete and relation insert are not in a clear transaction.
- Attachments are deleted before validation has fully succeeded.
- Feign or client calls are treated as if they are part of the database transaction.
