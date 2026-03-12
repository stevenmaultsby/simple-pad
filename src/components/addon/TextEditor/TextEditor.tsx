import React, { useCallback, useState, useEffect, useMemo } from "react";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { LineBreakNode, SerializedLexicalNode, EditorState } from "lexical";
import { useAppDispatch, useAppSelector } from "../../../store/index";

import * as pluginSystem from "./plugins";
import defaultTheme from "./TextEditorScheme";

import "./TextEditorScheme.css";
import { fetchRedactorPageData } from "store/redactor/thunks";
import { SerializedNode } from "./plugins/OnChange/OnChange";

interface MarkdownEditorProps {
  initialMarkdown?: string;
  onChange?: (editorState: EditorState) => void;
  placeholder?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = () => {
  const restoreNodeFromRef = useCallback(
    (id: string, refs: Record<string, any>) => {
      if (refs[id]) {
        const node = refs[id];
        const targetId = id.split("_")[0];
        return {
          ...node,
          $: {
            ...(node.$ ?? {}),
            id: targetId,
          },
          children: (node.children ?? [])
            .map(({ ref: refId }) => restoreNodeFromRef(refId, refs))
            .filter(Boolean),
        };
      }
    },
    []
  );

  const dispatch = useAppDispatch();

  const [initialData, setInitialData] = useState<
    Record<string, SerializedLexicalNode> | boolean
  >(false);

  useEffect(() => {
    dispatch(fetchRedactorPageData())
      .unwrap()
      .then((q) => {
        setTimeout(() => {
          setInitialData(q.items);
        }, 1);
      })
      .catch(() => {
        setInitialData({});
      });
  }, []);

  const initialState = useMemo(() => {
    if (!initialData) {
      return false;
    }
    const state = initialData as Record<string, SerializedNode>;
    const rootId = Object.keys(state).find(
      (id: string) => state[id].type === "root"
    );
    if (!rootId) {
      return undefined;
    }
    const targetRootId = rootId.split("_")[0];
    const root = {
      $: {
        id: targetRootId,
      },
      children: (state[rootId].children ?? [])
        .map(({ ref: refId }) => restoreNodeFromRef(refId, state))
        .filter(Boolean),
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    };
    if (!root.children || root.children.length === 0) {
      return undefined;
    }
    const ret = JSON.stringify({ root });
    return ret;
  }, [initialData]);

  const allNodes = useMemo(
    () => [
      LineBreakNode,
      HeadingNode,
      ListNode,
      ListItemNode,
      CodeNode,
      LinkNode,
      QuoteNode,
      ...pluginSystem.nodes,
    ],
    []
  );

  const pluginComponents = useMemo(() => pluginSystem.plugins, []);

  if (!initialData) {
    return <></>;
  }
  const initialConfig = {
    namespace: `editor`,
    editorState: initialState,
    theme: defaultTheme,
    onError: (e) => {
      console.error(e);
    },
    nodes: allNodes,
  };
  return (
    // @ts-ignore
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable className="textEditor___editor_scheme" />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <TabIndentationPlugin />
      <HistoryPlugin />
      <AutoFocusPlugin />
      {pluginComponents.map((Plugin, i) => (
        <Plugin key={`${Plugin.name}-${i}`} />
      ))}
    </LexicalComposer>
  );
};

export default MarkdownEditor;
