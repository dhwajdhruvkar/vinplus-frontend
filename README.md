# Shop Supplies dashboard — React + Vite

A frontend recreation of the **Shop Supplies Analysiss** dashboard inspected in Chrome. The standalone dashboard fills the viewport and includes five KPI cards, dealer charts, sales donut, manager performance, advisor performance, monthly trend, VIN charts, filter drawer, and repair-order table.

## Run

Requires Node.js 22.12 or newer.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. To make a production build:

```bash
npm run build
npm run preview
```

The `dist/` folder can be served by any static web host. This project has no server, authentication implementation, production API calls, or external runtime font requests.

## What works

The UI refresh is isolated in `src/dashboardDesign.css`, imported by `src/main.jsx`. The existing dashboard options, data and chart workflows are preserved. The additive conversations feature connects the existing Share form to a floating frontend inbox. The stylesheet aligns cards and filters, improves typography and spacing, and keeps the original chart toolbars visible. Share remains in each chart's More menu. It adds hover feedback and short card/menu entrances, with reduced-motion support; standalone embeds retain their original styles.

- Five KPI cards switch between monthly points and weekday charts in place.
- Dealer and VIN count charts filter the dashboard; other charts open their own inline tables.
- Manager details drill into recovery status. Advisor, monthly, and VIN tables can select an RO.
- Selection chips combine across charts. Drill-up and per-panel reset clear only dependent selections.
- Searchable advisor and RO selectors support multiple selections, Apply, and Cancel.
- Dates, managers, advisors, VINs, status, and table sorting work with local records.
- Chart toolbars provide bar, area, column, lollipop, and line views, draft sorting, refresh, information, fullscreen, and table dialogs.
- Quick compare supports independent cards, 1/2/3-column layouts, and image/PDF exports.
- PDF, PNG, Excel, and CSV exports create real local files. Export libraries load only when needed.
- Multiple notes, optional chart snapshots, saved insights, and filter preferences persist in browser storage.
- Sharing retains In-app/WhatsApp/Teams, adds Outlook, and opens a local conversation with the selected chart attached. A floating launcher supports unread badges, per-channel threads, local drafts and explicit sample replies. No real messages are sent. Embed links preserve selected chart state and toolbar controls.
- Insights provide Generate, prompts, and Current/Saved views. Guided RCA includes category selection, Auto RCA, YTD/QTD/MTD, a separate percentage axis, fit, and reset, using local calculations.
- Responsive layouts, keyboard controls, dialog focus management, and empty states.

See [the conversation guide](docs/conversations.md) for the preview flow, animation behavior and future backend handoff.

See [the toolbar audit](docs/toolbar-audit.md) and [the interaction guide](docs/interactions.md) for the observed behavior and frontend boundaries.

## Reference fidelity and sample data

The initial summary values reproduce the visible reference: $510.66K total sales, 307 / 446 partial recovery orders, 68.83% partial recovery, $8.38K recovery, and $21.28K unrecovered supplies. The cards use the full-size reference layout. **View preference → Larger summary cards** offers an expanded view.

The sixteen visible repair-order rows are copied into local fixtures. They are **not the complete 446-record production dataset**. Relationships to managers, dates, advisors, and VINs, service-sale amounts, and the parts/labor/misc split in those rows are sample metadata used to demonstrate interactions. Applying filters recalculates values from these sixteen sample rows, so filtered summaries will differ from the original platform. The remaining source chart values were visually transcribed and are approximate where the reference only showed rounded labels.

The SVG charts, icons, and logo treatment are reconstructed rather than extracted production assets. The platform header, sidebar, tab strip, Edit control, and Dashboard Analyst control are omitted. Insights displays deterministic calculations; it is not connected to an AI service. Notes and preferences stay in this browser. Sharing and conversations save local previews, and embed links point to the running frontend; they do not publish or grant access to the original platform. Only the observed dashboard screen is replicated, not the original platform's editor, account management, or other applications.

## Backend engineering handoff

The complete [backend handoff package](docs/backend/README.md) covers all five KPIs, nine charts, filters and drill-downs, table behavior, exports, comparisons, insights, notes, preferences, embeds, and Share/conversation integrations. It includes an offline HTML guide, a proposed OpenAPI contract, worked examples, a field dictionary and a function-to-source map.

