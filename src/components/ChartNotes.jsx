import React, { useState } from "react";
import Icon from "./Icon.jsx";

// Loads the note list and preserves a note written by the earlier frontend.
function readNotes(id) {
  try {
    const saved = JSON.parse(
      localStorage.getItem(`vinplus-notes-${id}`) || "null",
    );
    if (Array.isArray(saved))
      return saved.filter(
        (note) =>
          note &&
          typeof note.id === "string" &&
          typeof note.text === "string" &&
          typeof note.image === "string",
      );
    const previous = localStorage.getItem(`vinplus-chart-note-${id}`);
    return previous
      ? [{ id: "previous", text: previous, created: "", image: "" }]
      : [];
  } catch {
    return [];
  }
}

// Manages multiple local notes and the chart image saved with each note.
export function ChartNotes({ id, title, image }) {
  const [notes, setNotes] = useState(() => readNotes(id));
  const [editing, setEditing] = useState(null);
  const [text, setText] = useState("");
  const [reference, setReference] = useState(false);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const active = notes.find((note) => note.id === selected);

  // Stores changes only when browser storage accepts the complete note list.
  function storeNotes(next) {
    try {
      localStorage.setItem(`vinplus-notes-${id}`, JSON.stringify(next));
      setNotes(next);
      setMessage("Note saved in this browser.");
      return true;
    } catch {
      setMessage(
        "This browser could not save the note. Try saving without a chart reference.",
      );
      return false;
    }
  }

  // Opens a clean editor, or loads a selected note for editing.
  function editNote(note) {
    setEditing(note?.id || "new");
    setText(note?.text || "");
    setReference(Boolean(note?.image));
    setMessage("");
  }

  // Saves the text and an optional image of the chart as it appeared when opened.
  function saveNote() {
    const previous = notes.find((note) => note.id === editing);
    const note = {
      id: previous?.id || crypto.randomUUID(),
      text: text.trim(),
      created: previous?.created || new Date().toLocaleString(),
      image: reference ? previous?.image || image : "",
    };
    const next = previous
      ? notes.map((item) => (item.id === note.id ? note : item))
      : [...notes, note];
    if (storeNotes(next)) {
      setEditing(null);
      setSelected(note.id);
    }
  }

  // Removes a local note while keeping the other notes and references unchanged.
  function removeNote(noteId) {
    if (storeNotes(notes.filter((note) => note.id !== noteId))) {
      if (selected === noteId) setSelected(null);
      setMessage("Note removed.");
    }
  }

  if (!notes.length && !editing)
    return (
      <div className="notes-empty">
        <Icon name="note" size={58} />
        <h3>No notes created yet</h3>
        <p>Add notes to view it here</p>
        <button className="outline-button" onClick={() => editNote()}>
          ＋ Add note
        </button>
      </div>
    );
  return (
    <div className="notes-layout">
      <section className="note-reference">
        {active?.image?.startsWith("data:image/png;base64,") ? (
          <>
            <h3>{title}</h3>
            <img
              src={active.image}
              alt={`Saved chart reference for ${title}`}
            />
            <p>{active.created}</p>
          </>
        ) : (
          <div className="notes-empty">
            <h3>No note with chart reference selected yet</h3>
            <p>
              Select a note with a chart reference from the right panel to view
              it here
            </p>
          </div>
        )}
      </section>
      <aside className="notes-list">
        <header>
          Notes
          {!editing && <button onClick={() => editNote()}>＋ Add note</button>}
        </header>
        {editing && (
          <div className="note-editor">
            <textarea
              aria-label="Note text"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <label>
              <input
                type="checkbox"
                checked={reference}
                onChange={(event) => setReference(event.target.checked)}
              />
              Save current state of the chart for reference
            </label>
            <div>
              <button
                className="primary-button"
                aria-label="Save note"
                disabled={!text.trim()}
                onClick={saveNote}
              >
                <Icon name="check" />
              </button>
              <button aria-label="Cancel note" onClick={() => setEditing(null)}>
                <Icon name="close" />
              </button>
            </div>
          </div>
        )}
        {notes.map((note) => (
          <article
            className={selected === note.id ? "selected-note" : ""}
            key={note.id}
          >
            <button
              className="note-content"
              onClick={() => setSelected(note.id)}
            >
              <p>{note.text}</p>
              <small>{note.created}</small>
              {note.image && <span>Chart reference</span>}
            </button>
            <div className="note-actions">
              <button
                aria-label={`Edit note ${note.text}`}
                onClick={() => editNote(note)}
              >
                <Icon name="edit" />
              </button>
              <button
                aria-label={`Remove note ${note.text}`}
                onClick={() => removeNote(note.id)}
              >
                Remove
              </button>
            </div>
          </article>
        ))}
        <p role="status">{message}</p>
      </aside>
    </div>
  );
}
