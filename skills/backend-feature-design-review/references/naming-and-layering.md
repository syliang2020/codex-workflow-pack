# Naming and Layering Review

Use this reference when checking domain naming, framework-specific layer names, or responsibility boundaries.

## Naming Matrix

Review the project's actual roles, not one fixed stack.

| Role | Common Names | Check |
|---|---|---|
| Database model | table, column | Does the name describe the stored business object? |
| Persistent object | Entity, DO, PO, Model | Does it match table semantics without leaking API concerns? |
| Data access | DAO, Repository, MyBatis Mapper, Mapper.xml, JdbcTemplate helper | Does it only query and persist data? |
| Service layer | Service, ServiceImpl, Manager, DomainService | Does it express business capability and orchestration? |
| API entry | Controller, Api, Resource, Endpoint | Does it expose request/response behavior only? |
| Request object | DTO, Request, Form, Command, SaveVO | Does it represent input instead of persistence state? |
| Response object | VO, Response, View | Does it represent output and display needs? |
| Query object | Query, Criteria, PageQuery | Is querying separated from save/update input? |
| Conversion layer | Converter, Assembler, Builder, MapStruct Mapper | Is object transformation centralized? |
| Rule layer | Validator, Rules, Policy, Checker | Are reusable decisions outside ServiceImpl? |
| External call | Feign, Client, Gateway, Adapter | Are cross-service details isolated? |
| Constants | Enum, Constants | Are magic values avoided in service code? |

## Mapper Distinction

- MyBatis Mapper belongs to the data access layer.
- MapStruct Mapper, Converter, Assembler, and Builder belong to object conversion.
- If both exist, use names that make their roles obvious.

## Responsibility Boundaries

- Controller/Api: receive request, call service, return response.
- DTO/Request/Form/Command: basic shape, required fields, length, format, enum range.
- Validator/Rules/Policy/Checker: reusable business validation and decision rules.
- Service/DomainService/Manager: business orchestration, transaction boundary, external call coordination.
- Data access layer: persistence queries and writes only.
- Converter/Assembler/Builder: repeated field assembly and object transformation.

## Blocking Layering Rules

Stop and report a blocking finding when any of these appear in current work:

- Controller/Api directly injects or calls DAO, Repository, MyBatis Mapper, Mapper.xml helper, EntityManager, JdbcTemplate, or equivalent data access component.
- Listener, Consumer, Job, or Scheduler directly injects or calls data access for business queries instead of Service. Allow this only after verifying the project already has a clear same-kind pattern and the current change does not expand the pattern.
- Controller/Api forwards empty strings, raw `Map`, raw `Object`, or unclear business parameters to Service instead of using a named request/query/command object or explicit parameters.
- Business validation, import validation, template validation, transaction decisions, or dynamic update decisions happen in Controller, Listener, Job, Consumer, DAO/Mapper, SQL, or utility code instead of Service or a Service-called Validator/Rules/Policy layer.
- DAO/Mapper result objects are returned directly to Controller/Api, Listener, Consumer, Job, or Scheduler without Service-level naming, transformation, or business meaning.

Expected dependency direction:

`Controller/Api/Listener/Consumer/Job/Scheduler -> Service/DomainService/Manager -> Validator/Rules/Policy and Data Access -> Database`

`Converter/Assembler/Builder` can be used by Service or entry layers for object transformation, but it must not own business validation or data access decisions.

## Finding Format

For every blocking layering defect, include:

1. File path.
2. Exact symbol, dependency, injected field, method call, or parameter.
3. Why it violates the layer boundary.
4. Expected dependency direction.
5. Suggested fix.

Do not soften findings. Do not say a violation is acceptable unless you verified it is pre-existing legacy code and the current diff neither introduced nor expanded it.

When reviewing existing code, classify each finding as:

- Existing legacy issue.
- Introduced by current change.
- Current change expands an existing issue.

Introduced or expanded issues must be fixed before implementation or approval.

## Red Flags

- Service is named after one concept while the table/entity uses another concept with no explanation.
- Request objects are reused as persistence entities.
- Controller contains business branching.
- Data access methods encode business rules that should be visible at service or rule level.
- Review excuses a new layering violation because similar old code already exists.
