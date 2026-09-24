import { useState } from "react";

// Copies visible text and reports clipboard failures without losing the text.
export function useClipboard() {
  const [message, setMessage] = useState("");
  // Copies the requested value when the browser allows clipboard access.
  async function copy(value) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage("Copied");
    } catch {
      setMessage("Select the text and copy it manually.");
    }
  }
  return { copy, message };
}
