import React from "react";
import { Modal } from "./Modal.jsx";
import { DetailTable } from "./DetailTable.jsx";
import { QuickCompare } from "./QuickCompare.jsx";
import { ChartInsights } from "./ChartInsights.jsx";
import { ChartNotes } from "./ChartNotes.jsx";
import { ChartEmbed } from "./ChartEmbed.jsx";
import { ChartShare } from "./ChartShare.jsx";
import { panels } from "../data/panels.js";

// Chooses the matching source dialog, drawer, or full comparison page.
export function ChartDialog({
  kind,
  id,
  title,
  rows,
  columns,
  comparisonRows = [],
  comparisonFiltered = false,
  snapshot,
  noteImage,
  level,
  onClose,
}) {
  const heading = {
    table: title,
    compare: "Quick compare",
    embed: `Embed KPI : ${title}`,
    insights: "AI Insights",
    rca: "Guided RCA",
    notes: "Notes",
    share: "Share",
  }[kind];
  const subtitle = {
    compare: `Shop Supplies Analysiss → ${title}`,
    share: `You are sharing ${title}`,
    embed:
      "Embedding helps you to display visualization and dashboard features within existing business applications",
  }[kind];
  const variant = ["insights", "rca", "notes"].includes(kind)
    ? "drawer"
    : kind === "compare"
      ? "page"
      : kind === "table"
        ? "table"
        : kind;
  return (
    <Modal
      title={heading}
      subtitle={subtitle}
      onClose={onClose}
      variant={variant}
      wide={kind === "table"}
    >
      {kind === "table" && (
        <DetailTable
          rows={rows}
          columns={(!level && panels[id]?.tableColumns) || columns}
          label={`${title} table view`}
        />
      )}
      {kind === "embed" && (
        <ChartEmbed id={id} title={title} snapshot={snapshot} />
      )}
      {kind === "share" && (
        <ChartShare id={id} title={title} onClose={onClose} />
      )}
      {kind === "notes" && (
        <ChartNotes id={id} title={title} image={noteImage} />
      )}
      {kind === "compare" && (
        <QuickCompare
          id={id}
          rows={comparisonRows}
          filtered={comparisonFiltered}
          snapshot={snapshot}
        />
      )}
      {["insights", "rca"].includes(kind) && (
        <ChartInsights
          id={id}
          initialTab={kind}
          rows={rows}
          columns={columns}
          snapshot={snapshot}
        />
      )}
    </Modal>
  );
}
