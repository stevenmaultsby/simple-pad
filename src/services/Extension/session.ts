import { SessionData, SessionStoreState } from "interfaces/SessionInterface";
const CURRENT_SESSION_STORAGE_KEY = "pluginSessionData";

export const getSessionInitialState = (): SessionStoreState => {
  return {
    requestIsPending: false,
    id: undefined,
  };
};

const setCurrentSessionUser = (storageKey: string, session: SessionData) => {
  localStorage.setItem(storageKey, JSON.stringify(session));
};

export const getCurrentSession = () => {
  let sessionData: SessionData;
  if (localStorage.getItem(CURRENT_SESSION_STORAGE_KEY)) {
    sessionData = JSON.parse(
      localStorage.getItem(CURRENT_SESSION_STORAGE_KEY)!
    );
    console.log("user data loaded");
  } else {
    sessionData = InitNewSessionUser();
    console.log("New user logged in");
  }
  setCurrentSessionUser(CURRENT_SESSION_STORAGE_KEY, sessionData);
  return sessionData;
};

const InitNewSessionUser = (): SessionData => {
  const sessionData: SessionData = {
    id: undefined,
  };
  return sessionData;
};

export const resetCurrentSession = () => {
  localStorage.removeItem(CURRENT_SESSION_STORAGE_KEY);
  console.log("user data cleared");
  return getSessionInitialState();
};
