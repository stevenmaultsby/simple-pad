import React from "react";

import { Buffer } from "buffer";
import { rc } from "services/io";

import * as reduxStore from "../../store";
import { sha3_256 as sha } from "./sha";

(() => {
  "use strict";
  var WINDOW = typeof window === "object";
  var root = WINDOW ? window : {};
  if (root.JS_SHA3_NO_WINDOW) {
    WINDOW = false;
  }
  var WEB_WORKER = !WINDOW && typeof self === "object";
  var NODE_JS =
    !root.JS_SHA3_NO_NODE_JS &&
    typeof process === "object" &&
    process.versions &&
    process.versions.node;
  if (NODE_JS) {
    root = global;
  } else if (WEB_WORKER) {
    root = self;
  }

  const glob = {
    wsConnector: rc,
    Buffer: Buffer,
    React,
    store: reduxStore,
    hash: sha,
  };

  root.__commented_plugin = glob;
  root.__commented_hash = glob.hash;
})();