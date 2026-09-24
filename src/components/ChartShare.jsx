import React, { useContext, useState } from "react";
import { advisors, managers } from "../data/dashboard.js";
import { DashboardContext } from "./DashboardContext.jsx";
import { useConversations } from "../conversations/ConversationContext.jsx";

const platforms = ["In-app", "WhatsApp", "Teams", "Outlook"];
const recipients = [...new Set([...managers, ...advisors])];

// Keeps the original sharing choices and opens a local conversation for each recipient.
export function ChartShare({ id, title, snapshot, onClose }) {
  const { startConversation } = useConversations();
  const { embed } = useContext(DashboardContext);
  const [selected, setSelected] = useState(["In-app"]);
  const [users, setUsers] = useState({});
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const valid =
    selected.length > 0 &&
    selected.every((platform) => users[platform]?.length);

  // Saves a local share draft, without sending messages to another platform.
  function shareDraft(event) {
    event.preventDefault();
    try {
      localStorage.setItem(
        `vinplus-share-${id}`,
        JSON.stringify({
          title,
          platforms: selected,
          recipients: users,
          comment,
        }),
      );
      startConversation({
        chart: { id, title, snapshot },
        platforms: selected,
        recipients: users,
        comment,
      });
      if (embed) {
        setMessage(
          "Sharing draft saved locally. Open the dashboard to continue the conversation.",
        );
      } else {
        onClose();
      }
    } catch {
      setMessage("This browser could not save the sharing draft.");
    }
  }

  return (
    <form className="chart-share" onSubmit={shareDraft}>
      <strong>Select sharing platform</strong>
      <div className="sharing-platforms">
        {platforms.map((platform) => (
          <label key={platform}>
            <input
              type="checkbox"
              checked={selected.includes(platform)}
              onChange={(event) => {
                setSelected((current) =>
                  event.target.checked
                    ? [...current, platform]
                    : current.filter((value) => value !== platform),
                );
                setMessage("");
              }}
            />
            <span>{platform}</span>
          </label>
        ))}
      </div>
      {selected.map((platform) => (
        <div className="share-recipient-group" key={platform}>
          <RecipientPicker
            label={
              platform === "Teams"
                ? "Select channel"
                : `Add users in ${platform}`
            }
            options={
              platform === "Teams"
                ? ["Service team (sample)", "Managers (sample)"]
                : platform === "In-app"
                  ? [...recipients, "#Service team (sample)"]
                  : recipients
            }
            value={users[platform] || []}
            onChange={(value) => {
              setUsers((current) => ({ ...current, [platform]: value }));
              setMessage("");
            }}
            placeholder={
              platform === "Teams"
                ? "Please select a pre-configured Teams channel for sharing"
                : platform === "In-app"
                  ? "Type '@' for users and '#' for groups"
                  : "Type '@' for users"
            }
          />
          {platform === "WhatsApp" && (
            <p className="share-info">
              ⓘ WhatsApp Insights are exclusive to users with mobile numbers
              added in their profile.
            </p>
          )}
        </div>
      ))}
      <label className="share-comment">
        Comment <span>(optional)</span>
        <textarea
          aria-label="Add a comment"
          placeholder="Add a comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
      </label>
      <p role="status">{message}</p>
      {embed && message.startsWith("Sharing draft saved") && (
        <a href={window.location.pathname} target="_blank" rel="noreferrer">
          Open dashboard conversations
        </a>
      )}
      <p className="muted share-boundary">
        Frontend preview · recipients are sample choices. Share opens a local
        conversation with this chart attached. No messages are sent.
      </p>
      <div className="dialog-footer">
        <button type="button" onClick={onClose}>
          Cancel
        </button>
        <button className="primary-button" disabled={!valid}>
          Share
        </button>
      </div>
    </form>
  );
}

// Adds and removes searchable recipients without using a live user directory.
function RecipientPicker({ label, options, value, onChange, placeholder }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const matching = options.filter(
    (option) =>
      !value.includes(option) &&
      option.toLowerCase().includes(query.replace(/^[@#]/, "").toLowerCase()),
  );
  return (
    <div className="recipient-picker">
      <label>
        {label}
        <div className="recipient-input">
          {value.map((name) => (
            <span key={name}>
              {name}
              <button
                type="button"
                aria-label={`Remove ${name}`}
                onClick={() => onChange(value.filter((item) => item !== name))}
              >
                ×
              </button>
            </span>
          ))}
          <input
            aria-label={label}
            placeholder={value.length ? "Add another" : placeholder}
            value={query}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                setOpen(false);
              }
              if (event.key === "Enter") {
                event.preventDefault();
                if (matching[0]) {
                  onChange([...value, matching[0]]);
                  setQuery("");
                  setOpen(false);
                }
              }
            }}
          />
        </div>
      </label>
      {open && (
        <div
          className="recipient-options"
          role="listbox"
          aria-label={`${label} options`}
        >
          {matching.length ? (
            matching.map((name) => (
              <button
                type="button"
                role="option"
                aria-selected="false"
                key={name}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange([...value, name]);
                  setQuery("");
                  setOpen(false);
                }}
              >
                {name}
              </button>
            ))
          ) : (
            <p>No matching sample recipients</p>
          )}
        </div>
      )}
    </div>
  );
}
