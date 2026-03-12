import { getDefaultRangeToSerialize } from "services/Helpers/range-serializer";
import { CommentInterface } from "interfaces/CommentInterface";
import { CommentType } from "interfaces/CommentInterface";

declare global {
  interface Window {
    __commented_hash: (v: string) => string;
  }
}

export function getDefaultComment(): CommentInterface {
  return {
    id: "",
    created: new Date(0).toISOString(),
    type: CommentType.Unknown,
    textRef: {
      id: "",
      topOffset: 0,
      range: { ...getDefaultRangeToSerialize() },
      value: "",
    },
  };
}

export const id = (val: string = "") => {
  return window.__commented_hash(
    Date.now() + "_" + Math.random() + "message" + val
  );
};

export const commentStateId = "___commented_panel_" + Date.now();
