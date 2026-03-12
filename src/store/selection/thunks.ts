import { createAsyncThunk } from "@reduxjs/toolkit";
import { CommentIndex, CommentInterface } from "interfaces/CommentInterface";
import { IFetchRequest } from "interfaces/MessageInterfaces";
import cc from "../../services/Addon/addonContextConnector";
import { createSearchParams } from "react-router-dom";
import { SessionData } from "../session/reducer";
import { currentPage } from "store/common";
import { SELECTION_DATA, SELECTION_DATA_BY_ID } from "./api";

export const fetchCommentsIndex = createAsyncThunk<
  CommentIndex[],
  void,
  {
    rejectValue: Error;
  }
>(`session/fetchIndexThunk`, async (_, thunkApi) => {
  let fetchRequest: IFetchRequest = {
    url: "/plugin/api/comments/index",
    method: "GET",
  };
  const req = await cc.sendRequest(fetchRequest);
  if (req.ok) {
    const ret = req.data;
    return ret.data.index;
  } else {
    return thunkApi.rejectWithValue(new Error(""));
  }
});

export const addCommentAction = createAsyncThunk<
  CommentInterface,
  CommentInterface,
  {
    rejectValue: Error;
  }
>(`session/addCommentThunk`, async (selection, thunkApi) => {
  const getPage = () =>
    (thunkApi.getState() as any).comments?.page ?? currentPage();
  const page = getPage();
  let fetchRequest: IFetchRequest = {
    url: SELECTION_DATA(page),
    method: "POST",
    body: {
      page: getPage(),
      selection,
    },
  };
  const req = await cc.sendRequest(fetchRequest);
  if (req.ok && req.data) {
    const { selection } = req.data.data;
    return selection;
  } else {
    return thunkApi.rejectWithValue(new Error(""));
  }
});

export const fetchCommentAction = createAsyncThunk<
  { comment: CommentInterface; page: string },
  string,
  {
    rejectValue: Error;
  }
>(`session/fetchCommentThunk`, async (id, thunkApi) => {
  let fetchRequest: IFetchRequest = {
    url: SELECTION_DATA_BY_ID(id),
    method: "GET",
  };
  const req = await cc.sendRequest(fetchRequest);
  if (req.ok) {
    const ret = req.data;
    console.log("fetched: ", ret);
    return ret.data;
  } else {
    return thunkApi.rejectWithValue(new Error(""));
  }
});

export const fetchCommentsAction = createAsyncThunk<
  { comments: Record<string, CommentInterface> },
  SessionData,
  {
    rejectValue: Error;
  }
>(`session/fetchCommentsThunk`, async (session: SessionData, thunkApi) => {
  let queryParams: URLSearchParams = createSearchParams({
    user: session.id ?? "n/a",
    page: document.location.pathname.toString(),
  });
  let fetchRequest: IFetchRequest = {
    url: "/plugin/api/comments/" + "?" + queryParams.toString(),
    method: "GET",
  };
  const req = await cc.sendRequest(fetchRequest);
  if (req.ok) {
    const ret = req.data;
    console.log("fetched: ", ret);
    return ret.data;
  } else {
    return thunkApi.rejectWithValue(new Error(""));
  }
});
