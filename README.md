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
{
  (ro,
    dealer,
    type,
    make,
    model,
    expected,
    actual,
    loss,
    percent,
    date, // ISO YYYY-MM-DD
    manager,
    advisor,
    vin,
    status,
    serviceSales);
}
```

For production, replace `referenceSummary` and the default chart fixtures with backend aggregates, and use one consistent dataset or API query for cards, charts, and details. The current implementation intentionally makes no assumptions about your other platform's authentication or API contract.

## Source map

- `src/App.jsx`: dashboard composition and frontend state.
- `src/components/Charts.jsx`: responsive SVG chart primitives and tooltips.
- `src/components/DashboardUI.jsx`: KPI cards, filter drawer, table, and dialogs.
- `src/components/Icon.jsx`: local SVG icons.
- `src/data/dashboard.js`: sample records and filter/summary/CSV logic.
- `src/styles.css`: reference styling and responsive breakpoints.
- `tests/dashboard.test.js`: data and export checks.

```bash
npm test
npm run format
```
