import { createAsyncThunk } from "@reduxjs/toolkit";
import cc from "../../services/Addon/addonContextConnector";
import { SESSION_DATA } from "./api";

export const fetchSession = createAsyncThunk<
  {
    id: string;
  },
  void,
  {
    rejectValue: Error;
  }
>(`session/fetch`, async (_, thunkApi) => {
  const result = await cc.sendRequest({
    method: "GET",
    url: SESSION_DATA(),
  });
  const { data, status } = result.data;
  if (result.ok && status === 200) {
    return {
      id: data.id,
    };
  } else {
    return thunkApi.rejectWithValue(new Error(result.error?.toString()));
  }
});
