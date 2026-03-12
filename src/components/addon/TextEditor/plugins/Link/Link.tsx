import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  EditorConfig,
  LexicalEditor,
  PASTE_COMMAND,
  SerializedTextNode,
  TextNode,
} from "lexical";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect } from "react";
// import { SerializedTextNode, TextNode } from "../Text/TextPlugin";

const prefixed = (val: string) => val;

export type SerializedLinkNode = SerializedTextNode & {
  href: string;
};

export class LinkNode extends TextNode {
  __link: string;

  getLink(): string {
    const node = this.getLatest();
    return node.__link;
  }

  setLink(link: string): LinkNode {
    const node = this.getWritable();
    node.__link = link;
    return node;
  }

  static getType(): string {
    return prefixed("link");
  }

  static clone(node: LinkNode): LinkNode {
    const ret = new LinkNode(node.__link, node.__text, node.__key);
    return ret;
  }

  constructor(link: string = "", text: string = "", key?: string) {
    super(text, key);
    this.__link = link;
  }

  createDOM(config: EditorConfig, editor?: LexicalEditor): HTMLElement {
    const dom = document.createElement("a");
    const textContent = this.getTextContent();
    dom.style.color = "#038";
    dom.textContent = textContent;
    dom.title = this.__link;
    dom.addEventListener("click", () => {
      window.open(this.__link);
    });
    return dom;
  }
  exportJSON(): SerializedLinkNode {
    return {
      ...super.exportJSON(),
      href: this.__link,
    };
  }
}

const $createLinkNode = (link = "", text = "") => {
  return new LinkNode(link, text);
};

const CustomLinkPlugin = () => {
  const [editor] = useLexicalComposerContext();

  const handleTransform = useCallback(
    (node: TextNode) => {
      const text = node.getTextContent();
      const textContentMatch = text.match(/\[(.+)\]\((.+)\)/);
      if (textContentMatch && typeof textContentMatch.index === "number") {
        const start = textContentMatch.index;
        const end = textContentMatch.index + textContentMatch[0].length;
        const firstPart = text.substring(0, start);
        const lastPart = text.substring(end);
        const lastNode = $createTextNode(lastPart || " ");
        node.insertAfter(lastNode, true);
        node.insertAfter(
          $createLinkNode(textContentMatch[1], textContentMatch[2]),
          true
        );
        if (firstPart) {
          node.replace($createTextNode(firstPart));
        } else {
          node.remove();
        }
        lastNode.selectEnd();
      }
    },
    [editor]
  );

  useEffect(() => {
    const listener = editor.registerNodeTransform(TextNode, handleTransform);
    return () => listener();
  }, [editor]);

  return null;
};

const AutoLinkPastePlugin = (): null => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!(event instanceof ClipboardEvent)) {
          return false;
        }
        if (!$isRangeSelection(selection) || selection.isCollapsed()) {
          return false; //   
        }

        //     
        const clipboardText = event?.clipboardData?.getData("text/plain");

        if (!clipboardText) return false;

        // ,     URL
        try {
          new URL(clipboardText);
        } catch {
          return false; //  URL - 
        }

        //     
        editor.update(() => {
          const selectedText = selection.getTextContent();
          const linkNode = $createLinkNode(clipboardText, selectedText);
          selection.insertNodes([linkNode]);
        });
        event.preventDefault();
        return true; //  
      },
      COMMAND_PRIORITY_HIGH
    );
  }, [editor]);

  return null;
};

export const CustomLink = {
  name: "CustomLinkPlugin",
  nodes: [LinkNode],
  plugins: [CustomLinkPlugin, AutoLinkPastePlugin],
};

export default CustomLink;
