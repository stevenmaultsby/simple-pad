import { useCallback, useEffect, useState } from "react";
import cn from "classnames";

import Button from "components/extension/ExtensionButton/Button";
import { rc } from "services/io";
import {
  resetCurrentSession,
  getCurrentSession,
} from "services/Extension/session";
import { SessionData } from "interfaces/SessionInterface";

// import { MessageHandlerService } from "services/extensionContextConnector";

import "./services/Helpers/globals";
import "./services/Helpers/sha";
import classes from "./styles/AppExtension.module.css";

function App() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  const reloadWebPage = useCallback(async () => {
    await browser.tabs.reload();
  }, []);

  const toggleState = useCallback(() => {
    setIsEnabled((prev) => {
      return !prev;
    });
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length > 0) {
        const activeTabId = tabs[0].id;
        console.log("Send message to tab:", activeTabId!, {
          message: {
            type: "content_script_extension_state",
            state: !isEnabled,
          },
        });
        chrome.tabs.sendMessage(
          activeTabId!,
          {
            message: {
              type: "content_script_extension_state",
              state: !isEnabled,
            },
          },
          function (response) {
            console.log("On/off response from page: ", response);
          }
        );
      }
    });
  }, [isEnabled]);

  const resetCurrentSessionUser = useCallback(async () => {
    const currentSessionData = resetCurrentSession();
    setSessionData(currentSessionData);
  }, []);

  useEffect(() => {
    if (!sessionData || !sessionData.id) {
      getCurrentSession();
    }
  }, [sessionData?.id, sessionData]);

  useEffect(() => {
    if (sessionData && sessionData.id) {
      rc.connect(sessionData.id);
    }
  }, [sessionData?.id, sessionData]);

  return (
    <>
      <p className={cn(classes.title)}>comment maker</p>
      <div className={cn(classes.buttonsContainer)}>
        <Button props={{ title: "reload page", handleClick: reloadWebPage }} />
        <Button
          props={{ title: "new user", handleClick: resetCurrentSessionUser }}
          style={{ background: "yellow" }}
        />
        <Button
          props={{ title: "on/off", handleClick: toggleState }}
          style={{ background: isEnabled ? "green" : "red" }}
        ></Button>
      </div>
    </>
  );
}

export const AppExtension = App;
