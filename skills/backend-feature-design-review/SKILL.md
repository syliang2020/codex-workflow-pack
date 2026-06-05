---
name: backend-feature-design-review
description: Use when backend work involves database tables or fields, API contracts, validation, save/update/delete flows, attachments, transactions, external calls, data access via DAO/Repository/MyBatis Mapper/Mapper.xml/JdbcTemplate, naming consistency, or backend code review before implementation.
---

# Backend Feature Design Review

Use this skill before implementing backend changes where design quality affects maintainability.

## Core Rule

Do not implement first. Review the design, identify risks, ask for confirmation, and only code after the user agrees.

If the user asks for review or summary only, produce the review without changing files.

## Short Prompt Expansion

When the user gives a short instruction such as "use backend-feature-design-review", "backend design gate", "review this backend code", "avoid the previous backend issues", or "check before coding", treat it as a request to run the full backend design gate. Do not require the user to restate the checklist.

For complex backend feature work, expand the short request into these default checks:

- Data model: each field has one meaning; separate ID, name snapshot, display path, custom input, derived value, and search token.
- Naming: table, Entity/DO/PO, Service/Manager/DomainService, Controller/Api/Endpoint, DTO/Request/VO, DAO/Repository/MyBatis Mapper/Mapper.xml/JdbcTemplate helper, Converter/Assembler, Validator/Rules, Feign/Client/Adapter names express the same domain clearly.
- Blocking layering: Controller/Api must depend on Service only; Listener/Consumer/Job/Scheduler should use Service for business queries unless the project has an explicit established same-kind pattern; data access results must get Service-level business meaning before reaching entry layers.
- Flow reuse: compare save, update, delete, import, publish, relation replacement, and attachment binding before coding; flag duplicated orchestration and propose shared context/build/apply/replace methods.
- Validation layering: DTO/Request handles basic shape; Validator/Rules/Policy handles reusable business rules; Service orchestrates; data access does not decide business validity.
- Consistency: identify local transaction boundaries and any external call, attachment service, message, cache, or file operation that cannot roll back with the database.
- Compatibility: check historical data, migration, backfill, rollback, indexes, old frontend payloads, and read/edit/display/export/delete behavior.
- Tests: require behavior tests for critical flows; source-string assertions are not enough for business behavior.

## Blocking Architecture Findings

Treat these as blocking defects in review-only or implementation-gate mode:

- Controller/Api directly depends on DAO, Repository, MyBatis Mapper, Mapper.xml helper, EntityManager, JdbcTemplate, or equivalent data access component.
- Listener, Consumer, Job, or Scheduler directly performs business queries through data access instead of Service, unless the project already has a clear same-kind pattern.
- Controller/Api passes empty strings, raw `Map`, raw `Object`, or unclear business parameters through to Service.
- Business validation, import validation, template validation, transaction decisions, or dynamic update decisions live outside Service or a Service-called Validator/Rules/Policy layer.
- DAO/Mapper query results are returned to Controller/Api, Listener, Consumer, Job, or Scheduler without Service-level business naming or transformation.

For each blocking defect, report file path, exact symbol or dependency, why it violates layering, expected dependency direction, and suggested fix. Do not soften findings. Do not call a violation acceptable unless you verified it is existing legacy code and the current diff did not introduce or expand it.

## Workflow

1. Identify the feature boundary and affected modules.
2. Decide whether this is implementation-gate mode or review-only mode.
3. Decide which design areas are involved.
4. Load only the relevant reference files below.
5. Produce a concise design review with risks, recommendations, tests, and open questions.
6. Stop and wait for user confirmation before implementation.

## Reference Loading

- Tables, fields, snapshots, derived values, migrations, backfill, rollback, indexes, or historical data: read `references/data-model.md`.
- Naming, layering, DAO, Repository, MyBatis Mapper, Mapper.xml, JdbcTemplate, DTO, VO, Entity, Converter, Assembler, Validator, or Rules: read `references/naming-and-layering.md`.
- Save, update, delete, import, publish, audit, attachments, logs, transactions, external calls, retry, idempotency, or compensation: read `references/service-flow.md`.
- API request/response fields, validation, error codes, error messages, enums, frontend compatibility, or contract changes: read `references/api-and-validation.md`.
- Test planning, delivery summary, quality self-check, or completion criteria: read `references/test-and-delivery.md`.

## Required Output

Return:

- Recommendation: can develop / needs confirmation / should redesign first
- Feature boundary
- Key risks
- Design decisions
- Required abstractions
- Tests to add
- Questions for user

Wait for confirmation before implementation.

For review-only requests, lead with findings ordered by severity, include file/line references when code is available, and do not modify files.
Separate existing legacy issues, issues introduced by this change, and cases where this change expands a legacy issue. New or expanded issues must be fixed, not labeled as legacy.

## Stop Conditions

Recommend confirmation or redesign before coding when:

- One field carries multiple meanings.
- Naming hides the real domain role.
- Service methods duplicate large save/update/delete flows.
- Validation rules are scattered across layers.
- Transaction or external-call consistency is unclear.
- Historical data, migration, or rollback is unaddressed.
