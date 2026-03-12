import { EditorState } from "lexical";

export enum CommentType {
  Unknown = "Unknown",
  Comment = "Comment",
  Emoji = "Emoji",
  Highlight = "Highlight",
  Note = "Note",
}
export interface NodeInfo {
  selector: string;
  childNodeIndex: number;
  offset: number;
}
export interface RangeToSerialize {
  start: NodeInfo;
  end: NodeInfo;
}

export interface CommentInterface {
  type: CommentType;
  id: string;
  created: string;
  textRef: {
    id: string;
    topOffset: number;
    leftOffset?: number;
    range: RangeToSerialize;
    value: string;
  };
}

export interface CommentIndex {
  id: string;
  ts: string;
  type: string;
  page: string;
}

export interface CommentsActionContextType {
  currentComment: CommentInterface;
  setCurrentComment: (c: CommentInterface) => void;
  commentIsCreating: boolean;
  setCommentIsCreating: (flag: boolean) => void;
  addComment: (
    e: React.MouseEvent,
    commet: CommentInterface,
    comments: CommentInterface[]
  ) => void;
  deleteComment: (
    e: React.MouseEvent,
    commet: CommentInterface,
    comments: CommentInterface[]
  ) => void;
  updateComment: (e: React.MouseEvent, commet: CommentInterface) => void;
  clearCommentForm: (e: React.MouseEvent, commet: CommentInterface) => void;
}
