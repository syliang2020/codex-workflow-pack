# Data Model Review

Use this reference when backend work touches tables, fields, storage paths, migrations, indexes, or historical data.

## Checklist

- Confirm each database field has exactly one business meaning.
- Separate ID, dictionary name snapshot, display path, custom input, status, derived value, and search token fields.
- If a redundant field is needed, define its source, write timing, update timing, owner, and consistency risk.
- Do not store display-only text in a field whose name suggests a foreign key name or dictionary name.
- Check whether the new model requires schema migration, data backfill, rollback SQL, or compatibility reads.
- Check whether old data can still be queried, edited, displayed, exported, and deleted correctly.
- Check whether indexes support the intended query path; call out LIKE-prefix, token-string, or denormalized search risks.

## Review Questions

- What is the canonical source of truth for each field?
- Which fields are snapshots, and why are snapshots required?
- Which fields are calculated, and when are they recalculated?
- Can two rows with the same business object disagree? If yes, how is disagreement resolved?
- Does the design make querying simple while keeping write consistency understandable?

## Red Flags

- A column named `name` sometimes stores a name and sometimes stores a path.
- A relation table stores custom business content without a field that says it is custom content.
- A field is added for one query without a migration, backfill, or rollback story.
- A token string is used for hierarchical filtering without documenting performance and correctness limits.
