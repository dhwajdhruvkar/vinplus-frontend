# Chart toolbar audit

Inspected the original VIN loss chart in Chrome on September 24, 2026. The underlined toolbar in the supplied image defines this follow-up's scope.

| Control           | Observed source behavior                                                                                                                                                 | Frontend implementation                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Change chart type | Horizontal icon palette: bar, area, column, lollipop, line; active choice highlighted                                                                                    | Five renderings, selected icon, close control, working selections                                       |
| Sort              | Empty field and direction until chosen; Min To Max / Max To Min, Cancel / Apply. VIN metric is Total Ideal Cost by VIN                                                   | Draft state, correct field, sorting, cancel and refresh                                                 |
| Refresh           | Restores original bar chart                                                                                                                                              | Restore chart, sorting, and drill state                                                                 |
| Info              | Data display limit : 35000                                                                                                                                               | Same compact popover                                                                                    |
| Insights          | AI Insights and Guided RCA                                                                                                                                               | Drawer with tabs, current selection, chart, Current/Saved, Generate and prompt; local calculations only |
| Guided RCA        | Category selection opens change analysis, closedate selector, YTD/QTD/MTD, Fit to width, Reset RCA, metric/change chart                                                  | Same controls with available local records; no remote AI calls                                          |
| Full screen       | Expanded interactive chart with collapse control                                                                                                                         | Preserve working fullscreen and keyboard focus                                                          |
| Table view        | Separate centered dialog, light table headings, scrollable data                                                                                                          | Replace inline mode with dialog                                                                         |
| Quick compare     | Full content view, back, Export Image/PDF, Add comparison, 1/2/3 Grid, independent selections                                                                            | Same layout choices and exports                                                                         |
| Notes             | Right drawer, empty state, Add note, editor with Save current state of the chart for reference, save/cancel icons, chart reference area                                  | Multiple local notes, saved chart references, edit/remove                                               |
| Share             | Modal, In-app/WhatsApp/Teams checkboxes, per-platform recipients/channel, optional comment, Cancel/Share                                                                 | Frontend draft and validation; no external message or permission change                                 |
| Embed             | Public/Private/disabled Private with SSO; Customize Select all, current filters, title, type/info/sort/refresh and PDF/Image/Excel/CSV export flags; Generate embed link | Functional local link generation and embedded options; no authentication or public resource creation    |
| Export            | PDF, Image, Excel, CSV submenu                                                                                                                                           | Real PDF/PNG/XLSX/CSV downloads                                                                         |

Source Share, note Save, and Generate embed link were not submitted. Source chart selections and display changes were transient. Reference data remains distinct from sample data; the frontend cannot reproduce remote authentication, message delivery, or live AI generation without a backend.

## Verification

- All five VIN chart types, sort Cancel/Apply, ascending order, refresh, and exact Info text were checked in the local browser.
- Table dialog columns/rounding, fullscreen/collapse, notes with chart references, edit/remove, and persistence were checked.
- Sharing platform fields, sample recipient search, required selections, and the local-only result were checked.
- Generated embeds were opened and verified with the title hidden and only CSV export enabled. URL round-trip tests cover filters, selections, type, sort, and invalid settings.
- Comparison copies, category isolation, all three grid choices, removal, and nested filter/Escape behavior were checked.
- Generate, prompt rankings, saved results, Auto RCA, period choices, point selection, fit/reset, monthly analysis, donut selection, and drill-table analysis were checked.
- Downloaded PNG labels and PDF pages were visually inspected. Excel XML preserves numeric cells and complete data; CSV contains the displayed six VIN values. Comparison PNG/PDF files were also generated.
- Phone-size layouts were inspected at 390 × 844. Production build and 31 data/interaction tests passed; no browser console errors were observed.

These checks cover the inspected toolbar workflows. Live AI, real message delivery, private/SSO authentication, and complete historical production records need the separate backend platform.
