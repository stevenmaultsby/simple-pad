import { useCallback, useState } from "react";
import cn from "classnames";
import PanelButtons from "./PanelButtons";

import { default as PanelStyle } from "./Pannel.module.scss";
import MarkdownEditor from "../TextEditor/TextEditor";
import Settings from "./Settings";
import { useAppSelector } from "store";
import { commentStateId } from "services/Helpers/comment";

export default () => {
  const [positionState, setPositionState] = useState({
    opened: false,
    hovered: false,
    transition: false,
    closing: false,
    fullscreen: false,
    settings: false,
  });

  const { opened, hovered, transition, closing, fullscreen, settings } =
    positionState;

  const handleClose = useCallback(() => {
    setPositionState((s) => ({
      ...s,
      opened: false,
      closing: true,
      transition: true,
    }));
  }, [setPositionState]);

  const handleOpen = useCallback(() => {
    setPositionState((s) => ({
      ...s,
      opened: true,
      closing: false,
      transition: true,
    }));
  }, [setPositionState]);

  const handleSettings = useCallback(
    (flag) => {
      setPositionState((s) => ({
        ...s,
        settings: flag && s.opened,
      }));
    },
    [setPositionState]
  );

  const handleHover = useCallback(
    (hovered: boolean) => {
      setPositionState((s) => ({
        ...s,
        hovered,
      }));
    },
    [setPositionState]
  );

  const handleFullscreen = useCallback(
    (fullscreen: boolean) => {
      setPositionState((s) => ({
        ...s,
        fullscreen,
      }));
    },
    [setPositionState]
  );

  const handTransitionEnd = useCallback(() => {
    setPositionState((s) => ({
      ...s,
      transition: false,
      closing: false,
    }));
  }, [setPositionState]);

  const redactorState = useAppSelector((s) => s.redactor);

  return (
    <div
      id={commentStateId}
      onPointerOver={() => handleHover(true)}
      onPointerOut={() => handleHover(false)}
      onClick={handleOpen}
      onTransitionEnd={() => handTransitionEnd()}
      className={cn(PanelStyle.panel, {
        [PanelStyle.opened]: opened,
        [PanelStyle.hovered]: hovered,
        [PanelStyle.transition]: transition,
        [PanelStyle.closed]: !opened && !closing,
        [PanelStyle.fullscreen]: fullscreen,
      })}
    >
      <div>
        <PanelButtons
          onClose={handleClose}
          fullscreen={fullscreen}
          onFullScreen={() => handleFullscreen(true)}
          onFullScreenExit={() => handleFullscreen(false)}
        />
        {
          <Settings
            className={cn(PanelStyle.settings, {
              [PanelStyle.settingsOpened]: settings,
            })}
          />
        }
        <div className={PanelStyle.editorContainer}>
          <MarkdownEditor />
        </div>
      </div>
    </div>
  );
};
