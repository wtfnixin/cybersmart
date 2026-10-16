# Architectural Mistake & Misstep Log

This log systematically records all bugs, regressions, architectural missteps, and false assumptions encountered during design and engineering, following the 5 Whys Root Cause Analysis protocol.

---

## Log Template

```markdown
## Entry [ID]: [Short Summary of Mistake]
- **Date & Phase:** [Timestamp / Phase]
- **What Failed:** [Exact bug, performance drop, race condition, or memory leak]
- **Root Cause Analysis (5 Whys):**
  1. Why did it happen? -> [Reason 1]
  2. Why did that occur? -> [Reason 2]
  3. Why was it not caught earlier? -> [Reason 3]
  4. Why did the test suite pass? -> [Reason 4]
  5. What fundamental assumption was incorrect? -> [Root Cause]
- **Resolution & Architectural Prevention:** [Corrective code pattern, static analysis rule, or pipeline check added]
```

---

## Entries

*(No missteps recorded yet. System initialized in Phase 1.)*
