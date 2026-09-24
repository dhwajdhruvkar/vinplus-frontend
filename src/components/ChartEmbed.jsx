import React, { useState } from "react";
import { embedControls, createEmbedLink, embedSnippet } from "../data/embed.js";
import { useClipboard } from "../hooks/useClipboard.js";

// Configures a standalone local chart, including its filters and visible controls.
export function ChartEmbed({ id, title, snapshot }) {
  const [type, setType] = useState("");
  const [controls, setControls] = useState(embedControls.map(([key]) => key));
  const [generated, setGenerated] = useState(null);
  const { copy, message } = useClipboard();
  const all = controls.length === embedControls.length;

  // Updates a draft option and invalidates a previously generated link.
  function changeControl(key, checked) {
    setControls((current) =>
      checked ? [...current, key] : current.filter((value) => value !== key),
    );
    setGenerated(null);
  }

  // Generates a preview URL; Public and Private do not create server permissions.
  function generateLink() {
    setGenerated(
      createEmbedLink(window.location.href, id, type, controls, snapshot),
    );
  }

  return (
    <div className="chart-embed">
      <p>Select embed type</p>
      <div
        className="embed-types"
        role="radiogroup"
        aria-label="Select embed type"
      >
        {[
          [
            "public",
            "Public",
            "Any user can view the KPI without any Authentication",
          ],
          [
            "private",
            "Private",
            "User with access to Lumenore can view the KPI",
          ],
          [
            "sso",
            "Private with SSO",
            "User with access to your application can view the KPI",
          ],
        ].map(([key, label, description]) => (
          <button
            key={key}
            role="radio"
            aria-checked={type === key}
            disabled={key === "sso"}
            onClick={() => {
              setType(key);
              setGenerated(null);
            }}
          >
            <strong>{label}</strong>
            <span>{description}</span>
          </button>
        ))}
      </div>
      <div className="embed-section-title">⚙ Customize</div>
      <div className="embed-checks">
        <label>
          <input
            type="checkbox"
            disabled={!type}
            checked={all}
            onChange={(event) => {
              setControls(
                event.target.checked ? embedControls.map(([key]) => key) : [],
              );
              setGenerated(null);
            }}
          />
          Select all
        </label>
        {embedControls.map(([key, label]) => (
          <label key={key}>
            <input
              type="checkbox"
              disabled={!type || all}
              checked={controls.includes(key)}
              onChange={(event) => changeControl(key, event.target.checked)}
            />
            {label}
          </label>
        ))}
      </div>
      <div className="dialog-footer">
        <button
          className="primary-button"
          disabled={!type}
          onClick={generateLink}
        >
          Generate embed link
        </button>
      </div>
      {generated && (
        <div className="embed-content">
          <label>
            Embed link
            <input aria-label="Embed link" readOnly value={generated} />
          </label>
          <label>
            Embed code
            <textarea
              aria-label="Embed code"
              readOnly
              value={embedSnippet(generated, title)}
            />
          </label>
          <button
            className="primary-button"
            onClick={() => copy(embedSnippet(generated, title))}
          >
            Copy embed code
          </button>
          <button onClick={() => copy(generated)}>Copy link</button>
          <a href={generated} target="_blank" rel="noreferrer">
            Open chart
          </a>
          <p role="status">{message}</p>
          <p className="muted">
            Local preview. Private access and SSO require authentication on your
            hosting platform.
          </p>
        </div>
      )}
    </div>
  );
}
