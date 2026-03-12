export interface IFetchOptions {
  method: "POST" | "GET" | "DELETE";
  body?: string;
  headers?: object;
}

export interface IFetchRequest {
  url: string;
  method: "POST" | "GET" | "DELETE";
  body?: Record<string, any>;
  headers?: object;
}

export class FetchResponse {
  public ok: boolean;
  public data?: any;
  public error?: object | null;
  public json() {
    return JSON.parse(this.data);
  }
  constructor(status: boolean, responseData?: any, error?: object | null) {
    this.ok = status;
    this.data = responseData;
    this.error = error;
  }
}

export interface RequestToExtension {
  type: "content_script_request";
  correlationId: string;
  data: IFetchRequest;
}

export interface ResponseFromExtension {
  type: "content_script_response";
  correlationId: string;
  result: any;
  success: boolean;
}

export interface IContentData {
  message: string;
  data: any;
}

export interface Listener {
  message: any;
  sender: browser.runtime.MessageSender;
  sendResponse: any;
}

export interface IContextConnector {
  sendRequest(fetchMessage: IFetchRequest): Promise<FetchResponse>;
}
