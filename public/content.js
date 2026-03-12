window.addEventListener(
  "message",
  (event) => {
    if (event.source !== window) return;
    if (!event.data || event.data.type !== "content_script_request") return;

    const request = event.data;
    chrome.runtime.sendMessage(request, (response) => {
      window.postMessage(
        {
          type: "content_script_response",
          correlationId: request.correlationId,
          ...response,
        },
        "*"
      );
    });
  },
  false
);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message.type == "content_script_extension_state") {
    console.log(request.message.state);
    return;
  }
  if (request.message === "Hello from popup!") {
    console.log("Message received in content script:", request.message);
    // Perform actions based on the message
    sendResponse({ status: "Message received successfully!" }); // Optional: Send a response back to the popup
  }
});

const injectScript = (path) => {
  fetch(chrome.runtime.getURL(path))
    .then((r) => r.text())
    .then((code) => {
      const script = document.createElement("script");
      script.textContent = code;
      document.head.appendChild(script);
      script.remove();
    });
};

const injectCssClasses = (path) => {
  const div = document.createElement("div");
  div.id = "__commented_plugin_" + Date.now();
  const shadowRoot = div.attachShadow({ mode: "open" });
  document.body.appendChild(div);
  const styleLink = document.createElement("link");
  styleLink.rel = "stylesheet";
  styleLink.type = "text/css";
  styleLink.href = chrome.runtime.getURL(path);
  const pluginRoot = document.createElement("div");
  pluginRoot.id = "root";
  shadowRoot.appendChild(styleLink);
  shadowRoot.appendChild(pluginRoot);
  window.Some = "some";
};

injectCssClasses("webpage_addon/css/main.css");
injectScript("webpage_addon/js/main.js");
