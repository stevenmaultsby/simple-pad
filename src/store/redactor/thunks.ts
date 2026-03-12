import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import cc from "services/Addon/addonContextConnector";
import { REDACTOR_DATA } from "../common/api";
import { currentPage } from "store/common";

export const savePageData = createAsyncThunk<
  {
    items: Record<string, any>;
    selections: Record<string, any>;
  },
  {
    root: string;
    items: Record<string, any>;
  },
  {
    rejectValue: Error;
  }
>(`redactor/saveRedactorItems`, async ({ items, root }, thunkApi) => {
  const getPage = () =>
    (thunkApi.getState() as any).comments?.page ?? currentPage();
  const page = getPage();
  const result = await cc.sendRequest({
    method: "POST",
    url: REDACTOR_DATA(page),
    body: {
      page,
      root,
      items,
    },
  });
  const { data } = result.data ?? {};
  if (result.ok && data) {
    const { page: respondedPage, items, selections, root } = data;
    if (respondedPage !== getPage()) {
      return thunkApi.rejectWithValue(
        new Error("Response is not related to current page")
      );
    }
    return {
      page,
      root: root,
      items: items ?? {},
      selections: selections ?? {},
    };
  } else {
    return thunkApi.rejectWithValue(new Error(result.error?.toString()));
  }
});

export const fetchRedactorPageData = createAsyncThunk<
  {
    page: string;
    root: string;
    items: Record<string, any>;
    selections: Record<string, any>;
  },
  void,
  {
    rejectValue: Error;
  }
>(`redactor/fetchPage`, async (_, thunkApi) => {
  const getPage = () =>
    (thunkApi.getState() as any).comments?.page ?? currentPage();
  const page = getPage();
  const result = await cc.sendRequest({
    method: "GET",
    url: REDACTOR_DATA(page),
  });
  const { data } = result.data ?? {};
  if (result.ok && data) {
    const { items, selections, root, page: respondedPage } = data;
    if (respondedPage !== getPage()) {
      return thunkApi.rejectWithValue(
        new Error("Response is not related to current page")
      );
    }
    return {
      page: respondedPage,
      root: root,
      items: items ?? {},
      selections: selections ?? {},
    };
  } else {
    return thunkApi.rejectWithValue(new Error(result.error?.toString()));
  }
});
