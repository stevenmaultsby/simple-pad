import { render } from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import { AppExtension } from "./AppExtension";
import { AppAddon } from "./AppAddon";
import { store } from "./store";
import TestPage from "TestPage";

let App;
if (process.env.REACT_APP_MODULE === "ADDON") {
  App = AppAddon;
} else if (process.env.REACT_APP_MODULE === "EXTENSION") {
  App = AppExtension;
}

const DEBUG = 0;

if (DEBUG) {
  window.addEventListener(
    "message",
    async (event) => {
      if (event.source !== window) return;
      if (!event.data || event.data.type !== "content_script_request") return;

      const message = event.data;
      if (message.type === "content_script_request") {
        const request = message.data;
        const reqURL = new URL(request.url, location.origin).href;
        const reqInit = {
          method: request.method,
          body: request.body ? JSON.stringify(request.body) : undefined,
          headers: {
            ...(request.headers || undefined),
            "Content-Type": request.body
              ? "application/json; charset=utf-8"
              : "text/plain; charset=utf-8",
          },
        };
        const response = await fetch(reqURL, reqInit);
        const result = await response.json();
        window.postMessage(
          {
            result,
            success: response.ok,
            correlationId: message.correlationId,
            type: "content_script_response",
          },
          "*"
        );
      }
    },
    false
  );

  const root = document.createElement("div");
  document.body.appendChild(root);
  render(
    <Provider store={store}>
      <TestPage />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>,
    root
  );
} else {
  setTimeout(async () => {
    const pluginRoot = document.querySelectorAll(
      "div[id^='__commented_plugin_']"
    )[0]?.shadowRoot;
    if (pluginRoot) {
      const shadowRoot = pluginRoot.querySelectorAll("#root")[0];
      render(
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>,
        shadowRoot
      );
    }
  }, 1000);
}
