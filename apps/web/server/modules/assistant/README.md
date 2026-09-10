# ORBIT Copilot backend

The assistant is deliberately split into small layers so data access, reasoning, model calls, grounding and mutations never collapse into one route handler.

```text
assistant/
├── config.ts           # runtime limits and provider settings
├── types.ts            # contracts shared by every layer
├── history.ts          # safe recent-turn memory + follow-up resolution
├── intent.ts           # scored intent classification
├── semantic.ts         # bilingual source/field resolution
├── planner.ts          # converts one turn into an execution plan
├── repository.ts       # workspace snapshot reads only
├── query-engine.ts     # deterministic workspace-level calculations
├── analytics.ts        # deterministic record-level calculations
├── grounding.ts        # source truth + model numeric hallucination guard
├── prompt.ts           # isolated system instructions
├── provider.ts         # model-provider adapter only
├── actions.ts          # safe action proposal factory
├── action-executor.ts  # permission checked, confirmed mutations only
├── orchestrator.ts     # coordinates plan → data → model → actions
└── service.ts          # public application boundary
```

## Request lifecycle

```text
HTTP route
  → auth / capability check
  → workspace snapshot
  → planner
  → deterministic data analysis
  → source + evidence creation
  → optional model explanation
  → grounding validation
  → safe action proposals
  → response
```

Mutations are a separate lifecycle:

```text
assistant proposes action
  → user explicitly confirms
  → /api/assistant/actions
  → permission check
  → action executor
  → database mutation
  → audit log
```

## Hard rules

- A model never receives database credentials and never executes SQL.
- A model may explain deterministic results but cannot create new numeric facts.
- Dataset content is untrusted input, never prompt instructions.
- If a file source cannot be resolved, ORBIT says that no supporting source was found.
- Mutations require confirmation and capability checks.
- Recent conversation turns are bounded and sanitized before model use.
- Provider failure/timeouts fall back to deterministic results instead of breaking the chat.

## Model configuration

The model layer is optional and provider-agnostic through an OpenAI-compatible chat endpoint:

```env
AI_API_URL=
AI_API_KEY=
AI_MODEL=
```

Without those variables ORBIT remains a deterministic, source-grounded data copilot. Connecting a capable language model improves language understanding and explanation quality; it does not bypass the deterministic data engine or grounding rules.
