import { useEffect, useRef } from "react";

// Keeps keyboard focus inside a dialog and returns it to the opener on close.
export function useDialogFocus(onClose) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previousElement = document.activeElement;
    const container = ref.current;

    // Reads the controls again so focus stays correct when dialog content changes.
    function focusableElements() {
      return [
        ...container.querySelectorAll(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea, a[href], [tabindex="0"]',
        ),
      ];
    }

    // Handles Escape and wraps Tab navigation between the first and last controls.
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeRef.current();
      }
      if (event.key !== "Tab") return;

      const elements = focusableElements();
      const first = elements[0];
      const last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    focusableElements()[0]?.focus();
    container.addEventListener("keydown", handleKeyDown);
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      previousElement?.focus();
    };
  }, []);

  return ref;
}