The package describes the frontend at `b0873bd` and separates observed behavior from proposed production requirements and unresolved business decisions. No backend is deployed. Start with [the engineering guide](docs/backend/backend-handoff.md) and its decision log before connecting live data.

## Connect your backend later

`src/data/dashboard.js` holds the fixtures, formatters, and data transformations. Replace the fixtures with your data-loading layer and supply records with:

```js
const repairOrder = {
  ro: "163547",
  dealer: "6385",
  type: "NULL",
  make: "ALFA",
  model: "STELVI",
  expected: 119,
  actual: 99,
  loss: 20,
  percent: 16.81,
  date: "2024-02-02", // ISO YYYY-MM-DD
  manager: "Christina-Athanasiadis",
  advisor: "Cesar-Valdez",
  vin: "ZFF96NMA1N0283166",
  status: "Partially Recovered",
  serviceSales: 2049.18,
};
```

For production, replace `referenceSummary` and the default chart fixtures with backend aggregates, and use one consistent dataset or API query for cards, charts, and details. The current implementation intentionally makes no assumptions about your other platform's authentication or API contract.

## Source map

| File or folder                                             | Responsibility                                                   |
| ---------------------------------------------------------- | ---------------------------------------------------------------- |
| `src/App.jsx`                                              | Page state, filters, summary data, and shared actions.           |
| `src/components/DashboardToolbar.jsx`                      | Dashboard toolbar and view preferences.                          |
| `src/components/SelectionBar.jsx`                          | Date chips and removable chart selections.                       |
| `src/components/KpiCards.jsx`, `KpiMiniChart.jsx`          | Five KPI cards and weekday views.                                |
| `src/components/DashboardCharts.jsx`, `DashboardChart.jsx` | Chart layout and each panel's drill behavior.                    |
| `src/components/Charts.jsx`, `SeriesChart.jsx`             | SVG charts, tooltips, and alternate chart types.                 |
| `src/components/ChartPanel.jsx`, `ChartTools.jsx`          | Shared panel actions and fullscreen state.                       |
| `src/components/DetailTable.jsx`, `RecordsTable.jsx`       | Sortable inline tables and RO table.                             |
| `src/components/SearchSelect.jsx`, `FilterDrawer.jsx`      | Draft multi-selection and date validation.                       |
| `src/components/QuickCompare.jsx`, `ChartPreview.jsx`      | Independent comparison cards.                                    |
| `src/components/ChartInsights.jsx`, `ChartNotes.jsx`       | Local insight preview and browser notes.                         |
| `src/components/ChartDialog.jsx`, `DashboardDialog.jsx`    | Chart utility dialogs and dashboard help.                        |
| `src/hooks/`                                               | Selection actions, keyboard focus, and toast messages.           |
| `src/data/dashboard.js`, `chartData.js`                    | Sample records, reference fixtures, and calculations.            |
| `src/data/interactions.js`                                 | Selection reducer and cross-filter matching.                     |
| `src/data/detailData.js`, `kpiData.js`, `salesMix.js`      | Table columns, weekday values, and donut totals.                 |
| `src/data/panels.js`                                       | Chart labels, metric definitions, and sorting.                   |
| `src/utils/`                                               | Browser storage and PNG/PDF/XLSX/CSV downloads.                  |
| `src/styles.css`, `interactions.css`, `chartUtilities.css` | Reference layout and interaction/responsive styles.              |
| `tests/`                                                   | Filters, totals, selections, drill-up, exports, and preferences. |

Additional toolbar files: `ChartEmbed.jsx` validates embed choices, `ChartShare.jsx` manages local recipient drafts, `ChangeChart.jsx` draws RCA periods, and `data/analysis.js` / `data/embed.js` keep their calculations separate from UI.

Start with `App.jsx` to follow the page. It passes data and actions to each component through props. The filter drawer edits a local draft; Apply sends that draft back to the page. The cards, charts, and table then use the same filtered rows. Each component and named helper has a short comment explaining its job.

```bash
npm test
npm run format
```
