import { useEffect } from "react";

// Keeps keyboard focus in the expanded panel and returns it on collapse.
export function useFullscreenFocus(ref, fullscreen) {
  useEffect(() => {
    if (!fullscreen) return;
    const panel = ref.current;
    const previous = document.activeElement;

    // Reads current controls because menus and drill tables can change while expanded.
    function controls() {
      return [
        ...panel.querySelectorAll(
          'button:not(:disabled), input, select, textarea, a[href], [tabindex="0"]',
        ),
      ].filter((element) => element.getClientRects().length);
    }

    // Wraps Tab at the panel edges; nested dialogs handle their own focus.
    function handleTab(event) {
      if (event.key !== "Tab" || event.target.closest('[role="dialog"]'))
        return;
      const items = controls();
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    controls()[0]?.focus();
    panel.addEventListener("keydown", handleTab);
    return () => {
      panel.removeEventListener("keydown", handleTab);
      const returnTarget =
        previous?.isConnected && previous !== document.body
          ? previous
          : panel.querySelector('button[aria-label^="More "]');
      returnTarget?.focus();
    };
  }, [ref, fullscreen]);
}
