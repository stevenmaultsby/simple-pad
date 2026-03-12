import {
  CommentInterface,
  RangeToSerialize,
} from "interfaces/CommentInterface";
import { deserializeRange } from "./range-serializer";

export const reindexSiblingCommentsOfNewComment = (
  comment: CommentInterface,
  comments: CommentInterface[]
): CommentInterface[] | undefined => {
  const deserializedRange = deserializeRange(comment.textRef.range);
  if (deserializeRange !== null) {
    const parentNode = deserializedRange!.startContainer.parentNode;
    const commentNodeIndex = comment.textRef.range.start.childNodeIndex;
    const siblingComments: CommentInterface[] = comments.filter((c) => {
      let res: boolean =
        comment.id !== c.id &&
        deserializeRange(c.textRef.range)?.startContainer.parentNode ===
          parentNode;
      return res;
    });
    const commentsToUpdate: CommentInterface[] = [];
    siblingComments.forEach((sc) => {
      if (sc.textRef.range.start.childNodeIndex >= commentNodeIndex) {
        let newRange: RangeToSerialize = sc.textRef.range;
        let commentToUpdate: CommentInterface = { ...sc };
        let newStartOffset;
        let newEndOffset;
        if (sc.textRef.range.start.childNodeIndex === commentNodeIndex) {
          newStartOffset =
            sc.textRef.range.start.offset - comment.textRef.range.end.offset;
          newEndOffset =
            sc.textRef.range.end.offset - comment.textRef.range.end.offset;
        } else if (sc.textRef.range.start.childNodeIndex > commentNodeIndex) {
          newStartOffset = sc.textRef.range.start.offset;
          newEndOffset = sc.textRef.range.end.offset;
        }
        newRange = {
          ...newRange,
          start: {
            ...newRange.start,
            offset: newStartOffset,
            childNodeIndex: sc.textRef.range.start.childNodeIndex + 2,
          },
          end: {
            ...newRange.end,
            offset: newEndOffset,
            childNodeIndex: sc.textRef.range.end.childNodeIndex + 2,
          },
        };
        commentsToUpdate.push({
          ...commentToUpdate,
          textRef: {
            ...commentToUpdate.textRef,
            range: newRange,
          },
        });
      }
    });
    return commentsToUpdate;
  }
  return;
};

export const reindexSiblingCommentsOfDeletedComment = (
  comment: CommentInterface,
  comments: CommentInterface[]
): CommentInterface[] | undefined => {
  const deserializedRange = deserializeRange(comment.textRef.range);
  if (deserializeRange !== null) {
    const parentNode = deserializedRange?.startContainer.parentNode;
    const commentNodeIndex = comment.textRef.range.start.childNodeIndex;
    const siblingComments: CommentInterface[] = comments.filter((c) => {
      let res: boolean =
        comment.id !== c.id &&
        deserializeRange(c.textRef.range)?.startContainer.parentNode ===
          parentNode;
      return res;
    });
    const commentsToUpdate: CommentInterface[] = [];
    siblingComments.forEach((sc) => {
      if (sc.textRef.range.start.childNodeIndex > commentNodeIndex) {
        let newRange: RangeToSerialize = sc.textRef.range;
        let commentToUpdate: CommentInterface = { ...sc };
        let newStartOffset;
        let newEndOffset;
        if (sc.textRef.range.start.childNodeIndex === commentNodeIndex + 2) {
          newStartOffset =
            sc.textRef.range.start.offset + comment.textRef.range.end.offset;
          newEndOffset =
            sc.textRef.range.end.offset + comment.textRef.range.end.offset;
        } else if (
          sc.textRef.range.start.childNodeIndex >
          commentNodeIndex + 2
        ) {
          newStartOffset = sc.textRef.range.start.offset;
          newEndOffset = sc.textRef.range.end.offset;
        }
        newRange = {
          ...newRange,
          start: {
            ...newRange.start,
            offset: newStartOffset,
            childNodeIndex: sc.textRef.range.start.childNodeIndex - 2,
          },
          end: {
            ...newRange.end,
            offset: newEndOffset,
            childNodeIndex: sc.textRef.range.end.childNodeIndex - 2,
          },
        };
        commentsToUpdate.push({
          ...commentToUpdate,
          textRef: {
            ...commentToUpdate.textRef,
            range: newRange,
          },
        });
      }
    });
    return commentsToUpdate;
  }
  return;
};
