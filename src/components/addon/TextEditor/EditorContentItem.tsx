import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import classes from "./TextEditor.module.css";
import { MouseEventHandler } from "react";

export default function EditorContentItem({
  collapsed,
  onCollapsedClick,
  okHandler,
  xHandler,
}: {
  collapsed: boolean;
  onCollapsedClick: MouseEventHandler;
  okHandler: MouseEventHandler;
  xHandler: MouseEventHandler;
}) {
  return (
    <>
      {!collapsed && (
        <>
          <div
            className={`${classes.editorOpened}`}
            onMouseUp={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <ContentEditable className={`${classes.editorInput}`} />
            <div className={`${classes.buttonsContainer}`}>
              <button onClick={okHandler} className={`${classes.editorButton}`}>
                ok
              </button>
              <button onClick={xHandler} className={`${classes.editorButton}`}>
                X
              </button>
            </div>
          </div>
        </>
      )}
      {collapsed && (
        <button
          className={`${classes.collapsed}`}
          onClick={onCollapsedClick}
          onMouseUp={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        ></button>
      )}
    </>
  );
}
