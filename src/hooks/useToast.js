import { useEffect, useRef, useState } from "react";

// Shows one short notice at a time and clears its timer when the page closes.
export function useToast() {
  const [toast, setToast] = useState("");
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Replaces the current notice and hides it after a few seconds.
  function notify(message) {
    clearTimeout(timer.current);
    setToast(message);
    timer.current = setTimeout(() => setToast(""), 3200);
  }

  return { toast, notify };
}
