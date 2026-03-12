// import { FaXmark } from "react-icons/fa6";
import {
  Close,
  DragIndicator,
  Fullscreen,
  FullscreenExit,
  Settings,
} from "@mui/icons-material";
import { default as panelButtonsStyle } from "./PanelButtons.module.scss";
import {
  MouseEvent,
  MouseEventHandler,
  PointerEvent,
  useCallback,
} from "react";

const HTML_COLOR = "#666";

export default ({
  onClose,
  onFullScreen,
  onFullScreenExit,
  fullscreen = false,
}: {
  onClose: () => void;
  onFullScreen: () => void;
  onFullScreenExit: () => void;
  fullscreen: boolean;
}) => {
  const handlepanelButtonsEvents = useCallback(
    (ev: MouseEvent<HTMLDivElement>) => {
      ev.stopPropagation();
    },
    []
  );
  const handlePointerEvent = useCallback((ev: PointerEvent<HTMLDivElement>) => {
    ev.stopPropagation();
  }, []);
  return (
    <div
      className={panelButtonsStyle.panelButtons}
      onClick={handlepanelButtonsEvents}
      onPointerLeave={handlePointerEvent}
      onPointerEnter={handlePointerEvent}
    >
      <div className={panelButtonsStyle.buttonsLeft}>
        {/* <div className={panelButtonsStyle.button} onClick={onFullScreenExit}>
          <DragIndicator htmlColor={HTML_COLOR} />
        </div> */}
        {!fullscreen && (
          <div className={panelButtonsStyle.button} onClick={onFullScreen}>
            <Fullscreen htmlColor={HTML_COLOR} />
          </div>
        )}
        {fullscreen && (
          <div className={panelButtonsStyle.button} onClick={onFullScreenExit}>
            <FullscreenExit htmlColor={HTML_COLOR} />
          </div>
        )}
      </div>
      <div className={panelButtonsStyle.buttonsRight}>
        {/* <div className={panelButtonsStyle.button}>
          <Settings htmlColor={HTML_COLOR} />
        </div> */}
        <div className={panelButtonsStyle.button} onClick={onClose}>
          <Close htmlColor={HTML_COLOR} />
        </div>
      </div>
    </div>
  );
};
