import {
  IFetchRequest,
  FetchResponse,
} from "../../interfaces/MessageInterfaces";
import { API_URL } from "../../vars/backend";
import Browser from "webextension-polyfill";

class AddonInjector {
  private static instance: AddonInjector;
  private injectedTabs: number[];
  private constructor() {
    this.injectedTabs = [];
    this.subscribeOnTabUpdate();
  }

  public static get Instance() {
    if (!this.instance) {
      this.instance = new this();
    }
    return this.instance;
  }

  public async insertCodeInTabContext(jsFiles: string[], cssFiles?: string[]) {
    let tabId = await Browser.tabs
      .query({ active: true })
      .then((tabs) => tabs[0].id);
    if (this.injectedTabs.includes(tabId!)) {
      console.log("Already injected in this tab");
      return;
    }
    try {
      await Browser.scripting.executeScript({
        files: jsFiles,
        target: {
          tabId: tabId!,
        },
        injectImmediately: false,
      });
      this.injectedTabs.push(tabId!);
    } catch (error) {
      console.log("Error in script injection: ", error);
    }
    if (cssFiles) {
      try {
        await Browser.scripting.insertCSS({
          files: cssFiles,
          target: {
            tabId: tabId!,
          },
        });
      } catch (error) {
        console.log("Error in css injection: ", error);
      }
    }
  }

  public async insertCssToTabContext(cssFiles: string[]) {
    let tabId = await Browser.tabs
      .query({ active: true })
      .then((tabs) => tabs[0].id);
    await Browser.scripting.insertCSS({
      files: cssFiles,
      target: {
        tabId: tabId!,
      },
    });
  }

  public async runFunctionInTabContext(func: any, ...args: any) {
    let tabId = await Browser.tabs
      .query({ active: true })
      .then((tabs) => tabs[0].id);
    await Browser.scripting.executeScript({
      func: func,
      target: {
        tabId: tabId!,
      },
      args: args,
    });
  }

  private async subscribeOnTabUpdate() {
    Browser.tabs?.onUpdated.addListener(
      (
        tabId: number,
        changheInfo: Browser.Tabs.OnUpdatedChangeInfoType,
        tab: Browser.Tabs.Tab
      ) => {
        const index = this.injectedTabs.indexOf(tabId, 0);
        if (index > -1) {
          this.injectedTabs.splice(index, 1);
        }
      }
    );
  }
}

class MessageHandler {
  private static instance: MessageHandler;
  private constructor() {}

  public static get Instance() {
    if (!this.instance) {
      this.instance = new this();
    }
    return this.instance;
  }

  private async addLMessageListener(Listener: any) {
    if (Browser.runtime.onMessage.hasListener(Listener)) {
      console.log("listener registered");
      return;
    } else {
      Browser.runtime.onMessage.addListener(Listener);
      console.log("register new listener");
    }
  }

  public async initMessageHandlers() {
    await this.addLMessageListener(this.FetcherListener);
  }

  private async LogMessage(
    message: IFetchRequest,
    sender: Browser.Runtime.MessageSender,
    sendResponse: any
  ): Promise<any> {
    console.log("message: \n" + message.url);
    let resp: FetchResponse = new FetchResponse(true);
    return resp;
  }

  private async FetcherListener(
    message: IFetchRequest,
    sender: Browser.Runtime.MessageSender,
    sendResponse: any
  ): Promise<any> {
    try {
      const req = await fetch(API_URL + message.url);
      let ret = await req.json();
      let resp = new FetchResponse(req.ok, ret);
      return resp;
    } catch (error) {
      console.log("error:", error);
      let resp: FetchResponse = new FetchResponse(false, null, error as any);
      return resp;
    }
  }
}

export const AddonInjectorService = AddonInjector.Instance;
export const MessageHandlerService = MessageHandler.Instance;
