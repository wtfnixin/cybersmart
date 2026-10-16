# AI Model Routing & Cost Allocation Matrix

This matrix governs the intelligent dispatching of tasks across foundation models to maximize semantic accuracy while maintaining strict token budget efficiency ($O(1)$ efficiency).

---

## Model Allocation Strategy

| Task Category | Target Engine | Rationale & Token Budget Strategy |
| :--- | :--- | :--- |
| **Repo Architecture, Long-Trace Profiling & Log Ingestion** | **Gemini (Flash / Pro)** | Ingests large repository contexts, multi-megabyte flamegraphs, structured session replays, and documentation corpora at near-$O(1)$ cost efficiency with massive context windows. |
| **High-Precision Logic, Security Reasoning & Cryptography** | **Claude (Sonnet / Opus)** | Deep algorithmic reasoning, AST taint verification, formal protocol checks (TLA+ modeling), post-quantum security proofs, and technical whitepaper writing. |
| **Syntax-Exact Code Generation, Migrations & Configs** | **Codex / Code Engine** | Deterministic syntax synthesis, Drizzle/SQL migrations, TypeBox/Zod schemas, typed React Email JSX templates, and CI/CD workflow configurations. |

---

## Token Consumption Guardrails
1. **Dynamic Prompt Compression:** Apply token pruning, AST-aware summarization, and eliminate repetitive AST nodes before model invocation.
2. **Deterministic Pre-Filtering:** Validate schema boundaries locally with zero-overhead validators before dispatching to LLM evaluators.
3. **Structured Output Enforcement:** Always request JSON schemas with strictly typed fields to eliminate multi-turn parsing retries.
