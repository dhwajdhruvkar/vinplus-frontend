import React, { useId } from "react";
import { IconButton } from "./Panel.jsx";
import { useDialogFocus } from "../hooks/useDialogFocus.js";

// Displays dialog content with a close button, backdrop, and keyboard focus handling.
export function Modal({
  title,
  children,
  onClose,
  wide = false,
  variant = "",
  subtitle,
  actions,
}) {
  const ref = useDialogFocus(onClose);
  const titleId = useId();
  return (
    <div
      className={`modal-backdrop centered ${variant ? `backdrop-${variant}` : ""}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`modal ${wide ? "wide" : ""} ${variant ? `modal-${variant}` : ""}`}
        ref={ref}
      >
        <header>
          {variant === "page" && (
            <IconButton
              icon="back"
              label="Back to dashboard"
              onClick={onClose}
            />
          )}
          <div className="modal-heading">
            <h2 id={titleId}>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions}
          {variant !== "page" && (
            <IconButton icon="close" label="Close dialog" onClick={onClose} />
          )}
        </header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}
