import SelectionContextEventEmitter from "components/addon/SelectionContextProvider/SelectionContextEventEmmiter";

export interface SelectionData {
  text: string;
  xpath: string | null;
  selector: string | null;
}

export interface SelectionContextType {
  lastSelection: SelectionData | null;
  focusItem: (id: string) => null;
  selectionEventEmitter: SelectionContextEventEmitter;
}

export interface ISelectionContextEvent {
  event: SelectionContextEvents;
  payload: any;
}

// export type EventPayload = Record<string, any>;
export type EventPayload = any;

export enum SelectionContextEvents {
  TEXT_SELECTED = "text_selected",
  EMPTY_SELECTION = "empty_selection",
}

export class TextSelectedEvent implements ISelectionContextEvent {
  public event: SelectionContextEvents = SelectionContextEvents.TEXT_SELECTED;
  public payload: any;
  constructor(payload: any) {
    this.payload = payload;
  }
}

export class EmptySelectionEvent implements ISelectionContextEvent {
  public event: SelectionContextEvents = SelectionContextEvents.EMPTY_SELECTION;
  public payload: any;
  constructor(payload: any) {
    this.payload = payload;
  }
}
