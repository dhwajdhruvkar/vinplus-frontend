# Vinplus backend engineering handoff

Version 1.0 · 25 September 2026 · Frontend baseline **b0873bdffb7635cd8769d3761f6b11ed4bab4924**

Build the backend behind the existing React and Vite dashboard while preserving its options, selection behavior, charts, and floating conversations interface. This guide describes the current frontend, the data it needs, the proposed service contract, and the decisions required before production integration. No backend, authentication service, provider connection, or production API currently exists in this repository.

**Read first:** sections 2–5 explain the data and calculations; sections 6–9 explain every chart and interaction; sections 10–15 define the proposed backend and messaging workflows; sections 16–19 cover implementation, verification, and unresolved decisions. The companion `backend-api.openapi.json` is a proposed contract, not a description of deployed endpoints. `frontend-function-map.md` links named functions to the exact source commit. `backend-data-dictionary.csv` is a field-level mapping for the engineer.

Repository: [vinplus-frontend](https://github.com/dhwajdhruvkar/vinplus-frontend). Reviewed implementation: [b0873bd](https://github.com/dhwajdhruvkar/vinplus-frontend/tree/b0873bdffb7635cd8769d3761f6b11ed4bab4924). Local project: `F:\vinplus`. UI labels below deliberately preserve the current spelling, including **Shop Supplies Analysiss**.

## 1 Delivery scope and ownership

The backend must supply one consistent, authorized dataset to the five KPI cards, nine charts, all drill tables, repair-order table, exports, comparisons, insights, saved notes, preferences, embeds, and conversations. UI rendering, hover effects, chart type changes, focus handling, and the launcher animation remain frontend responsibilities.

Use the backend team's existing language, database, and hosting platform. A modular service with a relational reporting store, an object store, a background worker, and a realtime event stream is a suitable starting design. Separate deployable microservices are not required. Provider adapters should be isolated from dashboard calculations so a messaging outage cannot prevent someone from reading the dashboard.

| Area | Frontend responsibility | Backend responsibility |
| --- | --- | --- |
| Dashboard | Selection state, layouts, rendering and user interactions | Authorized records, canonical calculations, groups and history |
| Filters | Draft editing, Apply, Cancel, chips and drill ownership | Validate query; intersect it with the user's allowed data |
| Tables | Presentation, selected cells and sort indicators | Stable ordering and complete paginated records |
| Exports | Existing local PNG/PDF rendering and download actions | Complete dataset exports when pagination or scale requires them |
| Notes and preferences | Editors and current controls | Per-user persistence, ownership and version conflicts |
| Insights and RCA | Drawer, prompts, selected category and period controls | Authorized aggregates, historical periods and optional grounded narrative |
| Share and inbox | Recipient selection, composer, display and badge | Identity, delivery, provider correlation, history and unread state |
| Embeds | Render allowed controls and chart state | Access checks, publication rules, expiry and revocation |
| Motion | 460 ms launcher expansion, 340 ms minimize, reduced motion | No animation endpoint or server timing dependency |

**Scope boundaries:** the platform navigation, sidebar, tab strip, Edit button, and Dashboard Analyst were intentionally removed. Do not restore them while connecting the backend. The UI has no repair-order editing workflow, so the initial API is read-only for business records. Attachments, voice calls, arbitrary mailbox browsing, message editing/deletion, and a general social inbox are not implemented frontend features.

## 2 What is real and what is sample data

There are two distinct data paths today. `App.jsx` uses `referenceSummary` for the original selection, and `getChartData` returns reference chart fixtures. Once a non-default filter or a non-month chart selection is applied, the page calculates from `records`, which contains **16 sample repair orders**. These are not the complete 446 orders shown by the initial KPI.

The visible RO numbers, basic vehicle labels, expected amounts, and collected amounts were transcribed from the reference screen. Dates, staff associations, VIN associations, status assignments, service sales, and sales-category splits were assigned for frontend demonstration. Do not migrate these fixture records into a production database as facts.

| Initial summary field | Reference value | Current display |
| --- | ---: | --- |
| `sales` | 510659.19 | $510.66K |
| `expected` | 29660.0645 | $29.66K |
| `actual` | 8379.69 | $8.38K |
| `loss` | 21280.3745 | $21.28K |
| `partial` / `total` | 307 / 446 | 307 / 446 |
| `rate` | 68.83 | 68.83% |
| `recovery` | 28.252434 | 28.25% |

Reference fixtures do not fully reconcile across panels. For example, the dealer order fixture contains 440 + 1 = 441 total records and 303 + 1 = 304 flagged records, while the KPI shows 446 and 307. The dealer-loss fixture totals 21220, whereas the KPI loss is 21280.3745. These values reflect separate visible labels, rounding, and incomplete source coverage. They are visual references, not production aggregation acceptance targets.

The sales donut has a further distinction: it includes miscellaneous sales and shop supplies, while the Total Sales KPI is labeled Labor + Parts. Its denominator must therefore not automatically be the Total Sales KPI. The reference labor-plus-parts amounts also differ slightly from the reference KPI. Production must reconcile using the approved source dataset and metric definitions.

**Integration requirement:** replace the reference/sample switch everywhere, not only in `App.jsx`. `ChartPreview`, `ChartInsights`, `analysisRows`, `weekdayMetrics`, comparison cards and dropdown options also read fixtures directly. Production must never show reference totals after an empty, failed, or unfiltered API request.

## 3 Data model and ingestion workflow

### 3.1 Establish the reporting grain

Use one normalized reporting record per closed repair order, with a stable internal `recordId`. Do not treat the visible RO number as globally unique: an RO number can be reused by different dealers or source systems. A suitable ingestion uniqueness rule is `(tenantId, sourceSystemId, dealerId, sourceRepairOrderId)`; confirm the actual upstream identifiers. Preserve the displayed RO number separately.

If the upstream platform sends line items, aggregate them to the RO grain before joining sales and shop-supplies metrics. Joining two line-item tables directly can multiply values. Model reopenings, reversals, cancelled orders, discounts, warranty/internal work, credits, tax, and late corrections explicitly. Decide which of them belong in the closed-order reporting population.

Store `closedAt` as an instant when available, the reporting timezone, and the derived business `closedDate`. Date filters are inclusive business dates. For timestamp queries, use `[start of from date, start of day after to date)` in the agreed timezone. Do not use the browser timezone or the user's current location to reinterpret dealership business dates.

### 3.2 Recommended entities

| Entity | Key information and relationships |
| --- | --- |
| Tenant | Organization, reporting currency, reporting timezone and business defaults |
| User and membership | Identity-provider subject, tenant membership, roles and allowed dealers |
| Dealer | Stable ID, display code, source mapping and timezone when different |
| Staff identity | Manager/advisor IDs and labels; historical assignments if ownership changes |
| Vehicle | Internal ID, VIN and available make/model; handle missing VINs separately |
| Repair order fact | Record ID, source key, dealer, staff, vehicle, closed date, money fields and source revision |
| Import run | Source watermark, counts, rejected rows, reconciliation status and published data version |
| Saved preference | User, dashboard, validated filter state, optional display preference and version |
| Chart snapshot | Chart ID, query context, presentation state, data version, creator and access policy |
| Chart note | Owner, chart ID, text, snapshot/reference asset, timestamps and version |
| Insight report | Snapshot, prompt, structured findings, evidence, computation/model version and owner |
| Conversation | Channel, participants, external thread identity and linked chart snapshots |
| Message | Conversation, sender, sequence, body, direction, timestamps and actual delivery status |
| Conversation member | User identity, membership policy and monotonic last-read sequence |
| Provider connection | Tenant/user binding, provider account IDs, encrypted credential reference and health |
| Outbox and provider event | Retry-safe outgoing commands and deduplicated incoming notifications |
| Export job and audit event | Authorized query snapshot, job state, expiring file location and audit metadata |

The relationships are: tenant → dealers → repair orders; each repair order references staff and a vehicle; chart snapshots describe authorized queries over repair orders; notes, insight reports, and conversations reference snapshots. Conversation members control inbox access; access to a conversation alone does not grant access to all underlying dealer records.

### 3.3 Ingestion sequence

1. Read the source incrementally using its supported cursor or changed-since watermark. Run an initial historical backfill separately.
2. Validate source identifiers, dates, currencies, decimal precision, and required relationships. Quarantine invalid rows with actionable reasons.
3. Normalize names and source codes without replacing stable IDs. Store the original source payload or an audit reference according to retention policy.
4. Upsert idempotently using source keys and source revision. Handle tombstones, reopened orders, corrections and staff reassignment rules.
5. Reconcile counts and sums by dealer and business date before publishing the reporting version.
6. Publish a new `dataVersion` atomically. Invalidate affected aggregates and cached option lists. Retain enough version history for in-flight queries and saved exports.
7. Expose freshness and import health through metadata. An old successful dataset must be labeled stale rather than silently substituted for current data.

Keep high-precision monetary values in decimal database types with source-appropriate scale, for example four fractional places if required. Do not round each record to two decimals before summing. The proposed API transports money as decimal strings; a frontend adapter converts values to JavaScript numbers for plotting while preserving exact values for reports and financial reconciliation.

### 3.4 Repair order field mapping

| Proposed API field | Current frontend field | Meaning |
| --- | --- | --- |
| `recordId` | New adapter identity | Unique row identity across dealers |
| `roNumber` | `ro` | Displayed repair-order number, kept as text |
| `dealerId`, `dealerCode` | `dealer` | Stable dealer identity and visible code |
| `dealerType` | `type` | Source classification; current literal `NULL` is a fixture value |
| `make`, `model` | Same | Vehicle labels |
| `vin` | `vin` | Vehicle identifier; null if unknown |
| `closedDate` | `date` | Business close date, YYYY-MM-DD |
| `managerId`, `managerName` | `manager` | Filter by ID, render the name |
| `advisorId`, `advisorName` | `advisor` | Filter by ID, render the name |
| `expectedShopSupplies` | `expected` | Approved expected charge or recovery basis |
| `actualShopSupplies` | `actual` | Actual collected/charged value; source meaning must be confirmed |
| `unrecoveredShopSupplies` | `loss` | Expected less actual under the approved loss policy |
| `unrecoveredPercent` | `percent` | Source-approved or consistently derived percentage |
| `laborSales`, `partSales`, `miscSales` | `labor`, `parts`, `misc` | Real source category amounts, replacing synthetic enrichment |
| `serviceSales` | `serviceSales` | The approved Labor + Parts basis for Total Sales |
| `status` | `status` | Stable enum mapped to Fully Recovered / Partially Recovered |
| `currency`, `sourceRevision` | New metadata | Unit and provenance |

The current UI uses labels as identities in many selectors. During integration, pass option objects `{id,label}` through an adapter and select IDs. Keep the visible labels unchanged. Likewise, use `recordId` as the React row key and query identity; show `roNumber` in the table. This is a required internal wiring change to support real data, not a change to the user's workflow.

## 4 Metric definitions and calculation rules

Let `R` be the complete authorized set of records after all applied filters and chart selections. Let `E(r)` be expected supplies and `A(r)` actual supplies. The current frontend calculations are:

```text
expectedAmount = SUM(E(r))
recoveredAmount = SUM(A(r))
unrecoveredAmount = expectedAmount - recoveredAmount
recordCount = COUNT(records at the RO grain)
flaggedCount = COUNT(records with loss > 0)
flaggedPercent = 100 * flaggedCount / recordCount
recoveryPercent = 100 * recoveredAmount / expectedAmount
unrecoveredPercent = 100 - recoveryPercent
compliancePercent = 100 - flaggedPercent
totalSales = SUM(serviceSales)
```

Current zero-denominator behavior is 0 for the corresponding percentage, including the compliance footer when there are zero records. Return a `noData` flag as well so zero activity is distinguishable from unavailable data. Do not return `Infinity`, `NaN`, or a fabricated comparison percentage.

**Business decisions required:** confirm whether loss is a signed net shortfall or `MAX(expected-actual,0)` per order; whether over-recovery offsets other losses; whether “partial” includes zero recovery; and whether the recovery KPI covers all selected records or only flagged records. Current fixtures treat every positive loss as Partially Recovered, including actual = 0, and the summary sums all selected rows despite “Amount of Flagged Records” wording. Preserve that behavior for parity unless the product owner approves a revised metric definition.

Expected supplies must come from a source amount or an agreed calculation policy, such as a rate and cap. No such business charging policy exists in the frontend. Do not infer one from the frequently occurring 119 fixture value. The current `serviceSales = expected * 17.22`, labor allocation of 57%, and miscellaneous allocation of 18% are sample generators and must be removed from the production path.

Percentages must use the right denominator. Group recovery is a ratio of group sums, not an average of each order's recovery percentage. Flagged percentage uses order counts, not currency. Day, weekday and month rates must be recomputed within each bucket. Never sum percentages across buckets.

The frontend deliberately preserves a source percentage of 33.33% for RO 164670 even though calculations from the displayed rounded amounts can differ. Decide whether the upstream high-precision percentage is authoritative or whether the backend will recompute it from unrounded source amounts. Return the chosen canonical value consistently for tables, sorting and exports. The current RO table displays the supplied percentage but sorts using `loss/expected`; record that discrepancy as an integration decision, not a second business rule.

## 5 All five KPI cards

| Card and frontend metric | Required backend values | Footer behavior |
| --- | --- | --- |
| Total Sales `sales` | `totalSales` | Expected Shop Supplies Recovery = `expectedAmount` |
| Shop Supplies Partial Recovery `partial` | `flaggedCount` / `recordCount` | Shop Supplies Partial Recovery Amount currently repeats `expectedAmount`; confirm scope |
| Partial Recovery % `rate` | `flaggedPercent` | Compliance Rate = `100 - flaggedPercent`, or 0 for no rows |
| Shop Supplies Recovery Status `actual` | `recoveredAmount` / `expectedAmount` | Shop Supplies Recovery % = `recoveryPercent` |
| Unrecovered Shop Supplies `loss` | `unrecoveredAmount` | Unrecovered % = `100 - recoveryPercent`, or 0 for zero expected |

Each card starts with a February mark. Clicking it expands that same card into a weekday breakdown and adds the shared `Mon - Close date: Feb` chip. The back arrow returns only that card to its monthly mark and leaves the month chip in place. Clicking or focusing a weekday shows its metric; it does not create another filter or drill level. Dashboard Reset clears filters and chart drill state but leaves an already expanded KPI weekday view open.

The production response should provide weekday buckets with ISO weekday number 1–7, label, and the same summary fields used above. The current default fixtures show Monday–Saturday; the filtered path also shows Sunday if its selected metric is nonzero. Keep ordering deterministic and agree whether zero Sunday should remain omitted for parity. The API may return all seven buckets and let the renderer apply that display rule.

**Required frontend integration:** replace the hard-coded `2024-02`, `Feb`, and `Feb-2024` in `App`, `KpiMiniChart`, `DashboardChart`, `ChartPreview`, and analysis functions with a response bucket key and label. For multi-month queries, agree the KPI drill scope: selected month or whole selected period. The present UI represents only one month and cannot correctly imply a multi-month drill without this decision.

## 6 Chart by chart specification

Every chart uses the same authorized query context. The chart API returns stable category keys, display labels, raw metric values and units, with the same `dataVersion` and `queryHash` as the summary. Axis limits and compact labels remain presentation concerns. Do not send formatted strings such as `$21.20 K` as metric values.

### 6.1 dealerOrders

**Title:** Partial Recovery Repair Orders by Dealer. Default: vertical columns. Green = total records by dealer; yellow = flagged records by dealer. Group `R` by dealer and return `recordCount` and `flaggedCount`.

The legacy chart row uses `expected` for the total count and `actual` for the flagged count. These are aliases, not money. Map `recordCount → expected`, `flaggedCount → actual` only at the renderer boundary. Both marks select the dealer, add a `Flagged Record` chip owned by `dealerOrders`, and keep this panel as a chart at level 0. Other panels filter to the selected dealer. Clicking the flagged bar does **not** separately restrict to flagged orders today.

The default fixture is 6385: 440 / 303 and SHELTON: 1 / 1. Treat this as a visual example. The backend must support missing dealer values as an explicit null category, not a real dealer ID named `(Blank)`.

### 6.2 dealerLoss

**Title:** Unrecovered Shop Supplies by Dealer. Default: horizontal red bars. Group `R` by dealer; return `unrecoveredAmount`. Map it to `loss` for the existing renderer.

Selecting a bar applies a dealer selection owned by `dealerLoss`, adds the `Unrecovered SS` chip and enters level 1. Breadcrumbs: Unrecovered SS → Detail. The inline detail table contains dealer, RO, sales categories, expected/actual supplies and recovery percentages. Clicking cells in this particular table highlights them but does not apply another RO filter. Up clears this panel's dealer selection and restores the chart while keeping other panels' filters.

### 6.3 salesMix

**Title:** Unrecovered Shop Supplies Sales Metrics Breakdown. Default: donut. Four buckets: Misc Sales, Labor Sales, Part Sales, Shop Supplies. Amounts are respectively sums of miscellaneous, labor, parts and actual shop supplies. Each slice's share is its amount divided by the sum of all four slices. The donut therefore has a different scope from the Labor + Parts KPI.

Selecting a slice highlights/offsets that slice; it does not cross-filter the main dashboard. A slice can be selected inside Guided RCA for category-specific analysis. There is no normal inline detail drill, chart-type picker or metric sort for the donut. Its More, insights, info, refresh and export options remain available. Decide how to represent negative or zero sales categories before production; a donut cannot meaningfully plot arbitrary negative amounts as positive wedges.

### 6.4 manager

**Title:** Manager Performance Analysis. Default: green expected and yellow actual columns, with a loss line/points. Group `R` by manager. Return expected, recovered and unrecovered amounts. Map the two bar series to `expected` and `actual`; the current column renderer derives the loss line from their difference.

Selection sequence: manager mark → level 1 Manager Details, which aggregates sales and recovery by manager and counts distinct advisors/dealers; manager cell → level 2 Status Detail, grouped by recovery status; status cell → applies that status at depth 3 while staying on the status table. Breadcrumbs: Manager Name → Manager Details → Status Detail.

The parent manager selection must remain when applying a status. Drilling up or removing a parent chip removes this panel's dependent selections. The frontend's reducer is the exact ownership model to preserve. Distinct staff/dealer counts must use stable IDs and the approved missing-value policy; fixture `Set` counts currently include blank labels.

### 6.5 advisor

**Title:** Service Advisor Performance. Default: yellow RO count and red unrecovered-amount horizontal bars. Group `R` by advisor and return `recordCount` and `unrecoveredAmount`. The adjacent Service Advisor selector is another applied multi-select filter; it intersects with chart selections.

Current yellow bar widths are visually multiplied by 60 in the reference view and 10 in filtered views so counts share a chart with dollars. These factors are rendering choices, not business data. Return unscaled counts and dollars with separate unit metadata. Preserve displayed count values. A later decision to use two axes or separate charts requires UI approval.

Selecting either mark applies the advisor selection and opens level 1 RO Details. An RO cell adds a deeper RO selection, globally filtering the dashboard without replacing the advisor parent. The table shows advisor, sales manager, RO, expected supplies, actual supplies and loss.

### 6.6 monthly

**Title:** Monthly Unrecovered Shop Supplies Trend. Default: a point/line for monthly loss. Production must group `R` by business close month and return sorted `YYYY-MM` keys with unrecovered totals. The frontend currently draws one February point containing the entire summary loss; it does not already support arbitrary historical month buckets correctly.

Selecting a month adds a `Monthly` chip, enters level 1 and changes the heading to Monthly Unrecovered Shop Supplies. The detail table contains RO, advisor, manager, month, sales categories and recovery amounts. An RO cell adds a deeper selection. Use the selected month key from the chart response, not the hard-coded February key.

### 6.7 vinOrders

**Title:** Partial Recovery Repair Orders by VIN. Default: green total count and red partial-recovery count bars. Group `R` by vehicle/VIN, count orders and count flagged orders. Map count fields to the renderer's `expected`/`actual` aliases, as for dealerOrders.

Selecting either mark adds a VIN selection owned by `vinOrders`, with the existing label `Flagg Records Vin`, and leaves the panel at chart level 0. It does not automatically add a status filter. Never merge every missing VIN into a real vehicle; display a null category while retaining distinct order identity.

### 6.8 vinLoss

**Title:** Unrecovered Shop Supplies by VIN. Default: red loss bars. Group `R` by VIN and return unrecovered amounts. Selecting a VIN enters level 1 and adds an `Unrecovered S S` chip. The detail table contains VIN, RO, sales categories and recovery amounts. Selecting an RO adds a deeper RO selection.

The current sort label is **Total Ideal Cost by VIN**, but it sorts `loss`. The level-0 Table view uses columns **Unrecovered S S** and **Total Ideal Cost By VIN**, with the amount displayed as an integer. Chart labels and other tables retain monetary formatting. Return the precise loss once; rounding is a view rule. Confirm whether the visible ideal-cost wording should remain, but do not silently reinterpret it as expected supplies.

### 6.9 recurring

**Title:** Recurring Shop Supplies Shortfall by Vehicle. Default: green expected-amount bars and yellow count bars. The filtered implementation simply groups all selected records by VIN, sums expected supplies and counts all rows. It does not enforce a recurrence threshold and includes vehicles with one order. Some reference green values look like loss figures rather than expected values. This requires a product/data-owner decision.

For exact current behavior, return `expectedAmount` and `recordCount`; map them to `expected` and `count`. For a real recurrence rule, define the lookback period, minimum number of distinct qualifying orders, qualifying loss/status, and whether the amount means expected, total loss, or another measure. Implement that rule only after approval and add a `metricDefinitionVersion`.

Selecting a vehicle enters level 1 and adds a VIN chip. The detail table contains VIN, RO, dealer, sales categories, Total Shop Supplies, Expected Shop Supplies and Recovered Shop Supplies. Both “Total Shop Supplies” and “Expected Shop Supplies” currently read the same `expected` field. An RO click adds a `Detail` selection. Count widths use the same presentation scaling convention as advisor bars; the API must return real counts.

## 7 Detail tables and repair order behavior

The following column order is part of the current experience. Repeated aliases are intentional descriptions of the current code, not recommended duplicate database columns.

| View | Columns in order |
| --- | --- |
| Main RO Details | RO Number; Dealer Code; Dealer Type; Make; Model; Expected Shop Supplies; Actual Shop Supplies; Unrecovered Shop Supplies; Unrecovered % |
| Dealer loss detail | Dealer; RO Number; Part Sales; Misc Sales; Labor Sales; Shop Supplies; Expected Shop Supplies; Actual Shop Supplies; Collected Shop Supplies Rate; Unrecovered Shop Supplies Rate |
| Manager detail | Manager; No of Service Advisor; No of Dealer; No of RO Number; Part Sales; Misc Sales; Labor Sales; Shop Supplies; Expected Shop Supplies; Actual Shop Supplies; Unrecovered Shop Supplies |
| Status detail | Status Detail; Part Sales; Misc Sales; Labor Sales; Shop Supplies; Expected Shop Supplies; Actual Shop Supplies; Unrecovered Shop Supplies |
| Advisor detail | Service Advisor; Sales Manager; RO Number; Expected Shop Supplies; Actual Shop Supplies; Unrecovered Shop Supplies |
| Monthly detail | RO Number; Service Advisor; Sales Manager; Month; Part Sales; Misc Sales; Labor Sales; Shop Supplies; Expected Shop Supplies; Actual Shop Supplies; Unrecovered Shop Supplies |
| VIN loss detail | VIN; RO Number; Part Sales; Misc Sales; Labor Sales; Shop Supplies; Expected Shop Supplies; Actual Shop Supplies; Unrecovered Shop Supplies |
| Recurring detail | Vin; RO Number; Dealer; Part Sales; Misc Sales; Labor Sales; Shop Supplies; Total Shop Supplies; Expected Shop Supplies; Recovered Shop Supplies |

“Shop Supplies” in the shared sales-column group is currently `actual`, so some tables display the actual amount twice under different labels. Return a single canonical amount; the frontend maps it to both requested columns. The two recurring expected columns have the same situation.

Table headings toggle ascending/descending sorting. Main RO number buttons apply a `records`-owned selection. SearchSelect for Repair Order No supports multiple values with Apply/Cancel. The Status area supports Select all, Fully Recovered, Partially Recovered, search of these labels, and reset. Selecting both statuses or clearing both currently normalizes to unrestricted status, not an empty dataset.

Sort the complete authorized result on the server before cursor pagination, adding `recordId` as a deterministic tie-breaker. A new query, sort or data version must invalidate the previous cursor. Return `totalCount`, `nextCursor`, and completeness metadata. Do not compute KPI totals from the currently loaded table page. Default page size 100 and maximum 500 are proposed operational defaults, subject to load testing.

The current Info popover says **Data display limit : 35000**. That is static source UI text, not an implemented 35,000-record server contract. Agree actual chart cardinality limits, explicit truncation metadata and full-export limits. Do not silently discard categories to match that label.

## 8 Filters and drill selection semantics

The frontend deliberately stores drawer filters separately from chart selections. A typical current state is:

```json
{
  "filters": {
    "from": "2024-02-01", "to": "2024-02-13",
    "manager": ["Abbas-Haider"], "advisor": "",
    "status": "", "vin": "", "ro": "", "query": ""
  },
  "interactions": {
    "selections": [
      {"id":"dealerOrders-0","owner":"dealerOrders","field":"dealer","value":"6385","depth":0,"label":"Flagged Record","displayValue":"6385"},
      {"id":"manager-1","owner":"manager","field":"manager","value":"Abbas-Haider","depth":1,"label":"Manager","displayValue":"Abbas-Haider"}
    ],
    "levels": {"manager":1}
  }
}
```

Production requests use stable IDs, but must retain this logic:

- Values within a multi-select filter are OR alternatives. Different filters are AND conditions.
- Every chart selection is also an AND condition, including two different owners selecting the same field. Do not collapse owner selections into a single last-wins dictionary.
- Example: dealerOrders selects dealer A and dealerLoss selects dealer B. The result is empty. It is not `dealer IN (A,B)`.
- Selecting a new category at the same owner/depth replaces that owner's selection at that depth and deeper depths. Other owners stay unchanged.
- Removing a chip removes that owner's selection and dependent deeper selections. Up and per-panel refresh use the same ownership rule.
- Date bounds are inclusive. Empty string or empty array currently means no restriction. The proposed API normalizes empty values to null/empty arrays.
- `(Blank)` is a display sentinel for missing group values. Translate it to a null predicate; never query for the literal string in production IDs.
- The `query` filter performs case-insensitive substring matching across RO, dealer, make, model, manager, advisor and VIN. It is supported in the model, but the main toolbar currently has no dedicated global search input. Do not confuse it with the filter-label search or a dropdown's local option search.

The filter drawer edits a draft. Search filter only hides/shows filter controls by their labels. Apply validates dates, commits the draft and closes the drawer. Save Preferences saves the draft without applying it. Reset Filters resets the drawer draft only. Loading a preference in the drawer also changes only its draft; View preference → Load saved filters applies a saved preference to the page. Loading filters does not automatically clear chart-owned selections today.

Global Reset restores default filters and clears all chart selections/levels. A chart Refresh resets that panel's mode, sort and owned selections while leaving drawer filters and other panel selections intact. The backend sees the resulting query; it does not need separate “reset chart” or “change hover” endpoints.

## 9 Every toolbar feature and its service boundary

### 9.1 Main toolbar

About shows the page purpose and current period. Insights summarizes flagged counts, recovery and loss from the current summary; Review repair orders scrolls to the RO table. Filters opens the draft drawer. Reset follows section 8. View preference offers Larger summary cards, a local layout state, and Load saved filters. More Options contains Export repair orders (CSV), View RO Details and Dashboard help. Help and navigation require no data mutation endpoint.

### 9.2 Chart actions

Bar, area, column, lollipop and line modes change how the same values are rendered. Mode switching does not change which records contribute. Donut and RO table do not offer these alternatives. Chart sort uses a field/direction draft with Cancel and Apply; VIN-loss uses its source-specific sort label. Full screen retains interactivity and keyboard handling. Table view is a separate sortable modal over the chart's current aggregated or drill rows. Info displays the existing static display-limit text.

Keep chart mode, fullscreen, selected/highlighted cells, tooltip state, local comparison layout, animation phase and menu-open state in React. Include mode, sort and drill level in a saved chart snapshot when relevant, but do not treat them as business filters.

### 9.3 Exports

Current chart exports are real local files: CSV uses active columns, Excel preserves numeric cell types, PNG rasterizes the current chart/table, and PDF paginates tall rendered content. Comparison exports support PNG and PDF. The main toolbar exports the currently filtered RO set as CSV. There is no existing server export service.

For production, leave small visual PNG/PDF rendering in the frontend where appropriate. Add an export job for complete paginated datasets and large reports. The job must capture query, active view/columns, explicit ordering, data version, user and allowed scope. Return queued/running/ready/failed/expired, a row count, and an expiring download location. Use the authenticated `/exports/{exportId}/download` route to recheck access at download time. If that route redirects to a presigned object-store URL, that URL may remain usable until expiry; use an authenticated streaming proxy when immediate revocation is required. No mechanism can recall a file already downloaded.

The current detail-table heading sort is local to DetailTable/RecordsTable and is not automatically passed back to ChartPanel's CSV/Excel export. The main CSV also does not use RecordsTable's local sort. Decide whether to preserve source order or synchronize table/export order; document the chosen contract and test it. Never claim every local export already follows the visible table heading sort.

Escape CSV formula-like text, preserve RO numbers/VINs as text in spreadsheets, and apply the same canonical percentage as the table. Avoid logging exported contents. A chart PNG shared externally is a data disclosure, even if the dashboard URL remains private.

### 9.4 Quick compare

Quick compare has Original, Add comparison, removal of copies, 1/2/3 Grid, independent Filters and Reset per card, chart category selection per card, and Image/PDF export. Local changes never mutate the main dashboard or sibling cards.

Today each comparison filters the `rows` passed from the already filtered dashboard, so it can narrow that set but cannot expand beyond it. The initial unfiltered chart may still use reference fixtures. Do not accidentally turn that limitation into a permanent server restriction. Proposed production behavior is an independent query per comparison card starting from the dashboard snapshot, retaining its inherited chart selections, and allowing its date/filter changes within the user's authorized universe. Obtain approval if this expands the current comparison semantics. Each card records its own `queryHash`; use a common data version for a fair comparison.

### 9.5 AI Insights and Guided RCA

AI Insights currently generates deterministic totals and highest/lowest rankings, not model output. Prompt words such as “lowest” change the ranking direction; arbitrary prompts are not actually understood. Percentage columns use a simple average in these local findings. Saved insights contain findings, optional prompt and a local timestamp. The main dashboard Insights dialog is a separate simple summary.

Proposed backend first release: preserve Generate, prompt input, Current/Saved and Save insight; return structured, reproducible findings with metric IDs, values, category keys and evidence. If a language model is added, give it only authorized aggregates, attach a snapshot/data version and label the method. Do not let prompt text become SQL. Never present correlation as a proven cause.

Guided RCA supports category selection, Auto RCA, `closedate`, YTD/QTD/MTD, Fit to width, Reset RCA and point selection. Auto RCA selects the largest value of the first configured metric; it does not establish a causal driver. The current period function groups records by year, quarter or month and compares each bucket with the preceding **available** bucket. These are not complete true year-to-date/quarter-to-date/month-to-date calculations. A missing/zero previous value produces null change.

Agree period semantics before implementing historical RCA. Proposed API uses explicit `grain: year|quarter|month` and `comparison: previousAvailable|previousCalendar`; it does not silently reinterpret the visible buttons. True to-date analysis additionally needs an as-of date and comparable prior-period boundaries. Counts use RO count, money uses unrounded sums, and percentages use defined ratios. Return coverage flags for incomplete historical periods. Fit to width and Reset RCA remain frontend view actions.

### 9.6 Notes and preferences

Notes support multiple entries, adding/editing/removing, selection, optional chart-reference images, and cancel/save. The image is captured when Notes is opened, and existing notes retain their original image unless changed. Store note text, owner, chart ID, snapshot ID, created/updated times, optional image asset ID and version. Use an authenticated upload flow with type/size checks for images; do not store large data URLs in a relational text column by default.

Use optimistic version checks when updating notes and preferences. A conflict should keep the user's draft and return a useful reload/merge message. Preserve existing controls; no backend-only edit capability should appear unexpectedly in the UI. Define private-by-default notes unless shared-note access is explicitly approved.

### 9.7 Embed

The existing modal offers Public, Private and disabled Private with SSO. It can include current filters, title, chart-type controls, info, sort, refresh and individual PDF/Image/Excel/CSV actions. Generate creates a local `?chart=...&config=...` link and iframe snippet. “Private” is presently just URL configuration, not authentication.

Production Generate should create a server-managed embed definition. Private embeds authenticate and recheck tenant/dealer access for every data query. Public embeds require an explicit publication permission and a reviewed data scope; possession of a frontend config JSON must never make business records public. Use revocable IDs/tokens, expiry, allowed frame origins and per-embed export permissions. Keep SSO disabled until the actual identity flow exists. Share links do not grant access automatically, and a localhost link is not usable by a remote recipient.

## 10 Proposed API contract

The companion OpenAPI 3.1 JSON defines a reviewable starting contract under `/api/v1`. The names and limits below are proposals. The backend and frontend teams must agree them before integration; the current app calls none of them.

### 10.1 Request and response conventions

Use authenticated same-origin sessions where feasible. Tenant and user identity come from the session, not an unchecked body field. All reads apply authorized dealer/record scope. Mutations use CSRF protection when cookie-authenticated, plus `Idempotency-Key` for retryable creates/sends and version checks for updates. The OpenAPI cookie/CSRF names are examples to agree with the identity implementation.

Use stable IDs in filters and selections. Return dates as ISO strings, UTC timestamps with timezone offsets, money as decimal strings, counts as integers and percentages as JSON numbers representing 0–100 scale, not fractions. Negative or >100 recovery percentages may occur under an approved over-recovery policy; do not clamp them silently. Currency must be explicit. Cross-currency sums are not allowed without an approved conversion basis.

Every analytics response includes `requestId`, `dataVersion`, `queryHash`, `generatedAt`, `sourceUpdatedAt`, `currency`, `reportingTimezone`, and `complete`. Pagination and truncation are distinct: a paginated table can still have an accurate full total; a truncated chart must state what is missing. Errors use `{error:{code,message,requestId,fieldErrors,retryable}}` and appropriate HTTP status. Authentication failures, no permission, invalid filters, stale data versions, rate limits and upstream unavailability are not empty datasets.

```json
{
  "context": {
    "filters": {
      "from":"2024-02-01", "to":"2024-02-13",
      "managerIds":["manager_demo_1"], "advisorIds":[],
      "statuses":[], "vins":[], "recordIds":[], "query":""
    },
    "selections":[
      {"owner":"dealerOrders","field":"dealerId","value":"dealer_demo_6385","depth":0}
    ],
    "dataVersion":null
  },
  "chartIds":["dealerOrders","dealerLoss","salesMix","manager","advisor","monthly","vinOrders","vinLoss","recurring"],
  "includeWeekdays":true
}
```

First query may omit a data version. The server returns one; subsequent chart details, comparisons and exports can pin it. A stale/expired version returns a specific conflict and the frontend refreshes the full view coherently. Never mix one dealer's new imports in a KPI with old detail rows from another response without showing the version boundary.

### 10.2 Endpoint inventory

| Operation | Proposed endpoint | Used by |
| --- | --- | --- |
| Read identity and capabilities | GET `/session` | App bootstrap and action availability |
| Filter option search | POST `/dashboard/options/query` | FilterDrawer, advisor, VIN, RO selectors |
| Summary and chart overview | POST `/dashboard/query` | App, KPI cards, nine chart panels |
| Chart or drill rows | POST `/charts/{chartId}/query` | ChartPanel, detail tables, comparisons |
| Paginated repair orders | POST `/repair-orders/query` | Main RO table and record detail views |
| Read/save dashboard preference | GET/PUT `/preferences/{dashboardId}` | Save/Load filter preferences |
| List/create notes | GET/POST `/charts/{chartId}/notes` | Notes drawer |
| Update/remove a note | PATCH/DELETE `/notes/{noteId}` | Note editing/removal |
| Generate/list insight reports | POST/GET `/insight-reports` | Generate, prompts, Saved list |
| Poll an insight report | GET `/insight-reports/{reportId}` | Resolve queued/running reports and realtime events |
| Save generated insight | POST `/insight-reports/{reportId}/save` | Save insight |
| Calculate RCA periods | POST `/analysis/periods` | Guided RCA |
| Create/read snapshot | POST `/snapshots`, GET `/snapshots/{snapshotId}` | Notes, shares, export provenance |
| Create/revoke embed | POST `/embeds`, DELETE `/embeds/{embedId}` | Generate embed and administrative revocation |
| Read an embed definition | GET `/embeds/{embedId}` | Hosted embedded chart; token/access checks |
| Create/read export job | POST `/exports`, GET `/exports/{exportId}` | Full dataset CSV/Excel and large reports |
| Download export | GET `/exports/{exportId}/download` | Authorized access to a completed export |
| Create upload authorization | POST `/assets/uploads` | Optional saved chart reference image |
| Read connection capability | GET `/integrations` | Share validation and inbox connection state |
| Begin/disconnect connection | POST `/integrations/{provider}/connect`, DELETE `/integrations/{provider}` | Account setup flow outside the current dashboard |
| Search real recipients | GET `/recipients` | Share recipient/channel picker |
| Start sharing | POST `/shares` | Existing Share submit |
| List conversations | GET `/conversations` | Launcher, tabs, recipient/thread selector |
| Read a conversation | GET `/conversations/{conversationId}` | Refetch a thread after an event or selection |
| Read/send thread messages | GET/POST `/conversations/{conversationId}/messages` | Message history and composer |
| Mark read | PUT `/conversations/{conversationId}/read` | Visible focused thread at the latest message |
| Realtime events | GET `/events` | Inbox updates and export completion |

Provider OAuth callbacks and provider webhooks are separate server-to-server routes, not public browser data APIs. Implement them to the provider's specification rather than treating them as normal session endpoints. They are described in sections 13–14 and intentionally are not faked as existing frontend routes.

### 10.3 Frontend adapter mapping

The proposed summary response uses `totalSales`, `expectedAmount`, `recoveredAmount`, `unrecoveredAmount`, `flaggedCount`, `recordCount`, `flaggedPercent`, and `recoveryPercent`. Map these to current `sales`, `expected`, `actual`, `loss`, `partial`, `total`, `rate`, `recovery`. Do not let existing components independently recompute summary totals from a table page.

Chart rows use canonical fields such as `key`, `label`, `recordCount`, `flaggedCount`, `expectedAmount`, `recoveredAmount`, `unrecoveredAmount`, `laborSales`, `partSales`, `miscSales`, `advisorCount` and `dealerCount`. Map each chart's aliases using section 6. Do not map label to ID. Detail schemas distinguish record rows from manager/status aggregate rows. The frontend renderer may continue using its observed column labels and order.

For existing detail-table columns, map `laborSales → labor`, `partSales → parts`, `miscSales → misc`, `advisorCount → advisors`, `dealerCount → dealers` and `recordCount → count`. Map the manager/status bucket label to the corresponding visible `manager`/`status` cell while retaining its separate stable key for selection. Derive the `month` label from `closedDate` and the reporting locale; derive `collected` as `100 * actualShopSupplies / expectedShopSupplies`, or zero for a zero denominator. Replacing `enrichRecord` must remove its invented sales amounts while preserving these display aliases and computed labels.

### 10.4 Worked examples and reconciliation fixture

`backend-api-examples.json` contains schema-linked request/response examples, including all nine charts, manager status drill, shares, queued sends, incoming replies, read markers and event notifications. Its three fictional repair orders form a small contract-verification dataset, separate from the screen fixtures. Their expected total is 250, recovered total 160, unrecovered total 90, sales total 1800 and flagged count 2 of 3. Recovery is 64%; flagged percentage is 66.666…%. The donut's four categories total 2050 because it has a different denominator.

Recompute these values from the included records using decimal arithmetic; do not hard-code the response examples into a service. The recurring example deliberately includes a single-order vehicle to reflect the current frontend rule. Update that acceptance case only after the recurrence decision is approved. Example IDs and URLs are fictional and confer no access.

Cancel superseded requests and ignore late responses using a request generation or query hash. Keep the last successful result only while clearly showing loading/stale status. On a permission or authentication failure, remove inaccessible data immediately. Never show a fixture fallback to make a failed request look successful.

## 11 Persistence migration and compatibility

| Current browser key/state | Current content | Production destination |
| --- | --- | --- |
| `shop-supplies-view-v1` | Saved filters | User/dashboard preference |
| `vinplus-notes-{chartId}` | Note array and optional PNG data URLs | Notes plus authorized object storage |
| `vinplus-chart-note-{chartId}` | Legacy note text | Optional explicit import to notes |
| `vinplus-insights-{chartId}` | Local generated reports | Saved insight reports with provenance |
| `vinplus-share-{chartId}` | Last platform/recipient/comment draft | Draft only; never an automatic send |
| `vinplus-conversations-v1` | Local preview history and read flags | Server conversation/message/member records |
| In-memory composer drafts | Unsubmitted text by thread | Keep local session drafts or add user-scoped draft storage |
| Filters, modes, sorts, menus, compare layout | React state | Mostly frontend; snapshots preserve selected state when needed |

Do not automatically import sample conversations as actual messages or deliver previously saved drafts when enabling a provider. Use an explicit preview/live environment boundary. Existing preview history has a limit of 100 conversations and 200 messages per conversation; those browser limits must not become an undocumented server retention policy. Decide real retention, deletion and audit needs with the organization.

There is no authenticated user boundary around current localStorage. When real identity is introduced, prevent one signed-in user's cached data appearing for another user in the same browser. Clear or namespace state on logout and tenant changes. Store provider secrets on the server, never in `VITE_*` variables, localStorage or share URLs.

## 12 Share and conversation workflow

### 12.1 Current frontend behavior

Share offers In-app, WhatsApp, Teams and Outlook, accepts multiple platform selections, requires at least one selected recipient per platform, and accepts an optional comment. Teams currently lists sample channels, not live direct-message users. Recipient names for other platforms come from manager/advisor fixtures; no email address, phone verification or real directory lookup exists.

Submitting Share preserves the old local draft and opens a conversation. The preview creates one thread per chart/channel/recipient, reuses it when the same combination is shared again, appends the comment, and updates the pinned chart snapshot. Multiple recipients create separate threads; a named group/channel is one recipient target. No real message is sent.

The circular launcher opens/minimizes the floating panel. Tabs filter by Outlook, Teams, WhatsApp and In-app. The panel contains a recipient/thread selector, pinned shared-chart link, message log, draft composer and an explicit Preview incoming reply control. The sample reply is scheduled after three seconds. There is no spontaneous simulated human response. Unread badges count incoming unread messages; reading the latest messages in a focused visible thread clears only that thread. Reading older messages or leaving another channel selected retains unread state. Escape minimizes; draft text survives minimizing and thread changes during the page session.

### 12.2 Production outgoing sequence

1. Fetch connection capabilities and searchable recipients. Each option returns stable recipient ID, display label, target kind, channel availability and an actionable reason when sending is unavailable.
2. Share submits a snapshot reference/context, channel targets and comment with a stable idempotency key. Names, chart titles and caller-provided IDs are not authorization proof.
3. Server verifies session, chart query scope, share permission, recipient eligibility, external policy and allowed content. Create a secure snapshot/link with the approved visibility; do not send a localhost URL.
4. Persist the share request, per-target delivery work, conversation linkage, initial message and outbox command in one transaction. Different targets may succeed or fail independently.
5. Return accepted conversations/messages to the frontend. Open the relevant thread and show pending/queued status. A successful HTTP response does not automatically mean the recipient received the message.
6. A worker calls the correct provider adapter. Persist provider message/thread IDs. Retry transient failures with backoff; preserve the same idempotency identity. Reconcile ambiguous timeouts before resending.
7. Publish status events only to authorized participants. Failed delivery keeps the message, draft content and a retry action; changing the recipient or content creates a new send operation.

Suggested send body:

```json
{
  "snapshotId":"snapshot_demo_1",
  "targets":[
    {"channel":"outlook","recipientId":"recipient_demo_1","targetKind":"person"},
    {"channel":"teams","recipientId":"channel_demo_service","targetKind":"channel"}
  ],
  "comment":"Please review this chart."
}
```

### 12.3 Production incoming sequence

1. Provider webhook receives an incoming message or delivery-status notification. Validate the provider-specific authenticity checks, subscription binding and target account.
2. Deduplicate using provider account + provider event/message identity. Queue durable processing and acknowledge according to provider timing requirements.
3. Resolve the exact conversation using channel-native IDs and participant/account scope. Do not route solely by recipient display name, subject text, or “most recently shared chart.”
4. Persist the message with a monotonic thread sequence. Update per-user unread counts only for participants who have not read that sequence. Provider read receipts and the dashboard's own unread count are separate concepts.
5. Publish a minimal authorized event. The frontend fetches/merges the message, updates the red badge, and never opens the panel automatically merely because a message arrived.
6. On opening the latest messages, submit `lastReadSequence`. The server advances it monotonically. A concurrent newer reply remains unread.

```json
{
  "eventId":"event_demo_102",
  "type":"message.created",
  "conversationId":"conversation_demo_1",
  "revision":12,
  "messageId":"message_demo_9",
  "sequence":9,
  "occurredAt":"2026-09-25T10:30:00Z"
}
```

Use replayable SSE or WebSocket delivery with an event cursor. On disconnect, reconnect and resynchronize authorized conversations; a browser badge is not authoritative storage. Handle duplicates, out-of-order events, revoked access, expired sessions and missed-event windows. Provider credentials never enter this stream.

### 12.4 Linking conversations to charts correctly

The local per-chart thread key is convenient for a preview but does not describe every provider's actual conversation model. A Teams one-to-one chat and a WhatsApp phone conversation may contain discussion of several charts. Model a provider conversation separately from its linked snapshots/messages. A single provider reply cannot safely be copied into every chart-specific thread.

Use explicit reply-to context where supported. Teams channel replies attach to a root message; email has message/thread identities; WhatsApp replies may reference a previous message. An unthreaded message with several possible chart contexts should remain in the channel conversation with an unassigned/ambiguous chart context until resolved. If necessary, present one provider thread with several shared-chart cards. Any such UI adjustment must be agreed with the product owner rather than hidden in a backend heuristic.

Do not automatically mirror Outlook messages into WhatsApp or Teams. Each selected channel remains a distinct delivery/conversation with its own permissions, recipients and statuses.

## 13 Microsoft Outlook and Teams integration

### 13.1 Outlook

Use Microsoft Graph with a connected Microsoft account and an approved mailbox access model. Sending mail uses `Mail.Send`; reading full reply content and mailbox notifications needs appropriate read access such as `Mail.Read`. Microsoft documents that `sendMail` returns `202 Accepted` with no response body; this means accepted for processing, not delivered. [Send mail](https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0)

Prefer creating a draft and persisting its identity before sending when robust correlation requires it. Creating that draft requires `Mail.ReadWrite` as well as the permission used to send it, so choose this approach deliberately during consent design. Preserve durable correlation across the draft-to-sent transition instead of assuming every provider ID remains unchanged. [Create a draft message](https://learn.microsoft.com/en-us/graph/api/user-post-messages?view=graph-rest-1.0)

Persist mailbox/account identity, message ID, conversation ID and Internet message identifiers where applicable. Reply using the provider's reply operation, not a new unrelated email with a copied subject. The backend's proposed approach is to track the originating share and reconcile it with Sent Items/incoming replies. A message sent manually in Outlook needs explicit linkage or an agreed matching workflow before it can be shown as a response to a dashboard chart. [Reply to a message](https://learn.microsoft.com/en-us/graph/api/message-reply?view=graph-rest-1.0)

Subscribe to relevant message changes and renew subscriptions before expiry. Shared/delegated mailboxes have different supported subscription permission models from the signed-in user's own mailbox. Review those separately; do not assume a personal delegated connection covers every shared mailbox. Recover missed notifications by reading provider changes/history according to the supported API. [Outlook change notifications](https://learn.microsoft.com/en-us/graph/outlook-change-notifications-overview)

Email replies can contain HTML, quoted history, signatures and attachments. Sanitize body content, prefer safe plain-text display initially, and decide how quoted history is collapsed. The current composer is plain text and has no attachment controls. Do not mark mail as read in Outlook merely because it was read in the dashboard unless that synchronization is an explicit product decision.

### 13.2 Teams

The current Share UI selects a Teams channel. Implement channel posting and channel-thread replies first if retaining that exact flow. A future direct-message recipient needs a directory person target and a chat adapter. Graph normal delegated chat sending uses `ChatMessage.Send`; application `Teamwork.Migrate.All` is for migration scenarios, not a shortcut for ordinary unattended user messaging. A bot is a separate identity/product choice. [Chat sending](https://learn.microsoft.com/en-us/graph/api/chat-post-messages?view=graph-rest-1.0)

For channel targets persist team ID, channel ID and root message ID, then send replies to that root thread. For person targets create or reuse the appropriate chat, persist chat ID and messages, and enforce membership. Do not assume a new one-to-one chat can isolate every shared chart. [Create chat](https://learn.microsoft.com/en-us/graph/api/chat-post?view=graph-rest-1.0), [Channel messages](https://learn.microsoft.com/en-us/graph/api/channel-post-messages?view=graph-rest-1.0), [Channel replies](https://learn.microsoft.com/en-us/graph/api/chatmessage-post-replies?view=graph-rest-1.0)

Use Teams message subscriptions scoped to authorized chats/channels. Handle subscription validation, expiry and lifecycle notifications; Microsoft requires a lifecycle notification URL for relevant subscriptions requested beyond one hour. Persist edits/deletions as updates to the same provider message identity. [Teams change notifications](https://learn.microsoft.com/en-us/graph/teams-changenotifications-chatmessage)

### 13.3 Account lifecycle

The proposed backend connection flow stores encrypted credentials or secret-manager references, requests the smallest supported permissions, validates OAuth state and redirect destinations, and records connection owner/tenant. Refresh failures should return `reauthorizationRequired` to the frontend; disconnect revokes/removes the connection as supported and stops related sends/subscriptions. Do not store a shared admin token that unintentionally exposes every employee mailbox or chat.

## 14 WhatsApp and In app integration

### 14.1 WhatsApp Business

Use the official WhatsApp Business Platform/Cloud API with an approved business account and phone-number setup. This is business messaging; it does not provide arbitrary mirroring of a user's personal WhatsApp inbox. Use Meta's supported account, recipient, message and webhook identities. Pin an API version and verify the current setup requirements when provisioning. [Meta Cloud API collection](https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api)

The current WhatsApp policy requires recipient opt-in. Initiating a conversation requires an approved message template; free-form replies are allowed within the 24-hour customer-service window opened/reset by a user message, and outside it approved templates are required. Implement eligibility on the server. A profile phone number alone is not sufficient authorization. Store the applicable opt-in evidence, opt-out state and reply-window expiry. [WhatsApp Business Messaging Policy](https://whatsappbusiness.com/policy/)

Webhook events provide incoming messages and statuses such as sent, delivered, read and failed. Subscribe the business account to the appropriate notifications and validate callbacks before accepting them. Persist provider message IDs and deduplicate retries. Never manufacture blue-tick/read status from the user opening this dashboard. [Meta webhook payload reference](https://www.postman.com/meta/whatsapp-business-platform/folder/tduohwq/webhook-payload-reference), [Webhook subscriptions](https://www.postman.com/meta/whatsapp-business-platform/folder/ozgs3jn/webhook-subscriptions)

**Frontend gap to plan:** the current generic text composer and comment box cannot by themselves handle mandatory templates. Return `canSendFreeText`, `templateRequired`, `replyWindowExpiresAt`, and a safe reason from the backend. Keep the WhatsApp option visible; disable invalid sending with an actionable explanation and add an approved-template flow when real integration begins. This is a necessary integration state, not permission to remove the channel or fake delivery.

### 14.2 In app

Create actual authenticated users/groups and participant membership. Share writes a conversation/message in the application database, and the recipient sees it through their own authorized session and event stream. Server persistence is required for both participants, browser refreshes and multiple devices. LocalStorage or a timer cannot provide another person's inbox.

A received message is unread until the recipient advances their own last-read sequence. The sender's dashboard state must not clear the recipient's unread count. Group conversations require a membership/visibility policy for past messages when members join or leave. Use the same message envelope as external providers while keeping the adapter type `in-app`.

## 15 Security reliability and operations

### 15.1 Access controls

Define capabilities rather than assuming every user can perform every action: dashboard read, allowed dealers, export, private share, external share, public embed creation, notes ownership, insights generation and integration administration. Enforce them on every query, snapshot read, note, export download, conversation, message and event stream. User-supplied `tenantId`, `recipientId`, snapshot ID or chart config never replaces server authorization.

External sharing deserves its own content policy. A private link can require login; an embedded image or exported attachment is already copied outside the dashboard. Approve recipient scope and payload before dispatch. Do not grant blanket chart access as a side effect of creating an email.

### 15.2 Validation and failure behavior

Allowlist chart IDs, metric IDs, sort fields, drill levels and filter fields. Limit date range, query length, list sizes, note/comment/body sizes, uploads, export cardinality and concurrent analysis. Bind cursors to query, user scope and data version. Escape rendered content; never evaluate provider HTML or model-generated markup as application instructions.

Use an outbox transaction for outgoing messages, a deduplicated inbox for provider events, retry budgets, exponential backoff and a dead-letter/reconciliation path. Provider APIs cannot promise exactly-once delivery after every network timeout, so detect ambiguous outcomes and reconcile instead of blindly re-sending. Validate the exact provider webhook signature/validation protocol from current documentation; a public callback URL alone is not trusted.

### 15.3 Performance and observability

Index reporting queries around tenant, dealer, closed date and stable record ID; add staff/VIN indexes according to measured access patterns. Pre-aggregate common day/dealer/staff/month summaries if needed, but retain drill-through reconciliation. Cache keys include tenant/user authorization scope, normalized filters, chart selections, metric version and data version. Never cache a private result only by URL/chart ID.

Track import lag and rejection counts, aggregate latency, query/result cardinality, failed/stale requests, export duration, provider errors, webhook lag, deduplication rate, outbox retries, subscription expiry and reconnect recovery. Log request IDs and scoped entity IDs; redact tokens, message bodies and sensitive exported records. Agree performance targets from representative load tests; no measured production SLA exists yet.

## 16 Frontend integration plan by file

| File or function group | Required change when backend is ready |
| --- | --- |
| `App`, `DashboardContext` | Bootstrap session; load one coherent overview; expose async loading/error/freshness state |
| `filterRecords`, `summarize`, `getChartData` | Keep for preview/tests; remove as production authority; map server response through adapters |
| `DashboardCharts`, `DashboardChart` | Receive server category keys/labels; request drill rows; use real month buckets |
| `KpiCards`, `KpiMiniChart`, `weekdayMetrics` | Read summary/weekday buckets; remove fixed February assumptions |
| `FilterDrawer`, `SearchSelect`, `RepairOrders` | Replace fixture options with authorized ID/label directory results and pagination/search |
| `useDashboardInteractions`, `interactionReducer` | Preserve ownership/depth semantics; serialize stable IDs into query context |
| `RecordsTable`, `DetailTable` | Use record IDs and server ordering/pagination; preserve click and heading behavior |
| `ChartPanel`, `ChartTools` | Keep menus and local modes; add async view/export states without dropping options |
| `QuickCompare`, `ComparisonCard`, `ChartPreview` | Query each comparison independently; remove direct fixture dependency |
| `ChartInsights`, `analysisRows`, `periodMetrics` | Use authorized report/period services; preserve prompts, saved views and local drawer scope |
| `ChartNotes`, `readNotes`, `storeNotes` | Move durable notes and optional images to authenticated storage |
| `ChartEmbed`, `createEmbedLink`, `readEmbed` | Request server embed definitions; enforce access outside frontend config |
| `ChartShare`, `RecipientPicker` | Load real target IDs and availability; submit idempotent share request |
| `ConversationProvider` | Replace `startConversation`, `sendDraft`, `markRead`, timers/storage with service adapters |
| `ConversationWidget`, `MessageBubble` | Render real status/errors and capabilities; keep launcher/tabs/motion; remove Preview incoming reply in live mode |
| `useLauncherMotion`, CSS, focus hooks | Keep as presentation code; do not tie animation to provider latency |
| `utils/chartExport`, `downloadRecords` | Retain local visual export path; use complete authorized export jobs when needed |

Create a small service layer, for example `api/client`, `api/dashboard`, `api/collaboration` and `adapters/dashboard`. It should normalize IDs/decimals and handle cancellation, errors and session expiry. Avoid scattering fetch calls and source-specific field conversions across chart components. The companion function map enumerates the named source functions and their existing purposes.

## 17 Implementation order and engineer deliverables

### Phase 1 Data agreement and access

Confirm source systems, reporting grain, currency/timezone, source keys, business metric decisions and dealer authorization. Deliver a signed-off data dictionary, entity model, metric-definition version and a small complete reconciliation dataset containing fully recovered, partially recovered, zero-recovery, zero-expected, over-recovered, blank and corrected records.

### Phase 2 Analytics API

Build ingestion, session/capability checks, query normalization, all nine chart aggregates, five KPIs, weekday buckets, options and paginated RO/drill rows. Deliver API examples, error cases and reconciliation tests. Connect the main page and remove production fixture fallback. Validate all filter ownership cases before adding collaboration.

### Phase 3 Persistence and analysis

Implement preferences, notes, chart snapshots, secure embeds, complete-data exports, deterministic insight reports and RCA periods. Add the appropriate loading/error/conflict states. Verify comparisons remain independent and exports represent the same authorized snapshot as the screen.

### Phase 4 In app conversations

Replace local preview state with authenticated threads, messages, membership, read markers and realtime events. Complete the two-user end-to-end flow first: sender shares; recipient receives and replies; sender sees a badge while minimized. Test separate browsers/users, multiple tabs and reconnects. Remove simulated replies from live mode.

### Phase 5 External providers

Integrate Outlook, Teams and WhatsApp through separate adapters with real test accounts, provider-native thread correlation, eligibility checks and webhook recovery. Keep a provider disabled/unconnected until its full round trip works. Do not enable all three merely because outbound sending succeeds.

### Phase 6 Production readiness

Run permission-isolation, source reconciliation, load, export, retry/replay, expiry/revocation and recovery tests. Deliver deployment configuration, schema migrations, secret and subscription rotation procedures, import/reconciliation runbooks, monitoring, rollback steps and an agreed retention policy. Roll out behind explicit preview/live configuration; the visual design should remain consistent.

## 18 Acceptance matrix

| Area | Minimum acceptance criteria |
| --- | --- |
| Overview | Five KPIs, nine charts and complete RO totals share one query/data version and reconcile |
| Filter logic | Multi-select OR; different fields AND; same-field chart owners intersect; contradictory selections return empty |
| Drill behavior | Every section 6 click and manager depth transition works; parent removal does not clear unrelated selections |
| Dates | Inclusive boundaries; dealership timezone; month/year transitions; DST where applicable; real multi-month keys |
| Money | High precision preserved; group ratios weighted correctly; zero and over-recovery policy tested; source percentages consistent |
| Missing data | Null staff/dealer/VIN categories usable; unavailable data differs from zero and from no matching records |
| Pagination | Stable sort/tie-breaker; no duplicate/skipped records; stale cursor rejected; summary not limited to loaded page |
| Comparisons | Independent context, common version where requested, no sibling/main mutation, approved widening semantics |
| Notes/preferences | Correct owner/tenant, save/load/edit/remove, conflicts preserve drafts, no accidental cross-user cache reuse |
| Exports | Correct scope/columns/numeric types; full dataset where promised; expiry and authorization; formula-safe text |
| Insights/RCA | Evidence and version attached; correct metric/period grain; missing prior comparison remains null; prompts cannot bypass access |
| Embeds | Private unauthorized access denied; public scope explicitly approved; export flags enforced; revoked/expired links stop working |
| Share | Per-target validation and results; retry idempotency; snapshot policy; no preview draft sent automatically |
| Replies | Real recipient reply reaches only the right thread/participants; ambiguous provider context is not guessed |
| Unread | Per-user, monotonic read sequence; closed panel and other tabs keep badges; concurrent/newer replies remain unread |
| Provider failures | Disconnected account, expired consent, rate limit, duplicate webhook, missed event and ambiguous timeout handled |
| WhatsApp | Opt-in, free-text window, approved template selection and opt-out enforcement tested |
| UI parity | Existing options retained; fullscreen, sorts, types, tooltip/highlight, reduced motion and launcher animation still work |

Baseline verification before backend work: the frontend at b0873bd passed 38 unit tests and a production build, with browser checks for the new Share/inbox flow. These validate local behavior, not production APIs or provider delivery. Add contract tests against the agreed OpenAPI proposal and integration tests against the real source dataset. Do not replace current reducer tests with snapshots of an incorrect new implementation.

## 19 Decisions to close before implementation

| Decision | Current observation | Owner and required outcome |
| --- | --- | --- |
| Expected-supplies formula | Only fixture/source amounts exist | Data owner approves source field or charging rule |
| Loss and partial definition | Signed loss; positive loss flags even zero recovery | Product/data owner approves net/clamped behavior and statuses |
| KPI population | Labels mention flagged records; calculations sum all selected rows | Product owner confirms denominator/population |
| Sales basis | Labor + Parts KPI versus four-category donut; fixture mismatch | Finance/data owner signs category totals and exclusions |
| Recurrence | Current grouping includes one-order vehicles | Product owner defines qualifying orders, threshold and lookback |
| VIN ideal-cost labels | Labels point to loss, integer Table view | Product owner confirms meaning and keeps/renames labels explicitly |
| Repeated detail columns | Actual/expected repeated under different labels | Product owner confirms visual parity or approved correction |
| Staff changes and nulls | Sample label-based associations | Data owner defines historical assignment and missing-value counts |
| Time/default period | Fixed February 2024 | Product owner chooses live defaults and KPI multi-month drill behavior |
| RCA periods | Buttons label YTD/QTD/MTD; code groups full available year/quarter/month | Product owner approves bucket versus true to-date comparisons |
| Compare scope | Current copies can only narrow supplied rows | Product owner approves independent source querying or strict subset behavior |
| Table/export order | Local heading sort is separate from export sort | Product owner approves consistent export-order contract |
| External identity | Teams sample channels; Outlook names; no actual connections | Tenant administrator approves mailbox/chat/channel/business-number model |
| Provider thread context | Local thread key is per chart; providers may reuse a conversation | Product/backend owner agrees unambiguous mapping and multi-chart thread UI |
| Sharing and embeds | No real permissions/publication exist | Security/product owner defines allowed recipients, public data and expiry |
| Capacity and retention | Static 35000 label, bounded browser history | Engineering/product owner sets tested limits and retention |

The backend engineer should raise these as explicit decisions rather than guessing from screenshot values. The frontend establishes the intended workflow; approved source data and metric rules establish production truth.

## 20 Reference files and provider documentation

The source of truth for observed behavior is the reviewed frontend commit, particularly `src/data/dashboard.js`, `chartData.js`, `panels.js`, `detailData.js`, `interactions.js`, `analysis.js`, `kpiData.js`, `salesMix.js`, `embed.js`, `App.jsx`, the components named in section 16 and `src/conversations`. Existing `docs/toolbar-audit.md` and `docs/interactions.md` describe the original reconstruction; their Share paragraphs predate the floating inbox. This handoff and `docs/conversations.md` describe the current Share flow.

Provider references in sections 13–14 were checked on 25 September 2026. Recheck permission matrices, provider account requirements, rate/size limits, webhook signature procedures and policy requirements during implementation. The API file uses the [OpenAPI 3.1 specification](https://spec.openapis.org/oas/v3.1.0.html). It is a design contract for team review, not a generated server or an assertion that a backend already exists.
