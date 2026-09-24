import React, { useState } from "react";
import { ChartPreview } from "./ChartPreview.jsx";
import { detailValue } from "../data/detailData.js";

// Demonstrates the insight workflow using local calculations instead of an AI service.
export function ChartInsights({
  id,
  initialTab,
  rows,
  columns,
  sourceRows,
  filtered,
}) {
  const [tab, setTab] = useState(initialTab);
  const [selected, setSelected] = useState("");
  const [generated, setGenerated] = useState(false);
  const [saved, setSaved] = useState(null);
  const [showSaved, setShowSaved] = useState(false);
  const labelKey = columns[0]?.[0];
  const matching = selected
    ? rows.filter((row) => String(row[labelKey]) === selected)
    : rows;
  const metrics = columns.filter(([key]) =>
    matching.some((row) => typeof row[key] === "number"),
  );
  const findings = metrics.map(([key, label, format]) => {
    const ordered = [...matching].sort((a, b) => (b[key] || 0) - (a[key] || 0));
    const sum = matching.reduce(
      (total, row) => total + (Number(row[key]) || 0),
      0,
    );
    const total =
      format === "percent" && matching.length ? sum / matching.length : sum;
    return `${label}${format === "percent" ? " (average)" : ""}: ${detailValue(total, format)} across ${matching.length} entries. Highest: ${ordered[0]?.[labelKey] ?? "—"} (${detailValue(ordered[0]?.[key] || 0, format)}).`;
  });

  // Focuses guided analysis on a selected chart category.
  function selectValue(value) {
    setSelected(String(value));
    setGenerated(false);
    setShowSaved(false);
  }

  // Selects the largest available metric for a local automatic analysis.
  function autoAnalyze() {
    const metric = metrics[0]?.[0];
    const largest = [...rows].sort(
      (a, b) => (b[metric] || 0) - (a[metric] || 0),
    )[0];
    setSelected(largest ? String(largest[labelKey]) : "");
    setGenerated(true);
  }

  return (
    <div className="chart-insights">
      <div className="insight-tabs">
        <button
          className={tab === "insights" ? "active" : ""}
          onClick={() => setTab("insights")}
        >
          AI Insights
        </button>
        <button
          className={tab === "rca" ? "active" : ""}
          onClick={() => setTab("rca")}
        >
          Guided RCA
        </button>
      </div>
      <div className="insight-columns">
        <section>
          {tab === "rca" && (
            <div className="analysis-controls">
              <label>
                Select a value
                <select
                  value={selected}
                  onChange={(event) => selectValue(event.target.value)}
                >
                  <option value="">All values</option>
                  {rows.map((row, index) => (
                    <option key={index} value={String(row[labelKey])}>
                      {row[labelKey]}
                    </option>
                  ))}
                </select>
              </label>
              <button onClick={autoAnalyze}>Auto RCA</button>
            </div>
          )}
          <ChartPreview
            id={id}
            rows={sourceRows}
            filtered={filtered}
            onSelect={selectValue}
          />
        </section>
        <section className="insight-results">
          <label>
            <input
              type="checkbox"
              checked={showSaved}
              onChange={(event) => setShowSaved(event.target.checked)}
            />
            Saved
          </label>
          <h3>
            {tab === "rca"
              ? "Explore the selected value"
              : "Insights for this chart"}
          </h3>
          <p className="muted">
            Frontend preview · calculations use the displayed data.
          </p>
          {showSaved ? (
            saved ? (
              <ul>
                {saved.map((finding, index) => (
                  <li key={index}>{finding}</li>
                ))}
              </ul>
            ) : (
              <p>No saved insights in this session.</p>
            )
          ) : generated ? (
            <>
              <ul>
                {findings.length ? (
                  findings.map((finding, index) => (
                    <li key={index}>{finding}</li>
                  ))
                ) : (
                  <li>No numeric data available for this selection.</li>
                )}
              </ul>
              <button onClick={() => setSaved(findings)}>Save insight</button>
            </>
          ) : (
            <button
              className="primary-button"
              onClick={() => setGenerated(true)}
            >
              Generate
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
