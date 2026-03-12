import { createSlice } from "@reduxjs/toolkit";
import { fetchRedactorPageData, savePageData } from "./thunks";
import { currentPage } from "store/common";

export const getDefaultRedactorState = () => ({
  loaded: false,
  pendingRequests: [] as string[],
  page: currentPage(),
  root: "",
  items: {} as Record<string, any>,
});

const comments = createSlice({
  name: "redactor",
  initialState: getDefaultRedactorState(),
  reducers: {
    setPage(state, { payload: page }: { payload: string }) {
      return {
        loaded: false,
        page,
        root: "",
        items: {},
        pendingRequests: [],
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchRedactorPageData.pending, (state, { meta }) => {
      state.pendingRequests = [...state.pendingRequests, meta.requestId];
    });
    builder.addCase(fetchRedactorPageData.rejected, (state, { meta }) => {
      state.loaded = true;
      state.pendingRequests = state.pendingRequests.filter(
        (req) => req !== meta.requestId
      );
    });
    builder.addCase(
      fetchRedactorPageData.fulfilled,
      (state, { meta, payload }) => {
        state.loaded = true;
        state.pendingRequests = state.pendingRequests.filter(
          (req) => req !== meta.requestId
        );
        const { items, root } = payload;
        state.root = root;
        state.items = Object.keys(items).reduce((ret, item) => {
          return {
            ...ret,
            [item]: {
              ...state[item],
              ...items[item],
              saved: true
            }
          }
        }, {});
      }
    );
    builder.addCase(savePageData.pending, (state, { meta }) => {
      state.pendingRequests = state.pendingRequests.filter(
        (req) => req !== meta.requestId
      );
      const { arg: { items } } = meta;
      state.items = {
        ...state.items,
        ...Object.keys(items).reduce((ret, item) => {
          return {
            ...ret,
            [item]: {
              ...state[item],
              ...items[item],
              saved: false
            }
          }
        }, {}),
      };
    });
    builder.addCase(savePageData.rejected, (state, { meta }) => {
      state.pendingRequests = state.pendingRequests.filter(
        (req) => req !== meta.requestId
      );
      const { arg: { items } } = meta;
      state.items = {
        ...state.items,
        ...Object.keys(items).reduce((ret, item) => {
          return {
            ...ret,
            [item]: {
              ...state[item],
              ...items[item],
              saved: false,
              error: true,
            }
          }
        }, {}),
      };
    })
    builder.addCase(savePageData.fulfilled, (state, { meta, payload }) => {
      state.pendingRequests = state.pendingRequests.filter(
        (req) => req !== meta.requestId
      );
      const { items } = payload;
      state.items = {
        ...state.items,
        ...Object.keys(payload.items).reduce((ret, item) => {
          return {
            ...ret,
            [item]: {
              ...state[item],
              ...items[item],
              saved: true
            }
          }
        }, {}),
      };
    })
  },
});

export default comments.reducer;
export const { setPage: setRedactorPage } = comments.actions;
