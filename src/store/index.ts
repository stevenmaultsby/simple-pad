import { useDispatch, useSelector } from "react-redux";

import { configureStore, createAction } from "@reduxjs/toolkit";
import { AnyAction, combineReducers } from "redux";

import comments, { getCommentsInitialState } from "./selection/reducer";
import session, { getSessionInitialState } from "./session/reducer";
import redactor, { getDefaultRedactorState } from "./redactor/reducer";

const reducer = combineReducers({
  session,
  comments,
  redactor,
});

export const restoreStore = createAction("store/restore");
export const clearStore = createAction("store/flush");
export const rootReducer = (state: any, action: AnyAction) => {
  switch (action.type) {
    case clearStore.type: {
      return reducer(
        {
          session: getSessionInitialState(),
          comments: getCommentsInitialState(),
          redactor: getDefaultRedactorState(),
        },
        action
      );
    }
    default: {
      return reducer(state, action);
    }
  }
};
export const store = configureStore({
  reducer: rootReducer,
  devTools: {
    trace: true,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([]),
});

export type AppState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector = <T>(
  selector: (s: AppState) => T,
  eq?: (a: T, b: T) => boolean
) => useSelector<AppState, T>(selector, eq);
