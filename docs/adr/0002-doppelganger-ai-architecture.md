# ADR 0002: Doppelgänger AI System Architecture & Stack Selection

## Status
Accepted

## Context & Problem Statement
The UNPHISHABLE hackathon challenge ("The Digital Doppelgänger") requires an interactive solution that reveals how public social media breadcrumbs are weaponized to synthesize personal clones for targeted social engineering and impersonation. We need a high-impact, fast-loading, zero-dependency client application that can be built and demonstrated reliably under a 2–3 hour constraint.

## Decision Drivers & Non-Functional Bounds
- **Target Startup & Response Latency:** < 500ms initial load; 0ms network latency for analysis (100% deterministic client-side evaluation).
- **Aesthetic Fidelity:** Anti-slop, OLED cyber command HUD adhering to `taste-skill` and `ui-ux-pro-max-skill` (WCAG 2.2 AA compliant, 7:1+ contrast).
- **Motion & Feedback:** 60fps spring physics and GPU-accelerated canvas background (Tower 5).
- **Zero Pitch Failure Risk:** Zero reliance on third-party cloud APIs that could fail, hit rate limits, or add latency during judging.

## Options Evaluated
1. **Full-Stack with External LLM APIs (OpenAI/Anthropic):** Dynamic LLM generation for every persona scan. High latency (3-5s per scan), dependency on network connectivity during hackathon presentation, and vulnerability to rate limits.
2. **Client-Side Deterministic Synthesis Engine with React, Framer Motion & Canvas 2D (Chosen):** Pre-computed extraction heuristics + custom entity analyzer running directly in the browser. Zero network lag, 100% reliable demo, instant 60fps animations, and rich interactive controls.

## Decision Outcome
Chosen Option: **Option 2** because it delivers instant responsiveness, guarantees 100% reliability during live judging, and allows us to focus development time on visual impact and security depth.

## Consequences & Mitigations
- **Positive Gains:**
  - Instant live demo with zero failure points.
  - Full support for both rich pre-packaged personas and real-time custom user input.
  - Visually striking presentation with live risk score animations.
- **Accepted Trade-offs:**
  - Entity extraction for custom text uses deterministic heuristic pattern matching (regex, dictionary matching, entropy scoring) rather than an unconstrained multi-billion parameter model.
