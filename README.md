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

- Date, manager, advisor, status, VIN, and repair-order filtering.
- Sortable, scrollable repair-order table with record detail dialogs.
- Chart bar drill-downs, daily summaries, hover values, and chart expansion.
- CSV export of the current table selection.
- Saved filter preferences in browser local storage.
- Reset, larger KPI view, and dashboard insights.
- Responsive layouts, keyboard controls, dialog focus management, and empty states.

## Reference fidelity and sample data

The initial summary values reproduce the visible reference: $510.66K total sales, 307 / 446 partial recovery orders, 68.83% partial recovery, $8.38K recovery, and $21.28K unrecovered supplies. The compact cards and space before the first chart row deliberately follow the reference layout. Enable **View preference → Larger summary cards** for a more readable alternative.

The sixteen visible repair-order rows are copied into local fixtures. They are **not the complete 446-record production dataset**. Relationships to managers, dates, advisors, and VINs, and service-sale amounts in those rows, are sample metadata used to demonstrate interactions. Applying filters recalculates values from these sixteen sample rows, so filtered summaries will differ from the original platform. The remaining source chart values were visually transcribed and are approximate where the reference only showed rounded labels.

The SVG charts, icons, and logo treatment are reconstructed rather than extracted production assets. The platform header, sidebar, tab strip, Edit control, and Dashboard Analyst control are omitted. Insights displays a deterministic summary; it is not connected to an AI service. Only the observed dashboard screen is replicated, not the original platform's editor, account management, or other applications.

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

- `src/App.jsx`: page layout, selected filters, and actions shared by components.
- `src/components/DashboardToolbar.jsx`: title, menus, and toolbar actions.
- `src/components/SelectionBar.jsx`: active dates and removable filter chips.
- `src/components/KpiCards.jsx`: the five summary cards.
- `src/components/DashboardCharts.jsx`: chart panels and drill-down actions.
- `src/components/Charts.jsx`: reusable SVG charts and tooltips.
- `src/components/FilterDrawer.jsx`: draft filters, date validation, and saved preferences.
- `src/components/RepairOrders.jsx`: repair-order and status filters beside the table.
- `src/components/RecordsTable.jsx`: sorting and formatting for repair-order rows.
- `src/components/DashboardDialog.jsx`: record details, daily metrics, insights, and help.
- `src/components/Panel.jsx` and `Modal.jsx`: shared panel and dialog layouts.
- `src/components/Icon.jsx` and `Logo.jsx`: local SVG icons and branding.
- `src/hooks/`: dialog keyboard focus and temporary toast messages.
- `src/utils/browser.js`: browser storage and CSV downloads.
- `src/data/dashboard.js`: sample records and filter/summary/CSV logic.
- `src/data/chartData.js`: default chart fixtures and filtered chart data.
- `src/styles.css`: reference styling and responsive breakpoints.
- `tests/`: checks for filters, totals, chart data, preferences, and CSV exports.

Start with `App.jsx` to follow the page. It passes data and actions to each component through props. The filter drawer edits a local draft; Apply sends that draft back to the page. The cards, charts, and table then use the same filtered rows. Each component and named helper has a short comment explaining its job.

```bash
npm test
npm run format
```
