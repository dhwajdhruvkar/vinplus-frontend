# Floating conversations

This is a **frontend preview**. Outlook, Teams, WhatsApp and In-app do not contact external services. No message is sent to a person. The existing dashboard filters, chart actions, exports and embeds remain available.

## Try the complete flow

1. Open a chart's **More → Share** menu. Choose a platform and sample recipient, add an optional comment, then choose **Share**.
2. A conversation opens above the bottom-right launcher. It includes the comment and a link to the shared chart with its selected filters, chart type and sort order.
3. Write in the composer. Enter or the arrow button saves a local message draft; Shift+Enter adds a line. Text remains when minimizing or changing threads during this session.
4. Choose **Preview incoming reply**, then minimize within three seconds. A labeled sample reply arrives and the red unread badge appears. There is no automatic impersonation of a real recipient.
5. Reopen the widget. Viewing the latest messages in the focused tab clears that thread's unread badge. Other threads and channels retain theirs. If reading older messages, choose **Latest messages** or scroll down to read the new reply.

The circular launcher and the header minimize button both close the window. Escape works when focus is inside the widget. Arrow keys move between channel tabs. The window is non-modal, so the dashboard stays usable. Existing dialogs appear above it.

## Motion

The window originates at the actual launcher location. Opening takes 460 ms and slightly overshoots before settling. Closing takes 340 ms and narrows into the launcher, giving a macOS-inspired minimize effect. Rapid toggles continue from the current rendered position. This is a web animation inspired by that motion, not Apple's native window renderer. Reduced-motion preferences skip the window animation and launcher effects entirely.

## Local state

`ConversationProvider` connects Share to the widget. Each chart, channel and recipient combination has its own thread; selecting several people does not combine them into a group. Selecting a named group or Teams channel uses that selection as a single recipient. Sharing the same chart again appends the comment and updates its pinned selection.

History and read status are stored under `vinplus-conversations-v1`. This preview retains up to 100 conversations and 200 messages per conversation. The original `vinplus-share-{chartId}` draft is still saved. Unsubmitted composer text lasts for the current page session. Storage failures show an error; replies remain available in memory. Local storage is not an authenticated inbox and must not be used for production message history.

| File                                        | Purpose                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------- |
| `src/conversations/ConversationContext.jsx` | Shared state, persistence, Share handoff, explicit sample reply timer.          |
| `src/conversations/conversationStore.js`    | Thread creation, message updates, unread counts and storage validation.         |
| `src/conversations/ConversationWidget.jsx`  | Launcher, tabs, recipients, pinned chart, history and composer.                 |
| `src/conversations/useLauncherMotion.js`    | Measured expand/minimize animation, interrupted transitions and reduced motion. |
| `src/conversations/conversations.css`       | Isolated widget appearance and responsive layout.                               |

## Connecting a backend later

Keep the UI and replace the local operations in `ConversationProvider` with your backend's authenticated API. Agree the actual endpoints with the backend team first; this frontend invents no production API contract.

- Replace sample names with authorized recipient IDs returned by a real directory.
- **Share:** send chart ID, selected filter state, recipient IDs, channel and comment. The backend checks chart access and creates or reuses the external conversation. Use an idempotency key to prevent duplicate sends on retry.
- **Messages:** fetch the authorized thread history; return message IDs, sender, timestamp and actual delivery state. Render sending, failed and delivered states only from real results. Preserve drafts when a request fails.
- **Replies:** backend webhooks receive provider events. Use authenticated SSE or WebSocket delivery to this frontend; deduplicate by provider message ID and resynchronize after reconnect. Do not broadcast private threads to other users.
- **Unread:** track a last-read message per user on the server. Mark read only when the latest messages are visible; keep updates monotonic to handle concurrent replies.
- **Shared charts:** use an access-controlled deployed URL. The current local embed URL preserves a display state but grants no permissions and cannot make a localhost dashboard accessible to someone else.
- Keep Microsoft/Meta tokens on the backend. Never put credentials in Vite environment variables or browser storage. Remove the sample-reply control when a live provider is enabled.

Outlook email threads, Teams chats/channels, and WhatsApp Business conversations require their respective integrations and are separate conversations. A reply stays within its source channel. In-app messaging also needs user identity, persistent storage and a realtime backend before another person can participate.
