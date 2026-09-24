import React, { useState } from "react";
import { ChartPreview } from "./ChartPreview.jsx";
import { ChangeChart } from "./ChangeChart.jsx";
import { DetailTable } from "./DetailTable.jsx";
import { enrichRecord } from "../data/detailData.js";
import { FilterDrawer } from "./FilterDrawer.jsx";
import { SelectionBar } from "./SelectionBar.jsx";
import { Breadcrumbs } from "./Panel.jsx";
import { panels } from "../data/panels.js";
import { filterRecords, isFiltered, records } from "../data/dashboard.js";
import {
  matchSelections,
  hasRecordSelection,
  interactionReducer,
} from "../data/interactions.js";
import {
  chartFindings,
  periodMetrics,
  analysisRows,
} from "../data/analysis.js";
import Icon from "./Icon.jsx";

// Reads saved local findings while tolerating unavailable or older browser storage.
function savedFindings(id) {
  try {
    const saved = JSON.parse(localStorage.getItem(`vinplus-insights-${id}`));
    return Array.isArray(saved)
      ? saved.filter(
          (item) =>
            item &&
            Array.isArray(item.findings) &&
            item.findings.every((finding) => typeof finding === "string") &&
            typeof item.time === "string",
        )
      : [];
  } catch {
    return [];
  }
}

