import { createSlice } from "@reduxjs/toolkit";
import { fetchSession } from "./thunks";

export interface SessionData {
  id?: string;
}

export interface SessionStoreState extends SessionData {
  requestIsPending: boolean;
  error?: string;
}

export const getSessionInitialState = (): SessionStoreState => {
  return {
    requestIsPending: false,
    error: undefined,
    id: "",
  };
};

const comments = createSlice({
  name: "session",
  initialState: getSessionInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSession.pending, (state) => {
      state.requestIsPending = true;
    });
    builder.addCase(fetchSession.rejected, (state, { error }) => {
      return {
        ...state,
        error: error.message,
        requestIsPending: false,
      };
    });
    builder.addCase(fetchSession.fulfilled, (state, { payload }) => {
      return {
        ...state,
        ...payload,
        requestIsPending: false,
      };
    });
  },
});

export default comments.reducer;
