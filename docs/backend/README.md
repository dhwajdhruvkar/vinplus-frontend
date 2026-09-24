# Vinplus backend handoff package

Prepared 25 September 2026 against frontend commit **b0873bdffb7635cd8769d3761f6b11ed4bab4924**.

Start with **[backend-handoff.html](backend-handoff.html)**. Open it in any modern browser; it works offline and includes a contents sidebar, workflow overview, field dictionary and source function appendix. External documentation and GitHub links need internet access.

| File | Purpose |
| --- | --- |
| [backend-handoff.html](backend-handoff.html) | Complete readable engineering guide with navigation |
| [backend-handoff.md](backend-handoff.md) | Same main guide in editable Markdown |
| [backend-api.openapi.json](backend-api.openapi.json) | Proposed OpenAPI 3.1 contract: 30 paths, 36 operations and 65 schemas |
| [backend-api-examples.json](backend-api-examples.json) | Schema-linked requests/responses and a three-record reconciliation fixture |
| [backend-data-dictionary.csv](backend-data-dictionary.csv) | 96 canonical fields, frontend aliases, types, units and decisions |
| [frontend-function-map.md](frontend-function-map.md) | 200 named functions/components across 50 files, with exact source links |
| [validation-report.json](validation-report.json) | Contract, example, reconciliation and link validation results |

The guide covers all five KPIs, nine charts, detail and RO tables, filters, selection ownership, sorting, exports, comparisons, insights/RCA, notes, preferences, embeds, Share, the floating inbox and Outlook/Teams/WhatsApp/In-app integration.

The frontend currently uses fixtures and local message previews. This package proposes the backend and adapter work; **no backend or provider integration is live**. Read the decision log before implementing business calculations. Preserve existing dashboard options and interactions. The backend language, source platform and hosting remain the team's choice.

Suggested handoff meeting: approve metric definitions and source mapping first, agree identity/access and the API contract second, then work through the six implementation phases and acceptance matrix. Keep the reviewed source commit as the comparison baseline; do not treat screenshot totals as production reconciliation targets.