// Recreates the Insights and Guided RCA drawer using local chart calculations.
export function ChartInsights({ id, initialTab, rows, columns, snapshot }) {
  const [tab, setTab] = useState(initialTab);
  const [selected, setSelected] = useState("");
  const [frequency, setFrequency] = useState("YTD");
  const [fit, setFit] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [saved, setSaved] = useState(() => savedFindings(id));
  const [showSaved, setShowSaved] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState(snapshot.filters);
  const [selections, setSelections] = useState(
    snapshot.interactions.selections,
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const config = panels[id];
  const labelKey = columns[0]?.[0];
  const level = snapshot.interactions.levels[id] || 0;
  const currency = columns.some(([, , format]) => format === "money");
  const metric = id === "salesMix" ? "value" : config?.series[0]?.[0] || "loss";
  const metricLabel =
    config?.sortFields?.[0]?.[1] ||
    columns.find(([key]) => key === metric)?.[1] ||
    config?.series[0]?.[1] ||
    "Value";
  const available = matchSelections(
    filterRecords(records, filters),
    selections,
  );
  const locallyFiltered = isFiltered(filters) || hasRecordSelection(selections);
  const currentRows =
    filters === snapshot.filters &&
    selections === snapshot.interactions.selections
      ? rows
      : analysisRows(id, available, locallyFiltered, level);
  const field = id === "records" ? "ro" : level ? labelKey : config?.field;
  const categoryMetric = {
    "Misc Sales": "misc",
    "Labor Sales": "labor",
    "Part Sales": "parts",
    "Shop Supplies": "actual",
  }[selected];
  const periodMetric =
    id === "salesMix"
      ? categoryMetric
      : metric === "expected" && !currency
        ? "count"
        : metric;
  const periods = selected
    ? periodMetrics(
        available.map(enrichRecord),
        field,
        selected,
        periodMetric,
        frequency,
      )
    : [];
  const matching = selected
    ? currentRows.filter(
        (row) =>
          String(row[labelKey]) === selected ||
          (id === "monthly" && !level && selected === "2024-02"),
      )
    : currentRows;

  // Generates the same deterministic summary each time for the current local rows.
  function generate(text = "") {
    setGenerated({
      findings: chartFindings(matching, columns, text),
      prompt: text,
      time: new Date().toLocaleString(),
    });
    setShowSaved(false);
    setPrompt("");
    setMessage("");
  }

  // Opens the date-frequency analysis for a chart category.
  function selectValue(value) {
    setSelected(id === "monthly" && !level ? "2024-02" : String(value));
    setGenerated(null);
    setShowSaved(false);
    setMessage("");
  }

  // Starts analysis from the largest displayed metric, as a local automatic selection.
  function autoAnalyze() {
    const largest = [...currentRows].sort(
      (a, b) => (b[metric] || 0) - (a[metric] || 0),
    )[0];
    if (largest) selectValue(largest[labelKey]);
  }

  // Saves a generated view across dialog closes without contacting an insight service.
  function saveInsight() {
    if (!generated) return;
    const next = [...saved, generated];
    try {
      localStorage.setItem(`vinplus-insights-${id}`, JSON.stringify(next));
      setSaved(next);
      setMessage("Insight saved in this browser.");
    } catch {
      setMessage("This browser could not save the insight.");
    }
  }

  // Chooses a period for a closer summary without changing dashboard filters.
  function analyzePeriod(name) {
    const period = periods.find((row) => row.name === name);
    if (period)
      setGenerated({
        findings: [
          `${name}: ${period.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}. ${period.change === null ? "A preceding period is unavailable in the local dataset." : `Change from the preceding period: ${period.change.toFixed(2)}%.`}`,
        ],
        time: new Date().toLocaleString(),
      });
  }

  return (
    <div className="chart-insights">
      <div className="insight-tabs" role="tablist" aria-label="Chart analysis">
        {[
          ["insights", "AI Insights"],
          ["rca", "Guided RCA"],
        ].map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <SelectionBar
        filters={filters}
        selections={selections}
        onOpenFilters={() => setFilterOpen(true)}
        onFilterChange={(key, value) => {
          setFilters((current) => ({ ...current, [key]: value }));
          setGenerated(null);
        }}
        onClearSelection={(key) => {
          setSelections(
            (current) =>
              interactionReducer(
                { selections: current, levels: {} },
                { type: "remove", id: key },
              ).selections,
          );
          setGenerated(null);
        }}
      />
      {tab === "rca" && selected && (
        <div className="rca-breadcrumb">
          <button onClick={() => setSelected("")}>
            {config?.selection || "Chart"}
          </button>
          <span>›</span>
          <strong>{selected}</strong>
          <button
            className="reset-rca"
            onClick={() => {
              setSelected("");
              setGenerated(null);
            }}
          >
            ↺ Reset RCA
          </button>
        </div>
      )}
      <div className={`insight-columns ${fit ? "fit-analysis" : ""}`}>
        <section className="insight-chart">
          {tab === "rca" && (
            <div className="analysis-controls">
              <span className="rca-instruction">
                ⓘ{" "}
                {selected
                  ? "Select a date frequency and click a data point for RCA analysis."
                  : "Select to conduct RCA on any specific value."}
              </span>
              {!selected && <button onClick={autoAnalyze}>✦ Auto RCA</button>}
              <label>
                Fit to width
                <input
                  type="checkbox"
                  role="switch"
                  checked={fit}
                  onChange={(event) => setFit(event.target.checked)}
                />
              </label>
            </div>
          )}
          {tab === "rca" && selected ? (
            <>
              <div className="frequency-controls">
                <select aria-label="Date field" defaultValue="closedate">
                  <option>closedate</option>
                </select>
                {["YTD", "QTD", "MTD"].map((value) => (
                  <button
                    key={value}
                    aria-pressed={frequency === value}
                    onClick={() => {
                      setFrequency(value);
                      setGenerated(null);
                    }}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <p className="analysis-description">
                You are viewing change analysis on{" "}
                <strong>
                  {metricLabel} for {selected}
                </strong>{" "}
                by each closedate{" "}
                {frequency === "YTD"
                  ? "year"
                  : frequency === "QTD"
                    ? "quarter"
                    : "month"}
              </p>
              <ChangeChart
                data={periods}
                label={metricLabel}
                currency={currency}
                onSelect={analyzePeriod}
              />
              <div className="analysis-legend">
                <span>● {metricLabel}</span>
                <span>● Change Percentage</span>
              </div>
              <p className="muted">
                {periods.length < 2
                  ? "Fewer than two periods are available in the local sample. More history is needed to calculate a change."
                  : periods
                      .slice(1)
                      .map(
                        (period) =>
                          `${period.name}: ${period.change === null ? "—" : period.change.toFixed(2) + "%"}`,
                      )
                      .join(" · ")}
              </p>
            </>
          ) : (
            <>
              <h3>{config?.title || "RO Details"}</h3>
              {config?.crumbs && <Breadcrumbs items={config.crumbs} />}
              {level ? (
                <DetailTable
                  rows={currentRows}
                  columns={columns}
                  onSelect={
                    tab === "rca"
                      ? (key, row) => selectValue(row[labelKey])
                      : undefined
                  }
                />
              ) : (
                <ChartPreview
                  id={id}
                  rows={available}
                  filtered={locallyFiltered}
                  onSelect={tab === "rca" ? selectValue : undefined}
                  height={450}
                  mode={snapshot.mode}
                  sort={snapshot.sort}
                />
              )}
            </>
          )}
        </section>
        <section className="insight-results">
          <header>
            <span>{tab === "insights" ? "AI Insights" : "Insights"}</span>
            <label>
              Current
              <input
                type="checkbox"
                role="switch"
                aria-label="Show saved insights"
                checked={showSaved}
                onChange={(event) => setShowSaved(event.target.checked)}
              />
              Saved
            </label>
          </header>
          <div className="insight-output">
            {showSaved ? (
              saved.length ? (
                saved.map((item, index) => (
                  <article key={index}>
                    <FindingList report={item} />
                  </article>
                ))
              ) : (
                <div className="notes-empty">
                  <Icon name="note" size={48} />
                  <h3>No saved insights</h3>
                  <p>Save generated insights to view them here.</p>
                </div>
              )
            ) : generated ? (
              <>
                <FindingList report={generated} />
                <button className="outline-button" onClick={saveInsight}>
                  Save insight
                </button>
              </>
            ) : (
              <>
                <h3>Obtain insights generated by AI with just one click!</h3>
                <p>
                  These AI-generated insights get essential data findings,
                  analyze trends, pinpoint noteworthy changes, and provide
                  recommendations.
                </p>
                <button className="primary-button" onClick={() => generate()}>
                  Generate
                </button>
                <div className="ai-illustration" aria-hidden="true">
                  <span>AI</span>
                </div>
              </>
            )}
          </div>
          <form
            className="insight-prompt"
            onSubmit={(event) => {
              event.preventDefault();
              generate(prompt);
            }}
          >
            <Icon name="sparkle" />
            <input
              aria-label="Insight prompt"
              placeholder="To modify insights type your prompt here."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
            <button aria-label="Send insight prompt" disabled={!prompt.trim()}>
              <Icon name="arrow" />
            </button>
          </form>
          <p role="status">{message}</p>
          <p className="insight-boundary">
            ✓ Frontend preview: Generate and prompts use local calculations. No
            data is sent to an AI service.
          </p>
        </section>
      </div>
      {filterOpen && (
        <FilterDrawer
          filters={filters}
          onClose={() => setFilterOpen(false)}
          onApply={(draft) => {
            setFilters(draft);
            setGenerated(null);
            setFilterOpen(false);
          }}
        />
      )}
    </div>
  );
}

// Displays one generated or saved report in the result panel.
function FindingList({ report }) {
  return (
    <div className="finding-list">
      {report.prompt && (
        <p>
          <strong>Requested view:</strong> {report.prompt}
        </p>
      )}
      <strong>Insights</strong>
      <ul>
        {report.findings.length ? (
          report.findings.map((finding, index) => (
            <li key={index}>{finding}</li>
          ))
        ) : (
          <li>No numeric data is available for this selection.</li>
        )}
      </ul>
      <small>Generated on – {report.time}</small>
    </div>
  );
}
