import type {
  EventPayload,
  SelectionContextEvents,
} from "interfaces/SelectionContextInterfaces";
import { useState } from "react";

export default class SelectionContextEventEmitter {
  private events: Record<string, Array<(payload: any) => void>> = {};

  on(event: string, callback: (payload: any) => void): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: (payload: any) => void): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  emit(event: string | SelectionContextEvents, payload: any): void {
    if (!this.events[event]) return;
    Promise.resolve().then(() => {
      this.events[event].forEach((callback) => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`error in the event handler "${event}":`, error);
        }
      });
    });
  }

  clear() {
    this.events = {};
  }
}

export const useSelectionContextEventEmitter = () => {
  const [eventEmmiter, setEventEmitter] = useState(
    new SelectionContextEventEmitter()
  );
  return eventEmmiter;
};
