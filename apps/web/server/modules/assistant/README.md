# ORBIT Copilot backend

ORBIT Copilot is split into explicit layers so language reasoning, deterministic calculations, source grounding, conversation memory and mutations stay independently testable.

```text
assistant/
├── config.ts
├── types.ts
├── history.ts
├── intent.ts
├── semantic.ts
├── planner.ts
├── repository.ts
├── query-engine.ts
├── structured-query.ts
├── relational-analytics.ts
├── relationship-proposals.ts
├── grounding.ts
├── prompt.ts
├── provider.ts
├── response-composer.ts
├── tool-registry.ts
├── runtime-status.ts
├── automation-plan.ts
├── actions.ts
├── action-executor.ts
├── conversation-store.ts
├── orchestrator.ts
├── service.ts
├── analytics.ts
├── analysis/
│   ├── runtime.ts
│   ├── sla.ts
│   ├── quality.ts
│   ├── anomaly.ts
│   ├── trend.ts
│   ├── search.ts
│   ├── stats.ts
│   ├── ranking.ts
│   └── fallback.ts
└── execution/
    ├── index.ts
    ├── types.ts
    ├── relation.ts
    ├── view.ts
    ├── dashboard.ts
    ├── automation.ts
    └── plan.ts
```

## Read tools

- `inspect_workspace` — collections, counts, relations and automations.
- `inspect_collection` — schema/source inspection.
- `run_query` — validated aggregate/filter query DSL.
- `profile_data` — missing/duplicate quality checks.
- `find_relationships` — saved relations and safe proposals.
- `export_csv` / `export_json` — authenticated collection export.

Deterministic strategies also cover SLA ranking, outlier detection using IQR, date trends, tolerant record search, descriptive statistics and numeric ranking.

## Action tools

- `create_relation`
- `create_view`
- `create_dashboard`
- `create_automation`
- `execute_plan`

Every mutation requires an explicit UI confirmation, a server-side capability check and an audit entry. Compound plans are bounded to eight mutation steps. They are sequential rather than transactional across unrelated entities; if a later step fails ORBIT reports which earlier steps already completed instead of claiming the whole plan succeeded.

A relation-dependent request can be resumed: ORBIT proposes the relation, the user confirms it, and the client sends the original request again so deterministic relational analysis continues using the newly saved relation.

## Multi-file reasoning

Cross-file analysis only uses saved `CollectionRelation` objects. ORBIT does not silently join columns because their names look alike. Explicit `collection.field` pairs are honored after validation; otherwise proposals are scored by key compatibility, request relevance and sample overlap. The relation engine can traverse a bounded saved-relation path across several mentioned collections, performs hash joins, caps joined tuples and reports every source and join field used.

## Automation behavior

The current runtime can execute active rules for `RECORD_CREATED` and `IMPORT_COMPLETED`, with `AUDIT_LOG` and `WEBHOOK` actions. Copilot translates requests into those real primitives when the wording is safely mappable. Unsupported scheduling/reminder behavior is stored as `REVIEW_REQUIRED` in a paused rule rather than being falsely described as executable.

## Answer lifecycle

```text
/api/assistant
  → authenticate + capability check
  → restore tenant-scoped conversation context
  → load workspace snapshot
  → classify and contextualize request
  → saved-relation analysis when required
  → optional provider query plan
  → validate plan against real schema
  → deterministic calculation
  → SourceRef + Evidence
  → natural response composition
  → optional provider explanation
  → grounding validator
  → action/export proposals
  → persist answer metadata
```

The model never receives database credentials and never executes SQL. The query planner uses a small validated DSL instead of text-to-SQL. Quantitative truth comes from deterministic engines. Provider answers that introduce numeric facts absent from ground truth are rejected.

## Conversation and feedback

`AssistantConversation` and `AssistantMessage` are scoped to the current workspace and user. The browser stores only the active conversation id. Server authorization verifies ownership on restore. `AssistantFeedback` stores per-message thumbs-up/down feedback; it is a signal for future learning, not model fine-tuning by itself.

## Runtime diagnostics

Authenticated endpoint:

```text
GET /api/assistant/status
```

It reports whether the language-model provider is configured, the current model name when available, the exposed Copilot tool manifest and core execution guarantees without exposing secrets.

## Model configuration

```env
AI_API_URL=
AI_API_KEY=
AI_MODEL=
```

Without those variables ORBIT still runs the deterministic source-grounded engines. A strong compatible language model improves natural-language planning and explanation, while deterministic ORBIT components remain authoritative for workspace facts and mutations.
