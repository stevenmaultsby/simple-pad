import {
  addCommentAction,
  fetchCommentAction,
  fetchCommentsAction,
} from "./thunks";

import { createSlice } from "@reduxjs/toolkit";
import {
  CommentIndex,
  CommentInterface,
} from "../../interfaces/CommentInterface";
import { fetchRedactorPageData } from "store/redactor/thunks";

export const getCommentsInitialState = () => {
  const ret = {
    comments: {} as Record<string, CommentInterface>,
    index: {} as Record<string, CommentIndex>,
  };
  return ret;
};

const comments = createSlice({
  name: "comments",
  initialState: getCommentsInitialState(),
  reducers: {
    setCommentAction(state, { payload }: { payload: CommentInterface }) {
      return {
        ...state,
        comments: {
          ...state.comments,
          [payload.id]: {
            ...payload,
            saved: false,
          },
        },
      };
    },
    removeCommentAction(
      state,
      { payload }: { payload: Pick<CommentInterface, "id"> }
    ) {
      delete state.comments[payload.id];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      addCommentAction.pending,
      (state, { meta: { arg: comment } }) => {
        return {
          ...state,
          comments: {
            ...state.comments,
            [comment.id]: {
              ...comment,
              saved: false,
            },
          },
        };
      }
    );
    builder.addCase(
      addCommentAction.fulfilled,
      (state, { payload: comment }) => {
        return {
          ...state,
          comments: {
            ...state.comments,
            [comment.id]: {
              ...comment,
              saved: true,
            },
          },
        };
      }
    );
    builder.addCase(fetchCommentsAction.fulfilled, (state, { payload }) => {
      const { comments } = payload;
      return {
        ...state,
        comments: {
          ...state.comments,
          ...Object.values(comments).reduce(
            (ret, comment) => ({
              ...ret,
              [comment.id]: {
                ...comment,
                saved: true,
              },
            }),
            {}
          ),
        },
      };
    });
    builder.addCase(fetchCommentAction.fulfilled, (state, { payload }) => {
      const { comment } = payload;
      return {
        ...state,
        comments: {
          ...state.comments,
          [comment.id]: {
            ...comment,
            saved: true,
          },
        },
      };
    });
    builder.addCase(fetchRedactorPageData.fulfilled, (state, { payload }) => {
      const { selections } = payload;
      return {
        ...state,
        comments: {
          ...state.comments,
          ...Object.values(selections).reduce(
            (ret, comment) => ({
              ...ret,
              [comment.id]: {
                ...comment,
                saved: true,
              },
            }),
            {}
          ),
        },
      };
    });
  },
});

export default comments.reducer;
export const { setCommentAction } = comments.actions;
