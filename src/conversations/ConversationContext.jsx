import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  appendMessage,
  markConversationRead,
  readConversations,
  saveConversations,
  shareConversations,
} from "./conversationStore.js";

const ConversationContext = createContext(null);

// Shares local conversation state between chart Share dialogs and the floating inbox.
export function ConversationProvider({ children }) {
  const [conversations, setConversations] = useState(() => {
    try {
      return readConversations(window.localStorage);
    } catch {
      return [];
    }
  });
  const current = useRef(conversations);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [channel, setChannel] = useState("In-app");
  const [drafts, setDrafts] = useState({});
  const [storageError, setStorageError] = useState("");
  const [pendingReplies, setPendingReplies] = useState([]);
  const replyTimers = useRef(new Map());

  useEffect(
    () => () => {
      replyTimers.current.forEach((timer) => clearTimeout(timer));
      replyTimers.current.clear();
    },
    [],
  );

  // Keeps rapid actions in order and retains history in this browser when possible.
  function update(next) {
    current.current = next;
    setConversations(next);
    let saved = false;
    try {
      saved = saveConversations(window.localStorage, next);
    } catch {
      /* Some browsers deny access to localStorage itself. */
    }
    setStorageError(
      saved
        ? ""
        : "Browser storage is unavailable. These previews will be lost on refresh.",
    );
    return saved;
  }

  // Opens the recipient's thread immediately after the chart Share form is submitted.
  function startConversation(share) {
    const result = shareConversations(current.current, share);
    update(result.conversations);
    const selected = result.conversations.find(
      (item) => item.id === result.opened[0],
    );
    if (selected) {
      setActiveId(selected.id);
      setChannel(selected.channel);
      setOpen(true);
    }
  }

  // Saves an outgoing message locally; no delivery status is invented.
  function sendDraft(id, body) {
    update(appendMessage(current.current, id, body, "outgoing"));
    setDrafts((previous) => ({ ...previous, [id]: "" }));
  }

  // Clears this thread's badge only when the widget has actually displayed its replies.
  function markRead(id) {
    const thread = current.current.find((item) => item.id === id);
    if (thread?.messages.some((message) => !message.read)) {
      update(markConversationRead(current.current, id));
    }
  }

  // Schedules a clearly labeled sample reply so the minimized notification can be tried.
  function previewReply(id) {
    if (replyTimers.current.has(id)) return;
    setPendingReplies((previous) => [...previous, id]);
    replyTimers.current.set(
      id,
      setTimeout(() => {
        update(
          appendMessage(
            current.current,
            id,
            "This is a sample reply. I’ll review the shared chart and follow up here.",
            "incoming",
          ),
        );
        replyTimers.current.delete(id);
        setPendingReplies((previous) =>
          previous.filter((value) => value !== id),
        );
      }, 3000),
    );
  }

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        open,
        setOpen,
        activeId,
        setActiveId,
        channel,
        setChannel,
        drafts,
        setDrafts,
        storageError,
        pendingReplies,
        startConversation,
        sendDraft,
        markRead,
        previewReply,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

// Gives sharing and inbox components access to the same conversation state.
export function useConversations() {
  return useContext(ConversationContext);
}
