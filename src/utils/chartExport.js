import { downloadFile } from "./browser.js";
import { detailValue } from "../data/detailData.js";

// Creates a PNG from the visible SVG chart or from the current detail table.
export async function exportPanelImage(element, name, rows, columns) {
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
    copy.querySelectorAll("text").forEach((node) => {
      node.setAttribute("font-family", "Arial, sans-serif");
      node.setAttribute("font-size", "11");
      node.setAttribute("fill", "#303030");
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
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Image export failed");
  downloadFile(`${name}.png`, blob);
}

// Limits the browser's print view to the chosen chart or table.
export function printPanel(element) {
  element.classList.add("print-target");
  document.body.classList.add("printing-panel");
  // Removes temporary print styles after printing or canceling.
  function finishPrint() {
    element.classList.remove("print-target");
    document.body.classList.remove("printing-panel");
  }
  window.addEventListener("afterprint", finishPrint, { once: true });
  window.print();
}
