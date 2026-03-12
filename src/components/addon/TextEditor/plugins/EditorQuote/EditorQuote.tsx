import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useSelection } from "components/addon/SelectionContextProvider/SelectionContext";
import { SelectionContextEvents } from "interfaces/SelectionContextInterfaces";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_HIGH,
  EditorConfig,
  ParagraphNode as LexicalParagraphNode,
  SerializedParagraphNode as LexicalSerializedParagraphNode,
} from "lexical";
import { nanoid } from "nanoid";
import { useCallback, useEffect } from "react";

export const name = `ParagraphPlugin`;

export type SerializedParagraphNode = LexicalSerializedParagraphNode & {
  selectionId: string;
  selectionText: string;
};

export class EditorQuoteNode extends LexicalParagraphNode {
  __selectionId: string;
  __selectionText: string;
  static getType() {
    return `editor-quote`;
  }
  static clone(node: EditorQuoteNode) {
    const newNode = new EditorQuoteNode(
      node.__selectionId,
      node.__selectionText,
      node.__key
    );
    return newNode;
  }
  constructor(id: string, text: string, key?: string) {
    super(key);
    this.__selectionId = id;
    this.__selectionText = text;
  }
  createDOM(config: EditorConfig): HTMLElement {
    const el = document.createElement("div");
    el.setAttribute("____editor-quote", this.__selectionId);
    el.style.padding = "7px 15px";
    el.style.margin = "10px 0";
    el.style.background = "rgba(255,255,255,.5)";
    el.style.borderLeft = "2px solid gray";
    el.textContent = this.__selectionText;
    el.style.cursor = "pointer";
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
    });

    return el;
  }
  static importJSON(serializedNode: SerializedParagraphNode): EditorQuoteNode {
    const node = new EditorQuoteNode(
      serializedNode.selectionId,
      serializedNode.selectionText
    );
    return node;
  }
  exportJSON(): SerializedParagraphNode {
    const latest = this.getLatest();
    return {
      ...super.exportJSON(),
      selectionId: latest.__selectionId,
      selectionText: latest.__selectionText,
    };
  }
}

const $createEditorQuoteNode = (id: string, text: string) => {
  return new EditorQuoteNode(id, text);
};

const EditorQuotePlugin = () => {
  const selection = useSelection();
  const [editor] = useLexicalComposerContext();
  const onComment = useCallback(
    (cmnt) => {
      editor.read(() => {
        const selection = $getSelection();
        let node = selection?.getNodes()[0];
        const root = $getRoot();
        if (!node) {
          node = root.getLastChild() || undefined;
        } else {
          while (node && node?.getParent() !== root) {
            node = node.getParent() || undefined;
          }
        }
        editor.update(() => {
          const linkNode = $createEditorQuoteNode(cmnt.id, cmnt.textRef.value);
          if (!node) {
            root.append(linkNode);
          } else {
            node.insertAfter(linkNode);
          }
          const newP = $createParagraphNode();
          linkNode.insertAfter(newP);
          newP.selectEnd();
        });
      });
    },
    [editor]
  );
  useEffect(() => {
    selection.selectionEventEmitter.on(
      SelectionContextEvents.TEXT_SELECTED,
      onComment
    );
    return () => {
      selection.selectionEventEmitter.off(
        SelectionContextEvents.TEXT_SELECTED,
        onComment
      );
    };
  }, [selection, onComment]);

  useEffect(() => {
    return editor.registerCommand(
      CLICK_COMMAND,
      (event) => {
        if (
          !(event instanceof PointerEvent) &&
          !(event instanceof MouseEvent)
        ) {
          return false;
        }
        const el = event.srcElement as HTMLElement;
        const editorAttr = el.getAttribute("____editor-quote");
        if (editorAttr) {
          selection.focusItem(editorAttr);
        }
        event.preventDefault();
        return true;
      },
      COMMAND_PRIORITY_HIGH
    );
  }, [editor, selection]);

  return null;
};

export const EditorQuote = {
  name,
  nodes: [EditorQuoteNode],
  plugins: [EditorQuotePlugin],
};

export default EditorQuote;
