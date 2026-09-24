import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Icon from "../components/Icon.jsx";
import { createEmbedLink, embedControls } from "../data/embed.js";
import { useConversations } from "./ConversationContext.jsx";
import { channels, unreadCount } from "./conversationStore.js";
import { useLauncherMotion } from "./useLauncherMotion.js";

const channelClasses = {
  Outlook: "outlook",
  Teams: "teams",
  WhatsApp: "whatsapp",
  "In-app": "inapp",
};

// Draws small channel symbols locally without loading external assets or accounts.
export function ChannelIcon({ channel }) {
  if (channel === "In-app") return <Icon name="chat" size={15} />;
  if (channel === "WhatsApp")
    return (
      <svg
        viewBox="0 0 24 24"
        width="17"
        height="17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M20.5 11.5a9 9 0 0 1-13.4 7.8L3 20.5l1.2-4.1a9 9 0 1 1 16.3-4.9Z" />
        <path d="m8 7 2 3-1 1c1 2 2 3 4 4l1-1 3 2c-1 3-4 2-7-1S6 8 8 7Z" />
      </svg>
    );
  return (
    <span
      className={`conversation-channel-symbol ${channelClasses[channel]}`}
      aria-hidden="true"
    >
      {channel === "Outlook" ? "O" : "T"}
    </span>
  );
}

