# CloudSpend Intelligence — Honest Limitations & Boundaries

## 1. Data Source Boundaries
- **Billing Data Only**: CloudSpend operates on FOCUS billing datasets. It does not possess direct real-time hypervisor or OS-level telemetry (e.g., CPU/RAM utilization metrics).
- **Honesty Rule**: The system explicitly states *"candidate for investigation because billed cost changed X% while quantity changed Y%"* rather than making unsupported utilization claims (e.g. *"VM is underutilized"*).

## 2. Savings Projections
- All savings figures are **ESTIMATED SAVINGS**, not realized savings. Realized savings require post-implementation billing verification.

## 3. Human-in-the-Loop Constraint
- CloudSpend is a **decision-support platform**. It does not perform automated infrastructure modifications, resource shutdowns, or destructive deletions.

## 4. LLM Role & Fallback
- Gemini is used solely for natural-language explanations of deterministic analytics. If Gemini is unavailable, the platform degrades gracefully to `MockLLMProvider` with zero loss of numerical or analytical functionality.
