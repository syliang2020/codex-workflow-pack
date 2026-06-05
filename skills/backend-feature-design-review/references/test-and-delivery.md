# Test and Delivery Review

Use this reference before implementing tests and before claiming completion.

## Test Coverage

Cover the highest-risk paths first:

- Normal create/save flow.
- Normal edit/update flow.
- Detail or edit echo after save/update.
- Missing required parameters.
- Invalid enum, dictionary, mode, or status.
- Permission failure and ownership failure.
- Delete, publish, import, attachment, or audit restrictions.
- Historical data compatibility.
- Migration or backfill assumptions.
- Boundary values such as empty lists, duplicate entries, long text, and mixed modes.

## Design Self-Check

Before completion, report:

- Field semantics: whether any field carries multiple meanings.
- Naming consistency: whether each layer uses clear domain language.
- Responsibility boundaries: where validation, orchestration, persistence, and conversion live.
- Reuse: whether save/update/delete share common logic safely.
- Transaction boundary: what succeeds/fails together.
- External calls: retry, compensation, and idempotency risks.
- Historical compatibility: migration, backfill, rollback, and old-data reads.
- Test results: commands run and what passed.
- Residual risk: what remains untested or intentionally deferred.

## Red Flags

- Completion summary only says "implemented" without test evidence.
- Tests only check source text instead of behavior when behavior tests are feasible.
- No test covers update after create.
- No test covers historical or old-shape data after a schema change.
