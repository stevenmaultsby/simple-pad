import {
  IFetchRequest,
  FetchResponse,
  IContextConnector,
  RequestToExtension,
  ResponseFromExtension,
} from "../../interfaces/MessageInterfaces";

class PageToContentFetcher implements IContextConnector {
  private static _instance: PageToContentFetcher;
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (reason?: any) => void;
      timeout: number;
    }
  >();
  constructor() {
    this.subscribeOnResponseMessage();
  }

  public static get Instance() {
    if (!this._instance) {
      this._instance = new this();
      // console.log("init context connector");
    }
    return this._instance;
  }

  private subscribeOnResponseMessage() {
    window.addEventListener("message", (event) => {
      if (event.source !== window) return;
      if (!event.data || event.data.type !== "content_script_response") return;

      const response: ResponseFromExtension = event.data;
      const pending = this.pendingRequests.get(response.correlationId);
      if (pending) {
        this.pendingRequests.delete(response.correlationId);
        clearTimeout(pending.timeout);
        if (response.success) {
          const result = {
            ok: true,
            data: response.result,
          };
          pending.resolve(result);
        } else {
          pending.reject(new Error(`Extension error: ${response.result}`));
        }
      }
    });
  }

  public async sendRequest(request: IFetchRequest): Promise<FetchResponse> {
    return new Promise((resolve, reject) => {
      const correlationId = this.generateId();
      const timeoutId = window.setTimeout(() => {
        this.pendingRequests.delete(correlationId);
        reject(new Error(`Timeout for request: ${correlationId}`));
      }, 10_000);

      this.pendingRequests.set(correlationId, {
        resolve,
        reject,
        timeout: timeoutId,
      });

      const message: RequestToExtension = {
        type: "content_script_request",
        correlationId: correlationId,
        data: request,
      };

      //   content script'
      window.postMessage(message, "*"); // .   
    });
  }

  private generateId(): string {
    return (
      "__commented_req_" +
      Date.now() +
      "_" +
      Math.floor(Math.random() * 1000000)
    );
  }
  // public async fetch(fetchMessage: IFetchRequest): Promise<FetchResponse> {
  //   try {
  //     const reqId = uuidv4();
  //     const consoleMessage = {
  //       type: "content_script_request",
  //       payload: fetchMessage,
  //       id: reqId,
  //     };
  //     let req = window.postMessage(consoleMessage);
  //     let ret = await req;
  //     let resp = new FetchResponse(true, ret); // mock
  //     return resp;
  //   } catch (error) {
  //     console.log("error:", error);
  //     let resp: FetchResponse = new FetchResponse(false, null, error as any);
  //     return resp;
  //   }
  // }
}

let cc;
export default cc = PageToContentFetcher.Instance;
