import React, { useState } from "react";
import { Modal } from "./Modal.jsx";
import { DetailTable } from "./DetailTable.jsx";
import { QuickCompare } from "./QuickCompare.jsx";
import { ChartInsights } from "./ChartInsights.jsx";
import { ChartNotes } from "./ChartNotes.jsx";

// Shows frontend comparisons, descriptive insights, and a working chart embed link.
export function ChartDialog({
  kind,
  id,
  title,
  rows,
  columns,
  description,
  comparisonRows = [],
  comparisonFiltered = false,
  onClose,
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const embedUrl = `${window.location.origin}${window.location.pathname}?chart=${encodeURIComponent(id)}`;
  const snippet = `<iframe src="${embedUrl}" title="${title}" width="100%" height="500" style="border:0"></iframe>`;
  const heading = {
    compare: "Quick compare",
    embed: "Embed",
    insights: "AI Insights",
    rca: "Guided RCA",
    info: "Information",
    notes: "Notes",
    share: "Share",
  }[kind];

  // Copies the local embed code and reports clipboard failures in the dialog.
  async function copyEmbed(value = snippet) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setCopyError("");
    } catch {
      setCopied(false);
      setCopyError(
        "Copy is unavailable. Select the text and copy it manually.",
      );
    }
  }

  return (
    <Modal
      title={`${heading} · ${title}`}
      onClose={onClose}
      wide={["compare", "rca", "insights"].includes(kind)}
    >
      {kind === "embed" ? (
        <div className="embed-content">
          <p>Embed this chart from the running frontend.</p>
          <textarea aria-label="Embed code" readOnly value={snippet} />
          <button className="primary-button" onClick={() => copyEmbed()}>
            {copied ? "Copied" : "Copy"}
          </button>
          <a href={embedUrl} target="_blank" rel="noreferrer">
            Open chart
          </a>
          <p role="status">{copyError}</p>
        </div>
      ) : kind === "share" ? (
        <div className="embed-content">
          <p>Copy the link to this frontend chart.</p>
          <input aria-label="Chart link" readOnly value={embedUrl} />
          <button
            className="primary-button"
            onClick={() => copyEmbed(embedUrl)}
          >
            {copied ? "Copied" : "Copy link"}
          </button>
          <p role="status">{copyError}</p>
          <a href={embedUrl} target="_blank" rel="noreferrer">
            Open chart
          </a>
        </div>
      ) : kind === "notes" ? (
        <ChartNotes id={id} />
      ) : kind === "compare" ? (
        <QuickCompare
          id={id}
          rows={comparisonRows}
          filtered={comparisonFiltered}
        />
      ) : ["insights", "rca"].includes(kind) ? (
        <ChartInsights
          id={id}
          initialTab={kind}
          rows={rows}
          columns={columns}
          sourceRows={comparisonRows}
          filtered={comparisonFiltered}
        />
      ) : (
        <>
          <p>{description}</p>
          <p>
            {rows.length} {rows.length === 1 ? "entry" : "entries"} in the
            current selection.
          </p>
          {kind !== "info" && (
            <>
              <p className="muted">
                Calculated from the displayed frontend data.
              </p>
              <DetailTable
                rows={rows}
                columns={columns}
                label={`${heading} data`}
              />
            </>
          )}
        </>
      )}
    </Modal>
  );
}
