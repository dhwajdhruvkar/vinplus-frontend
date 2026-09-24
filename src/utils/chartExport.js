import { downloadFile } from "./browser.js";
import { detailValue } from "../data/detailData.js";

// Renders the displayed chart or all table rows onto a canvas for local exports.
export async function panelCanvas(element, rows = [], columns = []) {
  const svg = element.querySelector(".chart-canvas svg");
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  if (svg) {
    const copy = svg.cloneNode(true);
    const bounds = svg.getBoundingClientRect();
    copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    copy.setAttribute("width", bounds.width);
    copy.setAttribute("height", bounds.height);
    const sourceText = svg.querySelectorAll("text");
    copy.querySelectorAll("text").forEach((node, index) => {
      const style = getComputedStyle(sourceText[index]);
      node.setAttribute("font-family", "Arial, sans-serif");
      node.setAttribute("font-size", style.fontSize);
      node.setAttribute("font-weight", style.fontWeight);
      node.setAttribute("fill", style.fill);
    });
    copy
      .querySelectorAll(".grid-line")
      .forEach((node) => node.setAttribute("stroke", "#eeeeee"));
    copy
      .querySelectorAll(".axis-line")
      .forEach((node) => node.setAttribute("stroke", "#565656"));
    copy.querySelectorAll(".donut-connector").forEach((node) => {
      node.setAttribute("fill", "none");
      node.setAttribute("stroke", "#b8beca");
    });
    const url = URL.createObjectURL(
      new Blob([new XMLSerializer().serializeToString(copy)], {
        type: "image/svg+xml",
      }),
    );
    try {
      const picture = new Image();
      picture.src = url;
      await picture.decode();
      canvas.width = Math.ceil(bounds.width * 2);
      canvas.height = Math.ceil(bounds.height * 2);
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(picture, 0, 0, canvas.width, canvas.height);
    } finally {
      URL.revokeObjectURL(url);
    }
  } else {
    canvas.width = columns.length * 200;
    canvas.height = Math.max(100, (rows.length + 1) * 36);
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = "12px Arial";
    columns.forEach(([, label], index) => {
      context.fillStyle = "#333";
      context.fillText(label, index * 200 + 8, 24, 185);
    });
    rows.forEach((row, rowIndex) =>
      columns.forEach(([key, , format], index) =>
        context.fillText(
          String(detailValue(row[key], format)),
          index * 200 + 8,
          (rowIndex + 2) * 36 - 12,
          185,
        ),
      ),
    );
  }
  return canvas;
}

// Downloads a canvas as a PNG image and reports rendering failures.
export async function saveCanvasImage(canvas, name) {
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Image export failed");
  downloadFile(`${name}.png`, blob);
}

// Creates a PNG from the selected chart or detail table.
export async function exportPanelImage(element, name, rows, columns) {
  await saveCanvasImage(await panelCanvas(element, rows, columns), name);
}

// Writes a real PDF, splitting tall charts or tables across readable pages.
export async function saveCanvasPDF(canvas, name, title) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    unit: "pt",
    format: "a4",
  });
  const width = pdf.internal.pageSize.getWidth() - 48;
  const height = pdf.internal.pageSize.getHeight() - 76;
  const sliceHeight = Math.max(1, Math.floor((height * canvas.width) / width));
  for (let top = 0; top < canvas.height; top += sliceHeight) {
    if (top) pdf.addPage();
    pdf.setFontSize(12);
    pdf.text(title, 24, 28, { maxWidth: width });
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = Math.min(sliceHeight, canvas.height - top);
    slice
      .getContext("2d")
      .drawImage(
        canvas,
        0,
        top,
        slice.width,
        slice.height,
        0,
        0,
        slice.width,
        slice.height,
      );
    pdf.addImage(
      slice.toDataURL("image/png"),
      "PNG",
      24,
      48,
      width,
      (slice.height * width) / slice.width,
    );
  }
  downloadFile(`${name}.pdf`, pdf.output("blob"));
}

// Downloads the current chart as a PDF without opening the browser print dialog.
export async function exportPanelPDF(element, name, rows, columns, title) {
  await saveCanvasPDF(await panelCanvas(element, rows, columns), name, title);
}

// Preserves numeric cell types and treats text as text in the Excel workbook.
export function excelCells(rows, columns) {
  return [
    columns.map(([, label]) => ({ value: label, fontWeight: "bold" })),
    ...rows.map((row) =>
      columns.map(([key, , format]) => {
        const value = row[key] ?? "";
        return {
          value,
          type: typeof value === "number" ? Number : String,
          ...(typeof value === "number" && format === "money"
            ? { format: '"$"#,##0.00' }
            : {}),
        };
      }),
    ),
  ];
}

// Loads the spreadsheet writer only when an Excel export is requested.
export async function exportPanelExcel(name, rows, columns) {
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  const blob = await writeExcelFile(excelCells(rows, columns), {
    columns: columns.map(([, label]) => ({
      width: Math.max(18, label.length + 2),
    })),
  }).toBlob();
  downloadFile(`${name}.xlsx`, blob);
}

// Combines every comparison card into one image using its on-screen grid positions.
export async function comparisonCanvas(element) {
  const bounds = element.getBoundingClientRect();
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(bounds.width * 2);
  canvas.height = Math.ceil(element.scrollHeight * 2);
  const context = canvas.getContext("2d");
  context.fillStyle = "#f1f4f8";
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (const card of element.querySelectorAll(".comparison-card")) {
    const rect = card.getBoundingClientRect();
    const x = (rect.left - bounds.left) * 2,
      y = (rect.top - bounds.top) * 2;
    const table = card.querySelector("table");
    const columns = table
      ? [...table.querySelectorAll("th")].map((cell, i) => [
          String(i),
          cell.textContent,
        ])
      : [];
    const rows = table
      ? [...table.querySelectorAll("tbody tr")].map((row) =>
          Object.fromEntries(
            [...row.querySelectorAll("td")].map((cell, i) => [
              String(i),
              cell.textContent,
            ]),
          ),
        )
      : [];
    const chart = await panelCanvas(card, rows, columns);
    context.fillStyle = "white";
    context.fillRect(x, y, rect.width * 2, rect.height * 2);
    context.fillStyle = "#354553";
    context.font = "22px Arial";
    context.fillText(
      card.querySelector("header strong")?.textContent || "Comparison",
      x + 20,
      y + 30,
    );
    const imageWidth = rect.width * 2 - 40;
    const imageHeight = Math.min(
      (chart.height * imageWidth) / chart.width,
      rect.height * 2 - 170,
    );
    context.drawImage(chart, x + 20, y + 50, imageWidth, imageHeight);
    context.font = "18px Arial";
    const footer = card.querySelector("footer");
    context.fillText("Current selection", x + 20, y + rect.height * 2 - 95);
    context.fillText(
      footer?.querySelector("p")?.textContent || "",
      x + 20,
      y + rect.height * 2 - 65,
      imageWidth,
    );
    context.fillText(
      [...card.querySelectorAll(".compare-chip")]
        .map((chip) => chip.textContent)
        .join(" · "),
      x + 20,
      y + rect.height * 2 - 30,
      imageWidth,
    );
  }
  return canvas;
}
