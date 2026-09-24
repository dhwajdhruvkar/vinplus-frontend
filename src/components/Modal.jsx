import React from "react";
import { IconButton } from "./Panel.jsx";
import { useDialogFocus } from "../hooks/useDialogFocus.js";

// Displays dialog content with a close button, backdrop, and keyboard focus handling.
export function Modal({ title, children, onClose, wide = false }) {
  const ref = useDialogFocus(onClose);
  return (
    <div
      className="modal-backdrop centered"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`modal ${wide ? "wide" : ""}`}
        ref={ref}
      >
        <header>
          <h2 id="modal-title">{title}</h2>
          <IconButton icon="close" label="Close dialog" onClick={onClose} />
        </header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}
