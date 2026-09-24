import test from "node:test";
import assert from "node:assert/strict";
import {
  CONVERSATION_KEY,
  appendMessage,
  markConversationRead,
  readConversations,
  saveConversations,
  shareConversations,
  unreadCount,
} from "../src/conversations/conversationStore.js";

const now = "2026-09-25T09:00:00Z";
const share = {
  chart: {
    id: "advisor",
    title: "Service Advisor Performance",
    snapshot: {
      filters: { from: "2024-02-01", to: "2024-02-13", advisor: ["Alex"] },
      mode: "bar",
    },
  },
  platforms: ["Outlook", "WhatsApp"],
  recipients: { Outlook: ["Alex", "Sam"], WhatsApp: ["Alex"] },
  comment: "Please review these totals.",
};

// Supplies predictable IDs so message and recipient relationships can be checked.
function makeIds() {
  let index = 0;
  return () => `test-${++index}`;
}

test("sharing separates recipients and channels and copies the selected chart state", () => {
  const result = shareConversations([], share, makeIds(), now);
  assert.equal(result.conversations.length, 3);
  assert.equal(result.opened.length, 3);
  assert.equal(unreadCount(result.conversations), 0);
  const outlookAlex = result.conversations.find(
    (item) => item.channel === "Outlook" && item.recipient === "Alex",
  );
  assert.equal(outlookAlex.messages[0].body, share.comment);
  assert.deepEqual(outlookAlex.chart.snapshot, share.chart.snapshot);
  assert.notEqual(outlookAlex.chart.snapshot, share.chart.snapshot);
  assert.equal(outlookAlex.messages[0].direction, "outgoing");
  assert.equal(outlookAlex.messages[0].sharedChart, true);
});

test("sharing again reuses only the matching chart, person and channel", () => {
  const ids = makeIds();
  const initial = shareConversations([], share, ids, now);
  const next = shareConversations(
    initial.conversations,
    { ...share, comment: "Updated selection" },
    ids,
    now,
  );
  assert.equal(next.conversations.length, 3);
  assert.deepEqual(next.opened, initial.opened);
  assert.ok(next.conversations.every((item) => item.messages.length === 2));
  assert.ok(initial.conversations.every((item) => item.messages.length === 1));
  const other = shareConversations(
    next.conversations,
    { ...share, chart: { ...share.chart, id: "manager" } },
    ids,
    now,
  );
  assert.equal(other.conversations.length, 6);
});

test("duplicates, unsupported channels and blank recipients cannot create extra threads", () => {
  const result = shareConversations(
    [],
    {
      ...share,
      platforms: ["Outlook", "Unknown"],
      recipients: { Outlook: ["Alex", "Alex", " "], Unknown: ["Sam"] },
    },
    makeIds(),
    now,
  );
  assert.equal(result.conversations.length, 1);
});

test("reply badges count incoming messages and clear only the thread being viewed", () => {
  const ids = makeIds();
  const { conversations, opened } = shareConversations([], share, ids, now);
  let next = appendMessage(
    conversations,
    opened[0],
    "Reply one",
    "incoming",
    ids,
    now,
  );
  next = appendMessage(next, opened[1], "Reply two", "incoming", ids, now);
  next = appendMessage(next, opened[0], "A local draft", "outgoing", ids, now);
  assert.equal(unreadCount(next), 2);
  next = markConversationRead(next, opened[0]);
  assert.equal(unreadCount(next), 1);
  assert.equal(unreadCount(conversations), 0);
  assert.equal(
    next.find((item) => item.id === opened[1]).messages.at(-1).read,
    false,
  );
});

test("empty drafts do not create messages and plain text is kept intact", () => {
  const ids = makeIds();
  const { conversations, opened } = shareConversations([], share, ids, now);
  assert.equal(
    appendMessage(conversations, opened[0], "  ", "outgoing", ids, now),
    conversations,
  );
  const next = appendMessage(
    conversations,
    opened[0],
    "<script>literal text</script>\nNew line",
    "outgoing",
    ids,
    now,
  );
  assert.equal(
    next.find((item) => item.id === opened[0]).messages.at(-1).body,
    "<script>literal text</script>\nNew line",
  );
});

test("local history and unread replies survive a storage round trip", () => {
  const ids = makeIds();
  const result = shareConversations([], share, ids, now);
  const next = appendMessage(
    result.conversations,
    result.opened[0],
    "Sample reply",
    "incoming",
    ids,
    now,
  );
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
  };
  assert.equal(saveConversations(storage, next), true);
  assert.deepEqual(readConversations(storage), next);
  assert.equal(unreadCount(readConversations(storage)), 1);
  assert.ok(values.has(CONVERSATION_KEY));
});

test("malformed storage and quota failures are handled without breaking the dashboard", () => {
  for (const text of [
    "{",
    "null",
    '{"version":2,"conversations":[]}',
    '{"version":1,"conversations":[{},null,{"id":"bad"}]}',
  ]) {
    assert.deepEqual(readConversations({ getItem: () => text }), []);
  }
  const denied = {
    getItem() {
      throw Error("Denied");
    },
    setItem() {
      throw Error("Full");
    },
  };
  assert.deepEqual(readConversations(denied), []);
  assert.equal(saveConversations(denied, []), false);
});
