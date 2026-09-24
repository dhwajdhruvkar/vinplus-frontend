import React, { useState } from "react";

// Keeps chart notes in this browser so the frontend works without a notes service.
export function ChartNotes({ id }) {
  const key = `vinplus-chart-note-${id}`;
  const [note, setNote] = useState(() => {
    try {
      return localStorage.getItem(key) || "";
    } catch {
      return "";
    }
  });
  const [message, setMessage] = useState("");

  // Saves the note locally and reports whether browser storage accepted it.
  function saveNote() {
    try {
      localStorage.setItem(key, note);
      setMessage("Note saved in this browser.");
    } catch {
      setMessage("This browser could not save the note.");
    }
  }

  return (
    <div className="chart-notes">
      <label htmlFor={`note-${id}`}>Chart note</label>
      <textarea
        id={`note-${id}`}
        value={note}
        onChange={(event) => {
          setNote(event.target.value);
          setMessage("");
        }}
        placeholder="Add a note"
      />
      <button className="primary-button" onClick={saveNote}>
        Save
      </button>
      <p role="status">{message}</p>
    </div>
  );
}
