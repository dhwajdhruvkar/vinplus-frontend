# Frontend function and component map

Reviewed source: [b0873bd](https://github.com/dhwajdhruvkar/vinplus-frontend/tree/b0873bdffb7635cd8769d3761f6b11ed4bab4924). Generated 25 September 2026.

Each entry links to the exact declaration at the reviewed commit. Descriptions are the nearby source comments, with short explanations for a few nested helpers. This inventory includes named function declarations and named arrow functions; inline anonymous event handlers and React callbacks remain within their linked component source. It is not a list of backend endpoints.

The main guide provides the behavioral contract. The migration note for each file explains which work belongs on the server and which should remain in the frontend.

## src/App.jsx

Replace fixture selection and local summary calculation with coherent authorized queries. Preserve existing state, toolbar callbacks, selections and embed branching.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`App`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/App.jsx#L32) | Component | Shows the shop supplies dashboard and connects its filters, charts, and dialogs. |
| [`updateFilter`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/App.jsx#L59) | Helper/action | Changes one filter while keeping the other selections. |
| [`resetFilters`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/App.jsx#L64) | Helper/action | Restores the original dashboard selection. |
| [`applyFilters`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/App.jsx#L71) | Helper/action | Applies the drawer's draft only when the user chooses Apply. |
| [`saveFilters`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/App.jsx#L77) | Helper/action | Saves filters in this browser and reports whether saving succeeded. |
| [`loadFilters`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/App.jsx#L87) | Helper/action | Restores a saved selection when one is available. |
| [`exportRecords`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/App.jsx#L93) | Helper/action | Downloads the rows currently shown by the dashboard filters. |
| [`reviewRecords`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/App.jsx#L99) | Helper/action | Takes the user to the repair-order table from a menu or dialog. |
| [`openFilters`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/App.jsx#L107) | Helper/action | Opens the filter drawer, closing any help dialog first. |

## src/components/ChangeChart.jsx

Frontend presentation and interaction component. Preserve its controls and callbacks; pass canonical data through its existing parent/service boundary.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`ChangeChart`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChangeChart.jsx#L5) | Component | Shows period totals as bars and percentage changes on a separate right axis. |
| [`changeY`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChangeChart.jsx#L21) | Helper/action | Converts a percentage into a height on the right-hand scale. |

## src/components/ChartDialog.jsx

Frontend presentation and interaction component. Preserve its controls and callbacks; pass canonical data through its existing parent/service boundary.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`ChartDialog`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartDialog.jsx#L12) | Component | Chooses the matching source dialog, drawer, or full comparison page. |

## src/components/ChartEmbed.jsx

Generate an authenticated or explicitly published server embed; keep all existing selections and SSO disabled until implemented.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`ChartEmbed`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartEmbed.jsx#L6) | Component | Configures a standalone local chart, including its filters and visible controls. |
| [`changeControl`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartEmbed.jsx#L14) | Helper/action | Updates a draft option and invalidates a previously generated link. |
| [`generateLink`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartEmbed.jsx#L22) | Helper/action | Generates a preview URL; Public and Private do not create server permissions. |

## src/components/ChartInsights.jsx

Use insight job/report and historical period APIs, keeping tabs, prompts, save controls and RCA interactions.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`savedFindings`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartInsights.jsx#L24) | Helper/action | Reads saved local findings while tolerating unavailable or older browser storage. |
| [`ChartInsights`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartInsights.jsx#L42) | Component | Recreates the Insights and Guided RCA drawer using local chart calculations. |
| [`generate`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartInsights.jsx#L108) | Helper/action | Generates the same deterministic summary each time for the current local rows. |
| [`selectValue`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartInsights.jsx#L120) | Helper/action | Opens the date-frequency analysis for a chart category. |
| [`autoAnalyze`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartInsights.jsx#L128) | Helper/action | Starts analysis from the largest displayed metric, as a local automatic selection. |
| [`saveInsight`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartInsights.jsx#L136) | Helper/action | Saves a generated view across dialog closes without contacting an insight service. |
| [`analyzePeriod`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartInsights.jsx#L149) | Helper/action | Chooses a period for a closer summary without changing dashboard filters. |
| [`FindingList`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartInsights.jsx#L413) | Component | Displays one generated or saved report in the result panel. |

## src/components/ChartNotes.jsx

Replace browser notes with owned records, optimistic versions and authorized optional snapshot assets.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`readNotes`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartNotes.jsx#L5) | Helper/action | Loads the note list and preserves a note written by the earlier frontend. |
| [`ChartNotes`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartNotes.jsx#L28) | Component | Manages multiple local notes and the chart image saved with each note. |
| [`storeNotes`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartNotes.jsx#L38) | Helper/action | Stores changes only when browser storage accepts the complete note list. |
| [`editNote`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartNotes.jsx#L53) | Helper/action | Opens a clean editor, or loads a selected note for editing. |
| [`saveNote`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartNotes.jsx#L61) | Helper/action | Saves the text and an optional image of the chart as it appeared when opened. |
| [`removeNote`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartNotes.jsx#L79) | Helper/action | Removes a local note while keeping the other notes and references unchanged. |

## src/components/ChartPanel.jsx

Keep shared chart actions and current presentation snapshot. Route notes, insights, share, embeds and large exports to the corresponding services.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`ChartPanel`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartPanel.jsx#L18) | Component | Keeps chart display options local while the dashboard owns data selections. |
| [`resetPanel`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartPanel.jsx#L59) | Helper/action | Restores this panel's original chart type, sorting, and drill selections. |
| [`runAction`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartPanel.jsx#L68) | Helper/action | Exports this panel or opens its local comparison, embed, or insights view. |

## src/components/ChartPreview.jsx

Read the snapshot query through the same service layer as the dashboard; remove fixture fallbacks from compare and embed previews.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`ChartPreview`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartPreview.jsx#L16) | Component | Draws an independent chart for comparison and insight panels. |

## src/components/Charts.jsx

Frontend presentation and interaction component. Preserve its controls and callbacks; pass canonical data through its existing parent/service boundary.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`useChart`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Charts.jsx#L21) | Hook | Measures the chart container and manages its hover tooltip. |
| [`show`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Charts.jsx#L39) | Helper/action | Positions and displays the chart tooltip for a mouse or keyboard interaction. |
| [`Tooltip`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Charts.jsx#L56) | Component | Displays the hovered chart value without covering the pointer. |
| [`chartButtonProps`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Charts.jsx#L74) | Helper/action | Makes each chart mark selectable with the mouse, Enter, or Space. |
| [`formatAxisValue`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Charts.jsx#L96) | Helper/action | Shortens large axis numbers while keeping small values readable. |
| [`formatChartValue`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Charts.jsx#L104) | Helper/action | Formats a chart value as either a number or a dollar amount. |
| [`barLabel`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Charts.jsx#L114) | Helper/action | Names each bar according to whether it shows dollars or record counts. |
| [`VerticalChart`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Charts.jsx#L123) | Component | Draws paired vertical bars and an optional line for unrecovered amounts. |
| [`HorizontalChart`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Charts.jsx#L396) | Component | Draws one or more horizontal bar series for each category. |
| [`DonutChart`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Charts.jsx#L600) | Component | Highlights sales slices independently without changing dashboard filters. |
| [`makeArc`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Charts.jsx#L620) | Helper/action | Converts each value to an arc and an optional outward selection offset. |
| [`point`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Charts.jsx#L633) | Helper/action | Locates one point on the inner or outer circle. |
| [`toggleSlice`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Charts.jsx#L651) | Helper/action | Toggles just the clicked slice, matching the original donut behavior. |
| [`amount`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Charts.jsx#L662) | Helper/action | Formats the visible amount and its share of the sales mix. |
| [`TrendChart`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Charts.jsx#L778) | Component | Shows the monthly unrecovered amount for the available reporting period. |

## src/components/ChartShare.jsx

Resolve eligible recipients from the backend; create snapshot and share command; handle per-target outcomes and open the returned conversation.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`ChartShare`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartShare.jsx#L10) | Component | Keeps the original sharing choices and opens a local conversation for each recipient. |
| [`shareDraft`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartShare.jsx#L22) | Helper/action | Saves a local share draft, without sending messages to another platform. |
| [`RecipientPicker`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartShare.jsx#L142) | Component | Adds and removes searchable recipients without using a live user directory. |

## src/components/ChartTools.jsx

Frontend presentation and interaction component. Preserve its controls and callbacks; pass canonical data through its existing parent/service boundary.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`ChartTools`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartTools.jsx#L21) | Component | Provides the source chart's type, sort, refresh, insights, info, and More menus. |
| [`enabled`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartTools.jsx#L44) | Helper/action | Restricts controls only when an embed explicitly customizes its toolbar. |
| [`dismiss`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartTools.jsx#L50) | Helper/action | Closes menus outside the toolbar and returns focus after Escape. |
| [`toggle`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartTools.jsx#L79) | Helper/action | Starts a fresh sort draft so Cancel never changes the applied sort. |
| [`run`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartTools.jsx#L89) | Helper/action | Runs one toolbar action, then dismisses the open popover. |

## src/components/ChartTypeIcon.jsx

Frontend presentation and interaction component. Preserve its controls and callbacks; pass canonical data through its existing parent/service boundary.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`ChartTypeIcon`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/ChartTypeIcon.jsx#L12) | Component | Draws the small colored chart previews used by the source toolbar. |

## src/components/DashboardChart.jsx

Preserve each chart's drill levels and owner selections; select the matching chart or details response rather than locally deriving incomplete groups.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`DashboardChart`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/DashboardChart.jsx#L21) | Component | Connects one chart to its own drill table and dashboard selection behavior. |
| [`selectCategory`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/DashboardChart.jsx#L60) | Helper/action | Opens the next level for detail charts, or filters a count chart in place. |
| [`selectCell`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/DashboardChart.jsx#L74) | Helper/action | Applies only the detail columns that filter or drill in the reference. |
| [`renderChart`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/DashboardChart.jsx#L94) | Helper/action | Draws the original chart or the user's chosen alternative with the same data. |

## src/components/DashboardCharts.jsx

Frontend presentation and interaction component. Preserve its controls and callbacks; pass canonical data through its existing parent/service boundary.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`DashboardCharts`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/DashboardCharts.jsx#L9) | Component | Arranges all dashboard charts and shares the current frontend selection. |
| [`chart`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/DashboardCharts.jsx#L22) | Helper/action | Gives every panel the same filtered records and independent drill state. |

## src/components/DashboardDialog.jsx

Frontend presentation and interaction component. Preserve its controls and callbacks; pass canonical data through its existing parent/service boundary.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`DashboardDialog`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/DashboardDialog.jsx#L8) | Component | Chooses the content for the currently open dashboard dialog. |
| [`Insights`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/DashboardDialog.jsx#L40) | Component | Summarizes recovery performance and links to the repair-order table. |
| [`AboutDashboard`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/DashboardDialog.jsx#L71) | Component | Explains the dashboard's purpose and the selected reporting period. |
| [`DashboardHelp`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/DashboardDialog.jsx#L88) | Component | Explains how to filter, inspect, sort, and export the dashboard records. |

## src/components/DashboardToolbar.jsx

Frontend presentation and interaction component. Preserve its controls and callbacks; pass canonical data through its existing parent/service boundary.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`DashboardToolbar`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/DashboardToolbar.jsx#L6) | Component | Shows the page title and actions for filters, insights, view settings, and export. |
| [`closeOutside`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/DashboardToolbar.jsx#L23) | Helper/action | Closes a menu when the user clicks outside the toolbar's dropdowns. |
| [`closeOnEscape`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/DashboardToolbar.jsx#L27) | Helper/action | Allows keyboard users to dismiss the open menu. |
| [`runMenuAction`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/DashboardToolbar.jsx#L39) | Helper/action | Runs a dropdown action and closes the menu it came from. |

## src/components/DetailTable.jsx

Retain columns and cell interactions. Move full-result sorting/pagination to the backend without losing drill predicates.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`DetailTable`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/DetailTable.jsx#L5) | Component | Shows the active chart's detail columns with sorting and cell selection. |
| [`changeSort`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/DetailTable.jsx#L28) | Helper/action | Reverses the selected column or starts sorting a different column. |
| [`selectCell`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/DetailTable.jsx#L36) | Helper/action | Highlights the cell and sends chart-specific fields to the dashboard filter. |

## src/components/FilterDrawer.jsx

Keep draft/Apply/Cancel behavior and date validation; bind authorized searchable options and per-user preference persistence.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`FilterDrawer`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/FilterDrawer.jsx#L9) | Component | Lets the user edit a draft selection, then apply it or save it for later. |
| [`change`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/FilterDrawer.jsx#L23) | Helper/action | Changes the drawer's draft without changing the dashboard yet. |
| [`submitDraft`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/FilterDrawer.jsx#L28) | Helper/action | Validates the dates before either applying or saving the draft. |

## src/components/Icon.jsx

Frontend presentation and interaction component. Preserve its controls and callbacks; pass canonical data through its existing parent/service boundary.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`Icon`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Icon.jsx#L50) | Component | Draws a local SVG icon using the requested name and size. |

## src/components/KpiCards.jsx

Render the eight canonical summary measures using the existing five cards and footers.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`KpiCards`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/KpiCards.jsx#L8) | Component | Shows the five summary cards and keeps each weekday breakdown inside its card. |

## src/components/KpiMiniChart.jsx

Keep in-place weekday expansion and keyboard focus; use returned month and weekday keys instead of February constants.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`KpiMiniChart`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/KpiMiniChart.jsx#L7) | Component | Expands a monthly KPI mark into a weekday chart inside the same card. |
| [`showMonth`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/KpiMiniChart.jsx#L19) | Helper/action | Keeps the month selected when this card returns to its monthly view. |
| [`showWeekdays`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/KpiMiniChart.jsx#L25) | Helper/action | Changes the card's level and adds the shared month selection chip. |
| [`describeDay`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/KpiMiniChart.jsx#L31) | Helper/action | Shows a value on hover, focus, or click without opening another drill level. |

## src/components/Logo.jsx

Frontend presentation and interaction component. Preserve its controls and callbacks; pass canonical data through its existing parent/service boundary.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`Logo`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Logo.jsx#L4) | Component | Displays the dashboard brand inside the About dialog. |

## src/components/Modal.jsx

Frontend presentation and interaction component. Preserve its controls and callbacks; pass canonical data through its existing parent/service boundary.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`Modal`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Modal.jsx#L6) | Component | Displays dialog content with a close button, backdrop, and keyboard focus handling. |

## src/components/Panel.jsx

Frontend presentation and interaction component. Preserve its controls and callbacks; pass canonical data through its existing parent/service boundary.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`IconButton`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Panel.jsx#L5) | Component | Renders an icon button with an accessible label and hover title. |
| [`Breadcrumbs`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Panel.jsx#L25) | Component | Marks the active drill level; the panel arrow handles navigation. |
| [`Panel`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/Panel.jsx#L44) | Component | Provides a shared card layout with a title, breadcrumbs, and optional expand action. |

## src/components/QuickCompare.jsx

Preserve comparison cards and layouts. Agree comparison filter scope; fetch complete aggregates for each independent query.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`QuickCompare`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/QuickCompare.jsx#L18) | Component | Adds independent chart copies so filter changes can be compared side by side. |
| [`addComparison`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/QuickCompare.jsx#L27) | Helper/action | Gives each new copy a stable identity so other comparison filters survive removal. |
| [`exportComparisons`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/QuickCompare.jsx#L33) | Helper/action | Exports every visible comparison, preserving each card's independent selection. |
| [`ComparisonCard`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/QuickCompare.jsx#L112) | Component | Owns one comparison's filters without changing the dashboard or other copies. |
| [`selectCategory`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/QuickCompare.jsx#L127) | Helper/action | Applies a clicked category only inside this comparison card. |

## src/components/RecordsTable.jsx

Render server-paginated rows and server ordering; use recordId as identity. Agree the displayed versus sorted percent discrepancy.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`RecordCell`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/RecordsTable.jsx#L7) | Component | Formats a table cell and makes repair-order numbers filter the dashboard. |
| [`sortValue`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/RecordsTable.jsx#L17) | Helper/action | Uses unrounded amounts when sorting percentages, as in the original table. |
| [`RecordsTable`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/RecordsTable.jsx#L23) | Component | Shows sortable repair orders and an empty message when no records match. |
| [`sortBy`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/RecordsTable.jsx#L39) | Helper/action | Starts a new column in ascending order or reverses the current column. |
| [`sortDirection`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/RecordsTable.jsx#L47) | Helper/action | Describes the active sort direction to assistive technology. |

## src/components/RepairOrders.jsx

Bind record query and authorized advisor/RO/status options, preserving multi-select and status normalization.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`RepairOrders`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/RepairOrders.jsx#L9) | Component | Shows searchable order/status filters and the cross-filtering repair-order table. |
| [`changeStatus`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/RepairOrders.jsx#L26) | Helper/action | Combines both checked statuses as an unrestricted status selection. |

## src/components/SearchSelect.jsx

Keep draft multi-selection and Apply/Cancel. Support paginated option search without dropping already-selected IDs.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`SearchSelect`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/SearchSelect.jsx#L5) | Component | Provides a searchable local selector with a reset action and keyboard support. |
| [`closeOutside`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/SearchSelect.jsx#L18) | Helper/action | Closes this selector when another part of the dashboard is clicked. |
| [`choose`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/SearchSelect.jsx#L26) | Helper/action | Toggles a draft value; Apply commits the selected values together. |
| [`beginSelection`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/SearchSelect.jsx#L35) | Helper/action | Starts a new draft from the current selection. |
| [`applySelection`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/SearchSelect.jsx#L43) | Helper/action | Commits the draft and closes the options. |
| [`handleKey`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/SearchSelect.jsx#L49) | Helper/action | Moves through the options or chooses the highlighted option. |

## src/components/SelectionBar.jsx

Frontend presentation and interaction component. Preserve its controls and callbacks; pass canonical data through its existing parent/service boundary.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`SelectionBar`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/SelectionBar.jsx#L7) | Component | Shows the active dates and lets the user clear individual filters. |

## src/components/SeriesChart.jsx

Frontend presentation and interaction component. Preserve its controls and callbacks; pass canonical data through its existing parent/service boundary.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`SeriesChart`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/SeriesChart.jsx#L6) | Component | Draws column, area, line, and lollipop views with the same chart selections. |
| [`label`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/components/SeriesChart.jsx#L31) | Helper/action | Formats each series according to whether it shows counts or currency. |

## src/conversations/ConversationContext.jsx

Replace local mutation/storage and preview reply timers with API commands and events. Keep panel visibility, selected thread and unsent drafts local.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`ConversationProvider`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/ConversationContext.jsx#L19) | Component | Shares local conversation state between chart Share dialogs and the floating inbox. |
| [`update`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/ConversationContext.jsx#L45) | Helper/action | Keeps rapid actions in order and retains history in this browser when possible. |
| [`startConversation`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/ConversationContext.jsx#L63) | Helper/action | Opens the recipient's thread immediately after the chart Share form is submitted. |
| [`sendDraft`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/ConversationContext.jsx#L77) | Helper/action | Saves an outgoing message locally; no delivery status is invented. |
| [`markRead`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/ConversationContext.jsx#L83) | Helper/action | Clears this thread's badge only when the widget has actually displayed its replies. |
| [`previewReply`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/ConversationContext.jsx#L91) | Helper/action | Schedules a clearly labeled sample reply so the minimized notification can be tried. |
| [`useConversations`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/ConversationContext.jsx#L139) | Hook | Gives sharing and inbox components access to the same conversation state. |

## src/conversations/conversationStore.js

Preview-only persistence and identifiers. Replace with server conversations/messages, per-user read markers and durable provider mappings; do not migrate sample messages as real activity.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`createId`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/conversationStore.js#L7) | Helper/action | Creates browser-only IDs for drafts and sample messages. |
| [`readConversations`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/conversationStore.js#L12) | Helper/action | Reads local previews safely; damaged or unsupported entries are ignored. |
| [`isConversation`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/conversationStore.js#L25) | Helper/action | Checks stored data before the UI tries to display a conversation. |
| [`saveConversations`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/conversationStore.js#L49) | Helper/action | Saves preview history and reports storage failures without pretending it was saved. |
| [`unreadCount`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/conversationStore.js#L62) | Helper/action | Counts only unread incoming messages, so local outgoing drafts never create a badge. |
| [`shareConversations`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/conversationStore.js#L74) | Helper/action | Starts one private preview per recipient and channel, reusing its chart thread. |
| [`appendMessage`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/conversationStore.js#L120) | Helper/action | Adds a local draft or an explicitly requested sample reply to one conversation. |
| [`markConversationRead`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/conversationStore.js#L150) | Helper/action | Marks only the selected conversation's incoming messages as read. |

## src/conversations/ConversationWidget.jsx

Keep launcher, tabs, pinned chart, composer, scroll/focus read rules and accessibility. Bind real thread/message states through the provider; disable preview reply in live mode.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`ChannelIcon`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/ConversationWidget.jsx#L16) | Component | Draws small channel symbols locally without loading external assets or accounts. |
| [`ConversationWidget`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/ConversationWidget.jsx#L44) | Component | Holds the launcher, unread badge, and a floating inbox that leaves charts usable. |
| [`minimize`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/ConversationWidget.jsx#L67) | Helper/action | Minimizes the panel without discarding the selected thread or unsent text. |
| [`openInbox`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/ConversationWidget.jsx#L73) | Helper/action | Opens the last thread, or the first unread thread when no conversation is selected. |
| [`selectChannel`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/ConversationWidget.jsx#L87) | Helper/action | Changes channels and supports the standard arrow-key behavior for tabs. |
| [`ConversationThread`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/ConversationWidget.jsx#L288) | Component | Shows the pinned chart, message history, draft composer, and explicit reply preview. |
| [`markVisibleRead`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/ConversationWidget.jsx#L313) | Helper/action | Background tabs and older messages do not clear unseen replies. |
| [`submit`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/ConversationWidget.jsx#L337) | Helper/action | Saves this draft and brings the latest message into view without changing charts. |
| [`MessageBubble`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/ConversationWidget.jsx#L484) | Component | Displays plain message text with honest preview and local-draft status labels. |
| [`initials`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/ConversationWidget.jsx#L519) | Helper/action | Builds a compact avatar from a recipient's name. |

## src/conversations/useLauncherMotion.js

Entirely frontend. Preserve launcher-relative opening/minimizing, interrupted-animation handling and reduced-motion behavior.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`useLauncherMotion`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/useLauncherMotion.js#L4) | Hook | Expands from the launcher with a soft spring and funnels back into it on minimize. |
| [`finish`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/useLauncherMotion.js#L41) | Helper/action | Finishes immediately for reduced motion and removes hidden controls from focus. |
| [`changeMotion`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/conversations/useLauncherMotion.js#L87) | Helper/action | Responds to reduced-motion preference changes while the page is open. |

## src/data/analysis.js

Replace local findings and period buckets with authorized insight/RCA responses; retain prompt controls and agree period definitions.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`analysisRows`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/analysis.js#L7) | Helper/action | Rebuilds the chart or drill table when filters change inside the analysis drawer. |
| [`chartFindings`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/analysis.js#L29) | Helper/action | Summarizes the displayed values without inventing an AI response or unseen records. |
| [`periodMetrics`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/analysis.js#L48) | Helper/action | Groups the available records by year, quarter, or month for local change analysis. |

## src/data/chartData.js

Replace reference fixtures and local group calculations with chart responses. Return count and monetary fields separately.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`orderCounts`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/chartData.js#L39) | Helper/action | Uses record counts for the two bars in an order-count chart. |
| [`getChartData`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/chartData.js#L44) | Helper/action | Returns the reference charts or rebuilds them from the filtered sample rows. |
| [`chartMaximum`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/chartData.js#L61) | Helper/action | Leaves space above the largest value, including when there are no records. |

## src/data/dashboard.js

Move authoritative filtering, sums and grouping to the reporting service. Keep currency/date formatting and local download helpers in the frontend; eliminate generated sales amounts.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`money`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/dashboard.js#L109) | Helper/action | Formats an amount as US dollars, including cents. |
| [`compactMoney`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/dashboard.js#L114) | Helper/action | Shortens large dollar amounts for cards and chart labels. |
| [`dateLabel`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/dashboard.js#L120) | Helper/action | Converts an ISO date into the month-day-year label used on this page. |
| [`isFiltered`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/dashboard.js#L126) | Helper/action | Checks whether any selection differs from the original dashboard filters. |
| [`filterRecords`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/dashboard.js#L132) | Helper/action | Keeps rows that match every active filter and the optional search text. |
| [`matchesFilter`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/dashboard.js#L157) | Helper/action | Matches a single value or any value from a multi-select control. |
| [`summarize`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/dashboard.js#L163) | Helper/action | Calculates the totals and recovery percentages displayed in the summary cards. |
| [`groupRecords`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/dashboard.js#L179) | Helper/action | Groups records by a field and adds the amounts and counts needed by charts. |
| [`metricValue`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/dashboard.js#L208) | Helper/action | Picks the matching daily value for the summary card the user selected. |
| [`dailyMetrics`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/dashboard.js#L224) | Helper/action | Builds one chart entry per date for a summary-card drill-down. |
| [`unrecoveredPercent`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/dashboard.js#L242) | Helper/action | Uses the source percentage when supplied, otherwise calculates it from amounts. |
| [`csvCell`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/dashboard.js#L248) | Helper/action | Quotes a CSV cell and prevents text from being read as a spreadsheet formula. |
| [`toCSV`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/dashboard.js#L256) | Helper/action | Exports the table columns and rows with the same displayed percentages. |

## src/data/detailData.js

Return canonical record fields or aggregated manager/status rows. Retain visible columns and formatting; do not generate sales splits in production.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`enrichRecord`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/detailData.js#L66) | Helper/action | Adds sample sales categories for frontend tables; these are not production facts. |
| [`aggregateDetails`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/detailData.js#L86) | Helper/action | Totals the rows for manager and recovery-status tables. |
| [`detailValue`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/detailData.js#L119) | Helper/action | Formats a detail value without changing its underlying sorting value. |
| [`detailCSV`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/detailData.js#L128) | Helper/action | Exports exactly the active detail columns and safely quotes every CSV value. |
| [`cell`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/detailData.js#L130) | Helper/action | Prevents spreadsheet formulas and escapes commas, quotes, and line breaks. |

## src/data/embed.js

Preserve valid presentation settings. Server-managed embeds enforce access, expiry and revocation; frontend URL parsing is not authorization.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`readEmbed`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/embed.js#L19) | Helper/action | Reads only supported embed settings and ignores malformed links. |
| [`createEmbedLink`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/embed.js#L110) | Helper/action | Builds a local chart link; access control remains the responsibility of its host. |
| [`embedSnippet`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/embed.js#L126) | Helper/action | Escapes attribute text in the copyable iframe snippet. |
| [`escape`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/embed.js#L127) | Helper/action | Escapes characters when building the iframe HTML snippet. |

## src/data/interactions.js

Retain this reducer and owner/depth semantics. Apply equivalent AND predicates on the backend; do not merge selections from different owners.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`interactionReducer`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/interactions.js#L5) | Helper/action | Updates a drill level and keeps independent chart selections intact. |
| [`clearFromDepth`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/interactions.js#L43) | Helper/action | Removes a panel's current selection and any deeper selections it created. |
| [`matchSelections`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/interactions.js#L54) | Helper/action | Intersects every chart selection, including two charts using the same field. |
| [`hasRecordSelection`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/interactions.js#L64) | Helper/action | The month chip alone does not change totals within the default month. |

## src/data/kpiData.js

Return canonical weekday aggregates; remove separate reference weekday arrays from the live path.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`weekdayMetrics`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/kpiData.js#L22) | Helper/action | Groups the current sample rows by weekday for a summary card. |

## src/data/panels.js

Panel titles and renderer metadata remain local. Server sorting must use an allowlist, preserve the selected field/direction and sort before pagination.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`sortChartRows`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/panels.js#L104) | Helper/action | Sorts a copy so display preferences never mutate shared chart fixtures. |

## src/data/salesMix.js

Return real category sums and the distinct donut denominator; keep slice formatting in the renderer.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`salesMix`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/data/salesMix.js#L4) | Helper/action | Keeps the original sales mix until a filter switches to the available sample rows. |

## src/hooks/useClipboard.js

Frontend interaction helper. Preserve its keyboard, focus, selection, clipboard or notification behavior; no separate backend endpoint is needed.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`useClipboard`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/hooks/useClipboard.js#L4) | Hook | Copies visible text and reports clipboard failures without losing the text. |
| [`copy`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/hooks/useClipboard.js#L7) | Helper/action | Copies the requested value when the browser allows clipboard access. |

## src/hooks/useDashboardInteractions.js

Frontend interaction helper. Preserve its keyboard, focus, selection, clipboard or notification behavior; no separate backend endpoint is needed.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`useDashboardInteractions`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/hooks/useDashboardInteractions.js#L8) | Hook | Connects chart drill-downs, selection chips, and reset actions. |
| [`select`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/hooks/useDashboardInteractions.js#L12) | Helper/action | Selects a chart category and optionally moves that panel to its next table. |
| [`resetPanel`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/hooks/useDashboardInteractions.js#L37) | Helper/action | Clears one chart and leaves selections from other charts in place. |
| [`up`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/hooks/useDashboardInteractions.js#L42) | Helper/action | Returns one step up in a chart and clears that step's filter. |
| [`remove`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/hooks/useDashboardInteractions.js#L47) | Helper/action | Removes a chip and the drill steps that depend on it. |
| [`reset`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/hooks/useDashboardInteractions.js#L52) | Helper/action | Restores all chart panels and clears their selections. |

## src/hooks/useDialogFocus.js

Frontend interaction helper. Preserve its keyboard, focus, selection, clipboard or notification behavior; no separate backend endpoint is needed.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`useDialogFocus`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/hooks/useDialogFocus.js#L4) | Hook | Keeps keyboard focus inside a dialog and returns it to the opener on close. |
| [`focusableElements`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/hooks/useDialogFocus.js#L14) | Helper/action | Reads the controls again so focus stays correct when dialog content changes. |
| [`handleKeyDown`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/hooks/useDialogFocus.js#L23) | Helper/action | Handles Escape and wraps Tab navigation between the first and last controls. |

## src/hooks/useFullscreenFocus.js

Frontend interaction helper. Preserve its keyboard, focus, selection, clipboard or notification behavior; no separate backend endpoint is needed.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`useFullscreenFocus`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/hooks/useFullscreenFocus.js#L4) | Hook | Keeps keyboard focus in the expanded panel and returns it on collapse. |
| [`controls`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/hooks/useFullscreenFocus.js#L11) | Helper/action | Reads current controls because menus and drill tables can change while expanded. |
| [`handleTab`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/hooks/useFullscreenFocus.js#L20) | Helper/action | Wraps Tab at the panel edges; nested dialogs handle their own focus. |

## src/hooks/useToast.js

Frontend interaction helper. Preserve its keyboard, focus, selection, clipboard or notification behavior; no separate backend endpoint is needed.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`useToast`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/hooks/useToast.js#L4) | Hook | Shows one short notice at a time and clears its timer when the page closes. |
| [`notify`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/hooks/useToast.js#L11) | Helper/action | Replaces the current notice and hides it after a few seconds. |

## src/utils/browser.js

Move saved preferences to per-user persistence. Local downloads remain possible; full paginated exports use an authorized export job.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`readPreference`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/utils/browser.js#L6) | Helper/action | Reads saved filters, filling missing or invalid fields with their defaults. |
| [`savePreference`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/utils/browser.js#L28) | Helper/action | Stores a filter selection and returns false if browser storage is unavailable. |
| [`downloadRecords`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/utils/browser.js#L38) | Helper/action | Downloads a CSV file and releases its temporary browser URL afterwards. |
| [`downloadFile`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/utils/browser.js#L47) | Helper/action | Saves generated text or an image without contacting a backend. |

## src/utils/chartExport.js

Keep chart rasterization and small visual exports in the frontend. Complete dataset exports must use the same authorized snapshot and server ordering.

| Function/component | Kind | Current responsibility |
| --- | --- | --- |
| [`panelCanvas`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/utils/chartExport.js#L5) | Helper/action | Renders the displayed chart or all table rows onto a canvas for local exports. |
| [`saveCanvasImage`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/utils/chartExport.js#L76) | Helper/action | Downloads a canvas as a PNG image and reports rendering failures. |
| [`exportPanelImage`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/utils/chartExport.js#L85) | Helper/action | Creates a PNG from the selected chart or detail table. |
| [`saveCanvasPDF`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/utils/chartExport.js#L90) | Helper/action | Writes a real PDF, splitting tall charts or tables across readable pages. |
| [`exportPanelPDF`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/utils/chartExport.js#L133) | Helper/action | Downloads the current chart as a PDF without opening the browser print dialog. |
| [`excelCells`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/utils/chartExport.js#L138) | Helper/action | Preserves numeric cell types and treats text as text in the Excel workbook. |
| [`exportPanelExcel`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/utils/chartExport.js#L157) | Helper/action | Loads the spreadsheet writer only when an Excel export is requested. |
| [`comparisonCanvas`](https://github.com/dhwajdhruvkar/vinplus-frontend/blob/b0873bdffb7635cd8769d3761f6b11ed4bab4924/src/utils/chartExport.js#L168) | Helper/action | Combines every comparison card into one image using its on-screen grid positions. |

## Non-function configuration and styles

`src/main.jsx` mounts the application and imports the styles. `DashboardContext.jsx` exports shared context. `panels.js`, `detailData.js`, `embed.js` and `dashboard.js` also export chart definitions, column lists, allowed controls, default filters and fixture arrays. These constants are part of the integration audit even though they are not functions.

The stylesheets control layout, responsiveness and animations. No backend endpoint should own CSS timing, hover state, tooltip position or chart geometry. Existing tests are under `tests/`; add backend and adapter contract tests using the acceptance matrix in the main guide.

Inventory: **200 named functions/components across 50 files**.
