const API_URL = process.env.REACT_APP_SERVER;

function AddLMessageListener(event, Listener) {
  if (browser.runtime.onMessage.hasListener(Listener)) {
    console.log("listener registered");
    return;
  } else {
    console.log("register new listener");
    browser.runtime.onMessage.addListener(Listener);
  }
}

function LogMessage(message, sender, sendResponse) {
  console.log(message);
  let resp = {};
  resp.ok = true;
  resp.payload = message.payload;
  sendResponse(resp);
  return true;
}

async function RequestListener(request, sender, sendResponse) {
  if (request.type == "content_script_request") {
    try {
      const result = await handleRequest(request.data);
      const response = { success: true, result: result };
      return response;
    } catch (e) {
      console.log({ request, e });
      console.error(e);
    }
  }
}
async function handleRequest(request) {
  const url = new URL(request.url, API_URL);
  console.log("!!!!!!", url, url.href);
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
  const response = await fetch(url.href, reqInit);
  const result = await response.json();
  return result;
}

AddLMessageListener("", RequestListener);

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === browser.tabs.TabStatus.LOADING) {
    browser.scripting.executeScript({
      target: { tabId: tabId },
      files: ["content.js"],
    });
  }
});
