import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/lato/400.css";
import "@fontsource/lato/700.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import App from "./App.jsx";
import { ConversationProvider } from "./conversations/ConversationContext.jsx";
import "./styles.css";
import "./interactions.css";
import "./chartUtilities.css";
import "./dashboardDesign.css";
import "./conversations/conversations.css";

// Starts the React app and loads the shared fonts and dashboard styles above.
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConversationProvider>
      <App />
    </ConversationProvider>
  </React.StrictMode>,
);
