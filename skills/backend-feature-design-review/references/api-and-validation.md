# API and Validation Review

Use this reference when backend work changes request fields, response fields, validation rules, error messages, enums, or frontend compatibility.

## API Contract

- List request fields with required status, type, meaning, source, and compatibility notes.
- List response fields with meaning, nullability, and display purpose.
- List enums, magic IDs, status values, and dictionary dependencies.
- State whether the frontend must change together.
- Do not hide field semantics behind vague references such as "see VO".

## Validation Layering

- DTO/Request/Form/Command: required fields, length, format, enum range, simple collection size.
- Controller/Api: no complex business rules; keep request entry and response handoff simple.
- Validator/Rules/Policy/Checker: reusable business validation, cross-field checks, mode-specific rules, permission predicates.
- Service: orchestrates validation, persistence, transactions, and external calls.
- Data access: does not decide business validity.

## Errors

- Keep error messages and error codes consistent across save, update, import, and batch flows.
- Check whether frontend logic depends on exact message text.
- Prefer centralized constants or enums for stable business error codes.
- Avoid scattering temporary Chinese strings or magic values across service methods.

## Red Flags

- The same rule is checked in one save path but missing from update.
- One validation lives in DTO annotations and a related rule lives as ad hoc service code.
- A new API field changes meaning without contract notes.
- Error text differs for the same business failure.