// Holds the launcher, unread badge, and a floating inbox that leaves charts usable.
export function ConversationWidget() {
  const inbox = useConversations();
  const panelRef = useRef(null);
  const launcherRef = useRef(null);
  const minimizeRef = useRef(null);
  useLauncherMotion(inbox.open, panelRef, launcherRef);
  const count = unreadCount(inbox.conversations);
  const threads = inbox.conversations
    .filter((item) => item.channel === inbox.channel)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const active =
    threads.find((item) => item.id === inbox.activeId) || threads[0];

  useEffect(() => {
    if (!inbox.open) return;
    // Runs after the Share dialog restores its old focus on unmount.
    const frame = requestAnimationFrame(() =>
      minimizeRef.current?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, [inbox.open]);

  // Minimizes the panel without discarding the selected thread or unsent text.
  function minimize() {
    inbox.setOpen(false);
    launcherRef.current?.focus({ preventScroll: true });
  }

  // Opens the last thread, or the first unread thread when no conversation is selected.
  function openInbox() {
    if (!active) {
      const next =
        inbox.conversations.find((item) => unreadCount([item])) ||
        inbox.conversations[0];
      if (next) {
        inbox.setActiveId(next.id);
        inbox.setChannel(next.channel);
      }
    }
    inbox.setOpen(true);
  }

  // Changes channels and supports the standard arrow-key behavior for tabs.
  function selectChannel(channel) {
    inbox.setChannel(channel);
    inbox.setActiveId(null);
  }

  return (
    <div className="conversation-widget">
      <section
        ref={panelRef}
        id="conversation-inbox"
        role="dialog"
        aria-modal="false"
        aria-labelledby="conversation-title"
        aria-hidden={!inbox.open}
        inert={!inbox.open}
        className="conversation-window"
        data-open={inbox.open}
        data-channel={channelClasses[inbox.channel]}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            minimize();
          }
        }}
      >
        <header className="conversation-header">
          <div className="conversation-heading-icon">
            <Icon name="chat" size={21} />
          </div>
          <div>
            <h2 id="conversation-title">Conversations</h2>
            <p>Your shared charts, in one place</p>
          </div>
          <button
            ref={minimizeRef}
            className="conversation-icon-button"
            title="Minimize conversations"
            aria-label="Minimize conversations"
            onClick={minimize}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M5 16h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>
        <div
          className="conversation-tabs"
          role="tablist"
          aria-label="Conversation channels"
        >
          {channels.map((channel, index) => {
            const unread = unreadCount(
              inbox.conversations.filter((item) => item.channel === channel),
            );
            return (
              <button
                key={channel}
                role="tab"
                id={`conversation-tab-${index}`}
                aria-controls="conversation-content"
                aria-selected={channel === inbox.channel}
                tabIndex={channel === inbox.channel ? 0 : -1}
                aria-label={`${channel}${unread ? `, ${unread} unread` : ""}`}
                className={`conversation-tab ${channelClasses[channel]}`}
                onClick={() => selectChannel(channel)}
                onKeyDown={(event) => {
                  const offset =
                    event.key === "ArrowRight"
                      ? 1
                      : event.key === "ArrowLeft"
                        ? -1
                        : 0;
                  if (!offset && !["Home", "End"].includes(event.key)) return;
                  event.preventDefault();
                  const next =
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? 3
                        : (index + offset + channels.length) % channels.length;
                  selectChannel(channels[next]);
                  event.currentTarget.parentElement.children[next].focus();
                }}
              >
                <ChannelIcon channel={channel} />
                <span>{channel}</span>
                {unread > 0 && (
                  <span className="conversation-tab-dot" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
        <div className="conversation-preview-notice">
          <span />
          Frontend preview · no messages are sent
        </div>
        {inbox.storageError && (
          <p className="conversation-storage-error" role="alert">
            {inbox.storageError}
          </p>
        )}
        <div
          id="conversation-content"
          role="tabpanel"
          className="conversation-content"
          aria-labelledby={`conversation-tab-${channels.indexOf(inbox.channel)}`}
        >
          {active ? (
            <>
              <div className="conversation-recipient">
                <span
                  className={`conversation-avatar ${channelClasses[inbox.channel]}`}
                  aria-hidden="true"
                >
                  {initials(active.recipient)}
                </span>
                <label>
                  <span>Conversation with</span>
                  <select
                    aria-label="Choose conversation"
                    value={active.id}
                    onChange={(event) => inbox.setActiveId(event.target.value)}
                  >
                    {threads.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.recipient.replaceAll("-", " ")} ·{" "}
                        {item.chart.title}
                        {unreadCount([item])
                          ? ` (${unreadCount([item])} unread)`
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="conversation-sample-label">Sample</span>
              </div>
              <ConversationThread key={active.id} conversation={active} />
            </>
          ) : (
            <div className="conversation-empty">
              <span className="conversation-empty-icon">
                <ChannelIcon channel={inbox.channel} />
              </span>
              <h3>Start with a shared chart</h3>
              <p>
                Open a chart’s <strong>More → Share</strong> menu, choose{" "}
                {inbox.channel} and a recipient. Your conversation will appear
                here.
              </p>
              <div>
                <Icon name="pin" size={15} />
                The chart stays attached to the conversation.
              </div>
            </div>
          )}
        </div>
      </section>
      <button
        ref={launcherRef}
        className={`conversation-launcher ${inbox.open ? "is-open" : ""}`}
        aria-label={`${inbox.open ? "Minimize" : "Open"} conversations${count ? `, ${count} unread` : ""}`}
        aria-expanded={inbox.open}
        aria-controls="conversation-inbox"
        title={inbox.open ? "Minimize conversations" : "Open conversations"}
        onClick={() => (inbox.open ? minimize() : openInbox())}
        onKeyDown={(event) => {
          if (event.key === "Escape" && inbox.open) minimize();
        }}
      >
        <span className="conversation-launcher-chat">
          <Icon name="chat" size={26} />
        </span>
        <span className="conversation-launcher-close">
          <Icon name="close" size={25} />
        </span>
        {count > 0 && (
          <span key={count} className="conversation-badge" aria-hidden="true">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>
      <span
        className="conversation-screen-reader"
        role="status"
        aria-live="polite"
      >
        {count
          ? `${count} unread sample ${count === 1 ? "reply" : "replies"}`
          : ""}
      </span>
    </div>
  );
}

// Shows the pinned chart, message history, draft composer, and explicit reply preview.
function ConversationThread({ conversation }) {
  const inbox = useConversations();
  const history = useRef(null);
  const atEnd = useRef(true);
  const [nearEnd, setNearEnd] = useState(true);
  const draft = inbox.drafts[conversation.id] || "";
  const unread = unreadCount([conversation]);
  const pending = inbox.pendingReplies.includes(conversation.id);
  const lastId = conversation.messages.at(-1)?.id;
  const chart = conversation.chart;
  const link = createEmbedLink(
    window.location.href,
    chart.id,
    "private",
    embedControls.map(([key]) => key),
    chart.snapshot || {},
  );

  useLayoutEffect(() => {
    if (atEnd.current && history.current)
      history.current.scrollTop = history.current.scrollHeight;
  }, [lastId, inbox.open]);

  useEffect(() => {
    // Background tabs and older messages do not clear unseen replies.
    function markVisibleRead() {
      if (
        inbox.open &&
        nearEnd &&
        document.visibilityState === "visible" &&
        document.hasFocus() &&
        history.current
          ?.closest(".conversation-window")
          ?.contains(document.activeElement)
      )
        inbox.markRead(conversation.id);
    }
    markVisibleRead();
    window.addEventListener("focus", markVisibleRead);
    document.addEventListener("focusin", markVisibleRead);
    document.addEventListener("visibilitychange", markVisibleRead);
    return () => {
      window.removeEventListener("focus", markVisibleRead);
      document.removeEventListener("focusin", markVisibleRead);
      document.removeEventListener("visibilitychange", markVisibleRead);
    };
  }, [inbox.open, nearEnd, unread, conversation.id]);

  // Saves this draft and brings the latest message into view without changing charts.
  function submit(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    atEnd.current = true;
    setNearEnd(true);
    inbox.sendDraft(conversation.id, draft);
  }

  return (
    <>
      <a
        className="conversation-chart"
        href={link}
        target="_blank"
        rel="noreferrer"
      >
        <span className="conversation-chart-icon">
          <Icon name="bars" size={24} />
        </span>
        <span>
          <small>
            <Icon name="pin" size={11} />
            Shared chart
          </small>
          <strong>{chart.title}</strong>
          <span>
            {chart.snapshot?.filters?.from || "Current selection"}
            {chart.snapshot?.filters?.to
              ? ` – ${chart.snapshot.filters.to}`
              : ""}
          </span>
          <em>
            View shared chart <Icon name="arrow" size={13} />
          </em>
        </span>
      </a>
      <div
        className="conversation-history"
        ref={history}
        role="log"
        aria-label="Conversation messages"
        aria-live={inbox.open ? "polite" : "off"}
        onScroll={(event) => {
          const element = event.currentTarget;
          atEnd.current =
            element.scrollHeight - element.scrollTop - element.clientHeight <
            35;
          setNearEnd(atEnd.current);
        }}
      >
        <p className="conversation-history-start">
          Beginning of this chart conversation
        </p>
        {conversation.messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            recipient={conversation.recipient}
          />
        ))}
      </div>
      {!nearEnd && (
        <button
          className="conversation-new-messages"
          onClick={() => {
            history.current.scrollTop = history.current.scrollHeight;
            atEnd.current = true;
            setNearEnd(true);
          }}
        >
          {unread
            ? `${unread} new ${unread === 1 ? "reply" : "replies"}`
            : "Latest messages"}{" "}
          ↓
        </button>
      )}
      <div className="conversation-reply-preview">
        <span>
          {pending
            ? "Sample reply in 3 seconds…"
            : "Try the notification and reply flow"}
        </span>
        <button
          onClick={() => inbox.previewReply(conversation.id)}
          disabled={pending}
        >
          {pending ? "Minimize to see the badge" : "Preview incoming reply"}
        </button>
      </div>
      <form className="conversation-composer" onSubmit={submit}>
        <label
          className="conversation-screen-reader"
          htmlFor="conversation-message"
        >
          Message draft
        </label>
        <textarea
          id="conversation-message"
          placeholder="Write a message…"
          value={draft}
          maxLength={4000}
          rows={2}
          onChange={(event) =>
            inbox.setDrafts((previous) => ({
              ...previous,
              [conversation.id]: event.target.value,
            }))
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            )
              submit(event);
          }}
        />
        <div>
          <span>Saved locally · Enter to save</span>
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Save message draft"
            title="Save message draft"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path
                d="m3 3 18 9-18 9 3-9-3-9ZM6 12h15"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </form>
    </>
  );
}

// Displays plain message text with honest preview and local-draft status labels.
function MessageBubble({ message, recipient }) {
  const outgoing = message.direction === "outgoing";
  const date = new Date(message.createdAt);
  return (
    <article
      className={`conversation-message ${outgoing ? "outgoing" : "incoming"}`}
    >
      <span className="conversation-message-author">
        {outgoing ? "You" : `${recipient.replaceAll("-", " ")} · sample reply`}
      </span>
      <div>
        {message.sharedChart && (
          <small>
            <Icon name="share" size={12} />
            Chart shared in preview
          </small>
        )}
        <p>{message.body}</p>
      </div>
      <footer>
        {!Number.isNaN(date.valueOf()) && (
          <time dateTime={message.createdAt} title={date.toLocaleString()}>
            {date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        )}
        <span>· {outgoing ? "Local draft" : "Preview"}</span>
      </footer>
    </article>
  );
}

// Builds a compact avatar from a recipient's name.
function initials(name) {
  return name
    .replace(/\(sample\)/g, "")
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
