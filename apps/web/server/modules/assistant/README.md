# ORBIT Copilot backend

ORBIT Copilot is split into explicit layers so data access, language reasoning, deterministic calculations, source grounding, conversation memory and mutations never collapse into one route handler.

```text
assistant/
├── config.ts                  # runtime/model limits
├── types.ts                   # shared contracts + safe query DSL
├── history.ts                 # bounded recent-turn context
├── intent.ts                  # scored intent classification
├── semantic.ts                # bilingual source/field semantics
├── planner.ts                 # deterministic request planning
├── repository.ts              # workspace snapshot reads
├── query-engine.ts            # workspace-level deterministic metrics
├── structured-query.ts        # validated single-source query executor
├── relational-analytics.ts    # saved-relation multi-source hash joins
├── grounding.ts               # source truth + hallucination checks
├── prompt.ts                  # isolated Copilot system instructions
├── provider.ts                # model planner + model answer adapter
├── actions.ts                 # action proposal factory
├── action-executor.ts         # confirmed permission-checked mutations
├── conversation-store.ts      # persisted private thread memory + feedback
├── orchestrator.ts            # plan → query → ground → explain → act
├── service.ts                 # application boundary
├── analytics.ts               # compatibility facade
└── analysis/
    ├── types.ts               # deterministic analysis contracts
    ├── utils.ts               # shared value helpers
    ├── runtime.ts             # strategy dispatcher + data loading
    ├── sla.ts                 # SLA/breach strategy
    ├── quality.ts             # missing/duplicate strategy
    ├── ranking.ts             # numeric aggregation/ranking strategy
    └── fallback.ts            # no-assumption source-aware fallback
```

## Answer lifecycle

```text
/api/assistant
  → authenticate user + workspace capability
  → restore private conversation context
  → workspace snapshot
  → request planner
  → relationship-aware analysis when needed
  → optional model-generated structured query plan
  → validate plan against real schema
  → deterministic query execution
  → exact SourceRef + Evidence
  → optional model explanation
  → grounding validator rejects unsupported numeric claims
  → safe action proposals
  → persist answer metadata
  → response
```

This is intentionally **not** text-to-SQL. The model can propose a small query DSL, but ORBIT validates every collection, field, operator and limit before the deterministic engine touches records.

## Multi-file reasoning

Cross-file requests use saved `CollectionRelation` objects. ORBIT never silently assumes that two similarly named columns are a valid join. The relational engine performs bounded in-memory hash joins and reports every source collection and join field used.

## Mutation lifecycle

```text
Copilot proposes action
  → UI shows confirmation
  → user explicitly confirms
  → /api/assistant/actions
  → capability check
  → action executor
  → database mutation
  → audit log
```

## Conversation memory

`AssistantConversation` and `AssistantMessage` are tenant-scoped to the current workspace and user. The browser only stores the active conversation id; server-side authorization verifies ownership on every restore. Assistant metadata persists the request id, source references, evidence, intent, confidence and execution mode so a restored thread still shows provenance.

`AssistantFeedback` stores thumbs-up/down feedback per assistant message. It is the first building block for future privacy-safe learning; it is **not** model fine-tuning by itself.

## Hard safety / correctness rules

- A model never receives database credentials and never executes SQL.
- A model can plan within a validated DSL and explain computed results; it cannot author numeric truth.
- Dataset values, filenames, fields and conversation text are untrusted input, never system instructions.
- If a supporting source cannot be resolved, ORBIT explicitly says so.
- Mutations require explicit confirmation plus server-side capability checks.
- Conversation history is bounded and sanitized before model use.
- Provider timeouts/failures fall back to deterministic behavior instead of breaking the chat.
- AI-written answers are rejected if they introduce numeric facts absent from the deterministic ground truth.

## Model configuration

The language-model layer is provider-agnostic and expects an OpenAI-compatible chat endpoint:

```env
AI_API_URL=
AI_API_KEY=
AI_MODEL=
```

Without those variables ORBIT still works as a deterministic, source-grounded data copilot. Connecting a strong language model improves natural-language understanding, follow-up reasoning and explanation quality, while the deterministic engines remain the authority for workspace facts.
