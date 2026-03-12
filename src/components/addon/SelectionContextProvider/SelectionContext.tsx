import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { CommentInterface, CommentType } from "interfaces/CommentInterface";
import {
  deserializeRange,
  getSafeRanges,
  serializeRange,
} from "services/Helpers/range-serializer";
import { commentStateId, getDefaultComment } from "services/Helpers/comment";
import { id as commentedId } from "services/Helpers/comment";
import { AppState, useAppDispatch } from "./../../../store/index";
import { addCommentAction } from "store/selection/thunks";
import {
  SelectionContextType,
  SelectionData,
  TextSelectedEvent,
  EmptySelectionEvent,
} from "../../../interfaces/SelectionContextInterfaces";
import classes from "./SelectionContext.module.css";
import SelectionContextEventEmitter, {
  useSelectionContextEventEmitter,
} from "./SelectionContextEventEmmiter";
import QuoteButtonPanel from "./QuoteButtonPanel";

const SelectionContext = createContext<SelectionContextType>({
  lastSelection: null,
  focusItem: (id: string) => null,
  selectionEventEmitter: new SelectionContextEventEmitter(),
});

export const useSelection = () => useContext(SelectionContext);

export const SelectionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [lastSelection, setLastSelection] = useState<SelectionData | null>(
    null
  );
  const comments: Record<string, CommentInterface> = useSelector(
    (s: AppState) => s.comments.comments
  );
  const session = useSelector((s: AppState) => s.session);
  const { pathname } = useLocation();

  const dispatch = useAppDispatch();
  const [currentHighlight, setCurrentHighlight] = useState(
    document.createElement("null")
  );
  const [currentCommentTemplate, setCurrentCommentTemplate] =
    useState<CommentInterface>();
  const [nodeText, setNodeText] = useState<string>("nnn");
  const selectionEventEmitter = useSelectionContextEventEmitter();

  const createCommentTemplate = useCallback(
    (selection: Selection) => {
      const selectionRange = selection.getRangeAt(0);
      const defaultComment = getDefaultComment();
      const commentTemplate: CommentInterface = {
        ...defaultComment,
        id: commentedId(),
        type: CommentType.Comment,
        created: new Date().toISOString(),
        textRef: {
          id: "" + Date.now(),
          topOffset:
            selectionRange.getBoundingClientRect().top + window.scrollY,
          range: serializeRange(selectionRange),
          value: selection.toString().trim(),
        },
      };
      dispatch(addCommentAction(commentTemplate));
      return commentTemplate;
    },
    [session, pathname]
  );

  const ScrollDocumentToPosition = useCallback((xpos: number, ypos: number) => {
    window.scrollTo(xpos, ypos);
  }, []);

  const HighlightRange = useCallback((range: Range, textRefId: string) => {
    const textId = textRefId;
    const parentNode = range.startContainer.parentNode as HTMLElement;
    setNodeText(parentNode.innerHTML);
    const selectedText = parentNode.innerText.substring(
      range.startOffset - 1,
      range.endOffset - 1
    );
    const textNode: HTMLElement = document.createElement("span");
    textNode.id = textId;
    textNode.className = classes.highlighted;
    textNode.textContent = selectedText;
    range.insertNode(textNode);
    range.surroundContents(textNode);
    setCurrentHighlight(textNode);
  }, []);

  const ClearCurrentHighlight = useCallback(() => {
    if (currentHighlight.outerHTML !== "<null></null>") {
      const parentNode: HTMLElement =
        currentHighlight.parentNode as HTMLElement;
      currentHighlight.remove();
      parentNode.innerHTML = nodeText;
      setCurrentHighlight(document.createElement("null"));
    }
  }, [nodeText, currentHighlight]);

  const focusItem = useCallback(
    (id: string) => {
      const comment: CommentInterface | undefined = comments[id];

      ClearCurrentHighlight();
      if (comment && comment.id !== "") {
        const textRef = comment.textRef;
        const range = deserializeRange(textRef.range);
        if (!range) {
          console.log(
            "warning! comment has empty range! Comment ID: " + comment.id
          );
          return null;
        }
        const safeRanges: Range[] = getSafeRanges(range);

        for (let j = 0; j < safeRanges.length; j++) {
          HighlightRange(safeRanges[j], textRef.id);
        }
        const xpos = comment.textRef.leftOffset || 0;
        const ypos = comment.textRef.topOffset - 100;
        ScrollDocumentToPosition(xpos, ypos);
      }
      return null;
    },
    [comments, ClearCurrentHighlight, HighlightRange, ScrollDocumentToPosition]
  );

  const initCommentCreation = useCallback(
    (p: CommentInterface) => {
      const selectionEvent = new TextSelectedEvent(currentCommentTemplate);
      selectionEventEmitter.emit(selectionEvent.event, selectionEvent.payload);
    },
    [currentCommentTemplate, selectionEventEmitter]
  );

  const emitEmptySelectionEvent = useCallback(() => {
    const emptySelectionEvent = new EmptySelectionEvent(null);
    selectionEventEmitter.emit(
      emptySelectionEvent.event,
      emptySelectionEvent.payload
    );
  }, [selectionEventEmitter]);

  useEffect(() => {
    function onMouseUp() {
      const selection = window.getSelection();
      let el = selection?.focusNode?.parentElement;
      while (el) {
        if (el?.id === commentStateId) {
          return;
        }
        el = el.parentElement;
      }
      if (!selection || selection.toString() === "") {
        ClearCurrentHighlight();
        emitEmptySelectionEvent();
      } else {
        const commentTemplate = createCommentTemplate(selection);
        setCurrentCommentTemplate(commentTemplate);
      }
    }

    document.addEventListener("pointerup", onMouseUp);
    return () => {
      document.removeEventListener("pointerup", onMouseUp);
    };
  }, [ClearCurrentHighlight, createCommentTemplate]);

  return (
    <>
      <SelectionContext.Provider
        value={{
          lastSelection,
          focusItem,
          selectionEventEmitter,
        }}
      >
        {children}
        <QuoteButtonPanel
          commentCreationAction={initCommentCreation}
        ></QuoteButtonPanel>
      </SelectionContext.Provider>
    </>
  );
};
