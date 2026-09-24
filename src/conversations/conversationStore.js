export const CONVERSATION_KEY = "vinplus-conversations-v1";
export const channels = ["Outlook", "Teams", "WhatsApp", "In-app"];
const MAX_CONVERSATIONS = 100;
const MAX_MESSAGES = 200;

// Creates browser-only IDs for drafts and sample messages.
export function createId() {
  return crypto.randomUUID();
}

// Reads local previews safely; damaged or unsupported entries are ignored.
export function readConversations(storage) {
  try {
    const saved = JSON.parse(storage.getItem(CONVERSATION_KEY));
    if (saved?.version !== 1 || !Array.isArray(saved.conversations)) return [];
    return saved.conversations
      .filter(isConversation)
      .slice(0, MAX_CONVERSATIONS);
  } catch {
    return [];
  }
}

// Checks stored data before the UI tries to display a conversation.
function isConversation(item) {
  return (
    item &&
    typeof item.id === "string" &&
    channels.includes(item.channel) &&
    typeof item.recipient === "string" &&
    typeof item.chart?.id === "string" &&
    typeof item.chart.title === "string" &&
    typeof item.updatedAt === "string" &&
    Array.isArray(item.messages) &&
    item.messages.length <= MAX_MESSAGES &&
    item.messages.every(
      (message) =>
        message &&
        typeof message.id === "string" &&
        typeof message.body === "string" &&
        typeof message.createdAt === "string" &&
        ["incoming", "outgoing"].includes(message.direction) &&
        typeof message.read === "boolean",
    )
  );
}

// Saves preview history and reports storage failures without pretending it was saved.
export function saveConversations(storage, conversations) {
  try {
    storage.setItem(
      CONVERSATION_KEY,
      JSON.stringify({ version: 1, conversations }),
    );
    return true;
  } catch {
    return false;
  }
}

// Counts only unread incoming messages, so local outgoing drafts never create a badge.
export function unreadCount(conversations) {
  return conversations.reduce(
    (total, item) =>
      total +
      item.messages.filter(
        (message) => message.direction === "incoming" && !message.read,
      ).length,
    0,
  );
}

// Starts one private preview per recipient and channel, reusing its chart thread.
export function shareConversations(
  current,
  share,
  makeId = createId,
  now = new Date().toISOString(),
) {
  let conversations = [...current];
  const opened = [];
  for (const channel of share.platforms) {
    for (const recipient of new Set(share.recipients[channel] || [])) {
      if (!channels.includes(channel) || !recipient.trim()) continue;
      const previous = conversations.find(
        (item) =>
          item.channel === channel &&
          item.recipient === recipient &&
          item.chart.id === share.chart.id,
      );
      const conversation = {
        id: previous?.id || makeId(),
        channel,
        recipient,
        chart: structuredClone(share.chart),
        updatedAt: now,
        messages: [
          ...(previous?.messages || []),
          {
            id: makeId(),
            body: share.comment.trim() || "Shared a chart for review.",
            direction: "outgoing",
            createdAt: now,
            read: true,
            sharedChart: true,
          },
        ].slice(-MAX_MESSAGES),
      };
      conversations = [
        conversation,
        ...conversations.filter((item) => item.id !== conversation.id),
      ];
      opened.push(conversation.id);
    }
  }
  return { conversations: conversations.slice(0, MAX_CONVERSATIONS), opened };
}

// Adds a local draft or an explicitly requested sample reply to one conversation.
export function appendMessage(
  current,
  id,
  body,
  direction,
  makeId = createId,
  now = new Date().toISOString(),
) {
  if (!body.trim()) return current;
  return current.map((item) =>
    item.id !== id
      ? item
      : {
          ...item,
          updatedAt: now,
          messages: [
            ...item.messages,
            {
              id: makeId(),
              body: body.trim(),
              direction,
              createdAt: now,
              read: direction === "outgoing",
            },
          ].slice(-MAX_MESSAGES),
        },
  );
}

// Marks only the selected conversation's incoming messages as read.
export function markConversationRead(current, id) {
  return current.map((item) =>
    item.id !== id
      ? item
      : {
          ...item,
          messages: item.messages.map((message) => ({
            ...message,
            read: true,
          })),
        },
  );
}
