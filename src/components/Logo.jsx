import React from "react";

// Displays the dashboard brand inside the About dialog.
export function Logo() {
  return (
    <div className="logo" aria-label="Lumenore">
      <svg width="18" height="25" viewBox="0 0 18 25" aria-hidden="true">
        <path d="M2 2h6v17h10v5H2z" fill="#88baca" />
        <path d="M2 2h6v17H2z" fill="#b4bcd9" />
      </svg>
      <span>UMENORE</span>
      <sup>AI</sup>
    </div>
  );
}
