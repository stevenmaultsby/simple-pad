import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { SerializedLexicalNode } from "lexical";
import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch } from "store";
import { savePageData } from "store/redactor/thunks";
import { debounce } from "underscore";

type Node = SerializedLexicalNode & {
  $: { id: string; hash: string; version: string, created: string };
} & {
  children: Node[];
};
export type SerializedNode = Omit<SerializedLexicalNode, "children" | "$"> & {
  $: { [x: string]: unknown };
  children?: { ref: string }[];
};

const hash = window.__commented_hash;

const OnChangePlugin = () => {
  const [editor] = useLexicalComposerContext();
  const dispatch = useAppDispatch();
  const nodeHashes = useRef<Record<string, string>>({});
  const nodeValues = useRef<Record<string, SerializedNode>>({});

  const calcNodeHash = useCallback((node: SerializedNode) => {
    return hash(
      JSON.stringify({
        ...node,
        $: {
          hash: "",
        },
      })
    );
  }, []);

  const initHashStorage = useCallback(
    (state: Record<string, SerializedNode>) => {
      Object.keys(state).forEach((id) => {
        nodeHashes.current[id] = calcNodeHash(state[id]);
      });
    },
    []
  );

  const serializeChildren = useCallback(
    (root: Node, i: number = 0): Record<string, SerializedNode> => {
      const id = root.$?.id;
      if (!id) {
        return {};
      }
      const children = (root.children ?? []).filter((node) => node.$?.id);
      const { id: _id, ...state } = root.$ ?? {};
      // @ts-ignore
      const el: SerializedNode = {
        ...root,
        $: {
          ...state,
        },
      };
      if (children.length > 0) {
        el.children = children.map((node, i) => ({
          ref: `${node.$.id}_${i}`,
        }));
      }
      el.$.version = ""+Date.now();
      el.$.hash = calcNodeHash(el);
      return {
        [`${id}_${i}`]: el,
        ...children.reduce((ret, node, i) => {
          return {
            ...ret,
            ...serializeChildren(node, i),
          };
        }, {}),
      };
    },
    []
  );

  const saveState = useCallback(
    debounce(() => {
      const  s = nodeValues.current;
      const sKeys = Object.keys(s ?? {});
      const changedItems = sKeys.filter((key) => {
        return s[key].$.hash !== nodeHashes.current[key];
      });
      changedItems.forEach((key) => {
        nodeHashes.current[key] = s[key].$.hash as string;
      });
      const root = sKeys.find((id) => s[id].type === "root")!;
      if (changedItems.length > 0) {
        const substate = changedItems.reduce(
          (ret, key) => ({
            ...ret,
            [key]: s[key],
          }),
          {}
        );
        dispatch(savePageData({ root, items: substate }));
      }
    }, 500),
    []
  );

  useEffect(() => {
    let firstLaunch = true;
    return editor.registerUpdateListener(({ editorState }: any) => {
      if (firstLaunch) {
        editorState.read(() => {
          if (!firstLaunch) {
            return;
          }
          firstLaunch = false;
          const state = editorState.toJSON().root;
          initHashStorage(serializeChildren(state));
        });
      } else {
        editorState.read(() => {
          const state = editorState.toJSON().root;
          const serializedState = serializeChildren(state);
          nodeValues.current = {
            ...nodeValues.current ?? {},
            ...serializedState
          }
          saveState();
        });
      }
    });
  }, [editor, saveState]);

  return null;
};

export const OnChange = {
  name,
  nodes: [],
  plugins: [OnChangePlugin],
};

export default OnChange;
