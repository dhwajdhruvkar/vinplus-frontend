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

Chart toolbars provide type switching, metric sorting, reset, information, insights, and a More menu. Full screen keeps the panel interactive and uses a collapse control. Table view shows the displayed chart data. Quick compare creates independent cards whose filters and category selections do not change the dashboard. Notes save locally. Chart CSV exports use the displayed columns; PNG exports render a chart or detail table; PDF uses browser printing.

Share and Embed use `?chart=<panel-id>` links to the running frontend. They create no public platform resources and use no platform credentials. AI Insights and Guided RCA demonstrate the controls with local metric totals/rankings, selection, Generate, Auto RCA, and a saved view for the open dialog. There is no AI request or backend integration.

## Data boundaries

The five initial KPIs and weekday values reproduce the reference. Initial chart fixtures were transcribed from visible labels and include rounded values. The 16 copied RO rows do not represent the full 446-record production dataset. Date/staff/VIN associations and sales splits are sample metadata; filtered values and new detail tables are calculated from those available rows. A selection with no sample rows shows an empty state. All sample rows are partially recovered, so Fully Recovered currently produces an empty result.

The full platform's permissions, server exports, sharing recipients, authentication, generated AI narratives, and persistent collaboration are outside this frontend. The removed platform navigation, Edit button, and Dashboard Analyst control remain omitted.

## Validation

- Unit checks cover intersecting chart selections, parent/child drill removal, per-panel/global reset, multi-select filters, weekday totals, aggregate totals, CSV safety, and saved filters.
- Browser checks cover all five KPI views, every chart's first drill/filter action, both manager detail levels, advisor RO selection, monthly/VIN details, donut selection, sorting, fullscreen, comparison isolation, nested filter dialogs, notes, local insights, and embed rendering.
- PNG and CSV downloads were opened and inspected. The mobile dashboard was checked at 390 pixels wide, including its scrolling inline tables.

Run `npm test` and `npm run build` before integrating a backend. All named components and helpers have short comments; the data reducer is separate from the presentation components so the interaction rules can be tested directly.
