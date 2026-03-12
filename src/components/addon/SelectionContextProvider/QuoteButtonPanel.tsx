import React, { useState, useCallback } from "react";
import { getSafeRanges } from "services/Helpers/range-serializer";
import classes from "./QuoteButtonPanel.module.css";
import { TextSelectedEvent } from "interfaces/SelectionContextInterfaces";

const QuoteButtonPanel = ({ commentCreationAction }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const [currentSelection, setCurrentSelection] = useState(null);

  const handlePageClick = (e) => {
    const selection = window.getSelection();
    const needToShowPanel =
      !e.target.closest(".quoteButtonpanel") &&
      selection &&
      selection.toString() !== "" &&
      getSafeRanges(selection.getRangeAt(0)).length > 0;
    if (needToShowPanel) {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const handleComment = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      commentCreationAction(e);
      setIsVisible(false);
    },
    [commentCreationAction]
  );

  const handlePanelClick = (e) => {
    e.stopPropagation();
  };

  React.useEffect(() => {
    document.addEventListener("click", handlePageClick);
    return () => {
      document.removeEventListener("click", handlePageClick);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`${classes.quoteButtonpanel}`}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        transform: "translate(10px, 10px)",
        zIndex: 10000,
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: "4px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        padding: "2px",
      }}
      onClick={handlePanelClick}
      onMouseUp={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <button
        onClick={handleComment}
        className={`${classes.quoteButton}`}
        onMouseUp={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        Quote this text
      </button>
    </div>
  );
};

export default QuoteButtonPanel;
