import { EditorQuote } from "./EditorQuote/EditorQuote";
import { CustomLink } from "./Link/Link";
import CustomListItem from "./ListItem/ListItem";
import OnChange from "./OnChange/OnChange";
import {
  $getRoot,
  $getState,
  $setState,
  createState,
  ElementNode,
  LexicalNode,
} from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $isElementNode } from "lexical";
import { id as generateId } from "../../../../services/Helpers/comment";

export function $getAllNodes(root: ElementNode): Array<LexicalNode> {
  const nodes = [];
  let child: LexicalNode | null = root.getFirstChild();
  while (child !== null) {
    // @ts-ignore
    nodes.push(child);
    if ($isElementNode(child)) {
      const subChildrenNodes = $getAllNodes(child);
      // @ts-ignore
      nodes.push(...subChildrenNodes);
    }
    child = child.getNextSibling();
  }
  return nodes;
}

const idState = createState("id", {
  parse: (v) => (typeof v === "string" ? v : ""),
});
const createdState = createState("created", {
  parse: (v) => (typeof v === "string" ? v : ""),
});

function IdPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      editor.update(() => {
        const root = $getRoot();
        [root, ...$getAllNodes(root)].forEach((node) => {
          const id = $getState(node, idState);
          if (!id) {
            $setState(node, idState, generateId());
            $setState(node, createdState, new Date().toISOString());
          }
        });
      });
    });
  }, [editor]);

  return null;
}

export const nodes = [
  ...EditorQuote.nodes,
  ...CustomLink.nodes,
  ...CustomListItem.nodes,
];
export const plugins = [
  ...EditorQuote.plugins,
  ...CustomLink.plugins,
  ...CustomListItem.plugins,
  ...OnChange.plugins,
  IdPlugin,
];
