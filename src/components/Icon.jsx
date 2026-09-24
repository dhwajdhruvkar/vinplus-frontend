import React from "react";
const paths = {
  up: "M12 21V3M5 10l7-7 7 7",
  collapse: "M4 10h6V4M20 14h-6v6M3 3l7 7M21 21l-7-7",
  bars: "M4 21V10h4v11M10 21V3h4v18M16 21V7h4v14",
  sort: "M4 6h9M4 12h7M4 18h5M18 3v18M15 18l3 3 3-3",
  home: "M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  data: "M20 6c0 2-16 2-16 0s16-2 16 0ZM4 6v12c0 3 16 3 16 0V6M4 12c0 3 16 3 16 0",
  bulb: "M9 18h6M10 21h4M8 15c-7-7 1-16 7-10 4 4 0 8-1 10v2H9v-2M12 8v7",
  magnet: "M5 5v7a7 7 0 0 0 14 0V5h-5v7a2 2 0 0 1-4 0V5ZM5 8h5M14 8h5",
  settings:
    "M10 3h4l1 3 3 1 3 3v4l-3 1-1 3-3 3h-4l-1-3-3-1-3-3v-4l3-1 1-3ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  search: "M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM15 15l6 6",
  filter: "M4 4h16l-6 8v8l-4-2v-6Z",
  refresh: "M20 6v5h-5M20 11a8 8 0 1 0-2 7",
  pin: "m15 3 6 6-5 1-3 4-3-3 4-3ZM11 13l-7 7M7 8l9 9",
  edit: "m16 3 5 5-12 12-6 1 1-6ZM13 6l5 5",
  insight:
    "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0ZM12 12h.01",
  dots: "M12 5h.01M12 12h.01M12 19h.01",
  arrow: "M4 12h16M14 6l6 6-6 6",
  chevron: "m6 9 6 6 6-6",
  close: "m5 5 14 14M5 19 19 5",
  calendar:
    "M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2ZM7 2v5M17 2v5M3 10h18M8 14h3v3H8z",
  info: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 11v6M12 7h.01",
  bell: "M18 8a6 6 0 0 0-12 0v8l-2 2h16l-2-2ZM10 21h4",
  help: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9 8c1-4 8-1 4 3l-1 2M12 17h.01",
  chat: "M3 4h18v13H9l-5 4v-4H3ZM8 8h8M8 12h5",
  user: "M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM5 21v-3c0-7 14-7 14 0v3Z",
  rocket:
    "M10 14 7 11C11 3 17 2 21 3c1 4 0 10-8 14l-3-3ZM14 8l2 2M7 11l-4 1 4-7 5 1M13 17l-1 4 7-4-1-5M6 16l-3 5 5-3",
  sparkle: "m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3ZM20 2v4M18 4h4",
  tree: "M4 3v16h5M4 8h5M13 6h6v4h-6zM13 17h6v4h-6zM2 2h4v3H2z",
  play: "m7 4 13 8-13 8Z",
  download: "M12 3v12M7 10l5 5 5-5M4 17v4h16v-4",
  check: "m4 12 5 5L20 6",
  menu: "M3 5h18M3 12h18M3 19h18",
  back: "M20 12H4M10 6l-6 6 6 6",
};
// Draws a local SVG icon using the requested name and size.
export default function Icon({ name, size = 16, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.grid} />
    </svg>
  );
}
