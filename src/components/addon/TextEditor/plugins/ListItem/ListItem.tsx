import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  KEY_ENTER_COMMAND,
} from "lexical";

import { $isListNode } from "@lexical/list";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

function ListExitPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (ev) => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return false;
        }

        const anchorNode = selection.anchor.getNode();
        const listNode = anchorNode.getParent();

        // ,    
        if (!$isListNode(listNode)) {
          return false;
        }

        const listItemText = anchorNode.getTextContent();
        if (listItemText.trim() !== "") {
          return false;
        }

        //   ,   
        editor.update(() => {
          const paragraph = $createParagraphNode();
          listNode.insertAfter(paragraph);
          anchorNode.remove();
          paragraph.select();
        });
        ev?.preventDefault();
        return true;
      },
      COMMAND_PRIORITY_HIGH
    );
  }, [editor]);

  return null;
}

export const CustomListItem = {
  name: "CustomListExit",
  nodes: [
    // ListItemNode,
    // {
    //   replace: LexicalListItemNode,
    //   with: (node: LexicalListItemNode) =>
    //     $createListItemNode(node.getValue(), node.getChecked()),
    //   withKlass: ListItemNode,
    // },
  ],
  plugins: [ListExitPlugin],
};

export default CustomListItem;
