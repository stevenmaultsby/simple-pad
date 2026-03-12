export interface SessionData {
  id?: string;
}

export interface SessionStoreState extends SessionData {
  requestIsPending: boolean;
}
