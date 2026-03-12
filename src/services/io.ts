import { io, Socket } from 'socket.io-client'

export const SERVER_ENTRY_CHANGE_NOTIFCATION =
  'SERVER_ENTRY_CHANGE_NOTIFCATION';

import { CommentType } from 'interfaces/CommentInterface';
import { debounce } from 'lodash';
import { store } from 'store';

import { fetchCommentAction } from "../store/selection/thunks";
import { WS_PATH_PREFIX } from "../vars/ws";
import { API_URL } from "vars/backend";

const BULK_EVENT_DEBOUNCE_LAG = 250;
const BULK_EVENT = "bulk";
const WS_MESSAGE_LOG = true;

interface Bulk {
  seq: number;
  ts: number;
  data: {
    t: string;
    p: any;
  }[];
}

export interface NotificationInterface {
  type: "created" | "updated" | "deleted";
  nType: CommentType;
  id: string;
  fromUser: string;
  toUsers: string[];
  page: string;
  ts: string;
}

const webSocketLogIncoming = (...args: any[]) => {
  if (WS_MESSAGE_LOG) {
    console.log("WS incomming:", ...args);
  }
};

const webSocketLogOutgoing = (...args: any[]) => {
  if (WS_MESSAGE_LOG) {
    console.log("WS outgoing:", ...args);
  }
};

export class RoomConnector {
  // TODO use interfaces from treelib
  sock!: Socket;
  userSock!: Socket;
  constructor() {}
  connect(user: string): void {
    if (this.sock) {
      this.sock.disconnect();
    }
    this.sock = io(
      API_URL +
        `/?location=${encodeURIComponent(
          document.location.pathname
        )}&user=${encodeURIComponent(user)}`,
      {
        transports: ["websockets", "polling"],
        path: WS_PATH_PREFIX,
        query: {},
        withCredentials: false,
      }
    );
    this.sock.on("connect", () => {
      console.log("room socket is connected");
      this.bindRoomSocketEvents();
    });
    this.sock.on("disconnect", () => {
      console.log("room socket is disconnected");
      this.releaseRoomSocketEvents();
    });
  }
  seqNum = 0;
  cache: { t: string; p: any }[] = [];
  _emitCache = debounce(() => {
    const data = this.cache.slice();
    this.cache = [];
    this.sock?.emit(BULK_EVENT, {
      seq: this.seqNum,
      ts: Date.now(),
      data,
    } as Bulk);
    this.seqNum += data.length;
    console.log("Emited: ", data);
  }, BULK_EVENT_DEBOUNCE_LAG);

  disconnect() {
    if (this.sock && this.sock.connected) {
      console.log("Disconnecting from WebSocket...");
      this.sock.disconnect();
    } else {
      console.warn(
        "Attempted to disconnect non-existent or already disconnected WebSocket."
      );
    }
  }

  emit(evName: string, payload: any) {
    this.cache.push({ t: evName, p: payload });
    this._emitCache();
  }
  handleSpareSocketUpdate(notification: any) {
    console.log("WS notification", notification);
  }
  handleSocketEvents() {}
  bindRoomSocketEvents() {
    this.sock.on("ev", (n: NotificationInterface) => {
      // TODO should add some WS updates logic here
      //
      // console.log("room event", n);
      // const {
      //   session,
      //   comments: { comments },
      // } = store.getState();
      // store.dispatch(
      //   setCommentIndexAction({
      //     id: n.id,
      //     page: n.page,
      //     ts: n.ts,
      //     type: n.nType,
      //   })
      // );
      // if (n.type !== "deleted") {
      //   if (
      //     n.id !== session.id ||
      //     !Object.values(comments).find((c) => n.id === c.id)
      //   ) {
      //     store.dispatch(fetchCommentAction(n.id));
      //   }
      // }
    });
  }
  releaseRoomSocketEvents() {
    this.sock.off("ev");
  }
  bindUserSocketEvents() {}
  releaseUserSocketEvents() {}
  notify(msg: any) {
    webSocketLogOutgoing("message", msg);
    this.emit("message", msg);
  }
}

export const rc = new RoomConnector();