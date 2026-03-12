import { TextNode, ElementNode } from "lexical";
// ClickHandlerPlugin.tsx
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  RangeSelection,
  LexicalNode,
} from "lexical";
import { useEffect } from "react";

export function ClickHandlerPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      //   if (!editor.isEditable (target)) return;

      editor.getEditorState().read(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          const text = selection.getTextContent();
          console.log("selected text:", text);
        }


        const node = getSelectedOrClickedNode(
          selection as RangeSelection,
          event
        );
        if (node) {
          const nodeText = getNodeText(node);
          console.log("the node text under the click:", nodeText);
        }
      });
    };


    return editor.registerRootListener((rootElement) => {
      if (rootElement) {
        rootElement.addEventListener("click", handleClick);
        return () => rootElement.removeEventListener("click", handleClick);
      }
    });
  }, [editor]);

  return null;
}


function getSelectedOrClickedNode(
  selection: RangeSelection | null,
  event: MouseEvent
): LexicalNode | null {
  if (selection && $isRangeSelection(selection) && !selection.isCollapsed()) {

    return selection.anchor.getNode();
  }


  const selectionObj = window.getSelection();
  if (selectionObj && selectionObj.anchorNode) {

    let node: Node | null = selectionObj.anchorNode;
    while (node) {
      if ((node as Element).getAttribute?.("data-lexical-node") !== undefined) {

        break;
      }
      node = node.parentNode;
    }

    return selection?.anchor?.getNode() || null;
  }

  return null;
}


function getNodeText(node: LexicalNode): string {
  if ($isTextNode(node)) {
    return node.getTextContent();
  }


  if ($isElementNode(node)) {
    let text = "";
    node.getChildren().forEach((child) => {
      text += getNodeText(child);
    });
    return text;
  }

  return "";
}




function $isTextNode(node: LexicalNode): node is TextNode {
  return node.getType() === "text";
}

function $isElementNode(node: LexicalNode): node is ElementNode {
  return ["paragraph", "heading", "list", "quote", "root"].includes(
    node.getType()
  );
}
