# Dashboard interactions

The reference was inspected in Google Chrome on September 24, 2026 at `preview.lumenore.com/vinplus/home`. The application is a standalone React/Vite frontend with local data.

## Cards and chart clicks

| Component                      | Click behavior                                                                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| All five KPI mini charts       | February switches the same card to weekday values and adds `Mon - Close date: Feb`. A weekday shows its value.                     |
| KPI back arrow                 | Returns that card to February while leaving the month chip selected.                                                               |
| Dealer order counts            | Adds the `Flagged Record` dealer selection; the panel remains a chart.                                                             |
| Unrecovered supplies by dealer | Adds `Unrecovered SS` and shows a dealer/RO sales and recovery table. Final cells can be highlighted.                              |
| Sales donut                    | Highlights or offsets individual slices without applying a global filter.                                                          |
| Manager performance            | Manager bar or loss point opens Manager Details. The manager cell opens Status Detail; the status cell applies a status selection. |
| Advisor performance            | A count or loss bar opens its RO Details table. An RO cell applies another selection.                                              |
| Monthly trend                  | February opens a monthly RO table and adds `Monthly: Feb-2024`.                                                                    |
| VIN order counts               | Adds `Flagg Records Vin`; the panel remains a chart.                                                                               |
| Unrecovered supplies by VIN    | Opens the VIN/RO sales and recovery table.                                                                                         |
| Recurring vehicle shortfall    | Opens Vin, RO, Dealer, sales, total supplies, expected supplies, and recovered supplies. An RO cell filters the dashboard.         |
| Main RO table                  | An RO number filters the dashboard; column headings sort.                                                                          |

Breadcrumb text indicates the active level. Use the upward arrow to return a level. Removing a parent chip also clears deeper selections from that same panel. Selections from other panels remain active. Dashboard Reset clears filters and standard chart levels; KPI weekday views remain open, as observed in the reference.

## Selectors and tools

Advisor and repair-order controls have searchable multi-selection with Apply and Cancel. Status checkboxes and status search are available beside the RO table. The filter drawer validates its date range and applies a draft only when Apply is selected. Preferences save to browser storage.

Chart toolbars provide a five-icon type palette (bar, area, column, lollipop, line), draft metric sorting, refresh, information, insights, and a More menu. Refresh restores the original type, sorting, and drill state. Info displays `Data display limit : 35000`. Full screen keeps the panel interactive and uses a collapse control. Table view opens a separate centered dialog with sortable displayed values.

Quick compare opens a full content view with back navigation, independent cards, 1/2/3 Grid, and Image/PDF exports. Changes to one card's filters and category selection do not change its siblings or the dashboard. Notes support multiple entries, optional chart snapshots, selection, editing, removal, and persistence in browser storage.

Chart CSV and Excel exports use the displayed rows and columns. Excel preserves numeric precision and text cell types. PNG and PDF render the current chart or detail table. PDF downloads a real document, and tall tables continue across pages. Comparison exports include every card and its current selection.

Share mirrors In-app, WhatsApp, and Teams choices with independent sample recipients, optional comments, and validation. Share saves a browser-local draft and explicitly reports that no message was sent. Embed offers Public, Private, and disabled Private with SSO as observed. Generated local `?chart=<panel-id>&config=...` links preserve the selected chart mode, sort, optional filters/drill state, title, and toolbar/export controls. Public/Private choices do not implement authentication or change platform permissions.

AI Insights and Guided RCA open a right-side drawer with tabs, current selections, chart preview, Current/Saved results, Generate, and prompt entry. Findings are deterministic local totals/rankings, and saved reports survive reopening. Guided RCA supports category selection, Auto RCA, YTD/QTD/MTD periods, metric bars, a separate percentage-change axis, Fit to width, and Reset RCA. Missing historical periods remain unavailable; the frontend never invents historical comparisons. No data is sent to an AI service.

## Data boundaries

The five initial KPIs and weekday values reproduce the reference. Initial chart fixtures were transcribed from visible labels and include rounded values. The 16 copied RO rows do not represent the full 446-record production dataset. Date/staff/VIN associations and sales splits are sample metadata; filtered values and new detail tables are calculated from those available rows. A selection with no sample rows shows an empty state. All sample rows are partially recovered, so Fully Recovered currently produces an empty result.

The full platform's permissions, server exports, sharing recipients, authentication, generated AI narratives, and persistent collaboration are outside this frontend. The removed platform navigation, Edit button, and Dashboard Analyst control remain omitted.

## Validation

- Unit checks cover intersecting chart selections, parent/child drill removal, per-panel/global reset, multi-select filters, weekday totals, aggregate totals, CSV safety, and saved filters.
- Browser checks cover all five KPI views, every chart's first drill/filter action, both manager detail levels, advisor RO selection, monthly/VIN details, donut selection, sorting, fullscreen, comparison isolation, nested filter dialogs, notes, local insights, and embed rendering.
- PNG, PDF, Excel, CSV, and comparison exports were downloaded and inspected. New share/embed/analysis dialogs were checked at 390 pixels wide, including overflow and nested Escape handling.

Run `npm test` and `npm run build` before integrating a backend. All named components and helpers have short comments; the data reducer is separate from the presentation components so the interaction rules can be tested directly.
