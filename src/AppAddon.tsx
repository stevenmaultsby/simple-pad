import { useEffect } from "react";
import { useSelector } from "react-redux";

import cn from "classnames";
import { AppState, useAppDispatch } from "store";

import { SelectionProvider } from "components/addon/SelectionContextProvider/SelectionContext";

import "./services/Helpers/globals";
import "./services/Helpers/sha";
import classes from "styles/AppAddon.module.css";
import Pannel from "components/addon/Panel/Pannel";
import { fetchSession } from "store/session/thunks";

function App() {
  const dispatch = useAppDispatch();
  const {
    id: userId,
    requestIsPending: sessionRequestIsPending,
    error,
  } = useSelector((s: AppState) => s.session);
  useEffect(() => {
    if (!userId && !sessionRequestIsPending && !error) {
      dispatch(fetchSession());
    }
  }, [userId, sessionRequestIsPending, error]);

  // useEffect(() => {
  //   if (session.id) {
  //     dispatch(fetchCommentsIndex());
  //     if (authorizedUser) {
  //       dispatch(fetchCommentsAction(session));
  //     }
  //   }
  // }, [authorizedUser]);

  if (!userId) {
    return <></>;
  }

  return (
    <SelectionProvider>
      <div className={cn(classes.App, classes.pluginApp)}>
        <Pannel />
      </div>
    </SelectionProvider>
  );
}

export const AppAddon = App;
