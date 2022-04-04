import React from "react";
import ReactDOM from "react-dom";
import { Editor } from "./Editor";
import * as Y from "yjs";

window.applyYjsUpdate = function (updateArray) {
  if (updateArray) {
    const update = new Uint8Array(updateArray);
    Y.applyUpdateV2(window.ydoc, update);
  }
};

const ydoc = new Y.Doc();
window.ydoc = ydoc;

ydoc.on("update", (update: any) => {
  // console.log(
  //   "update: ",
  //   update,
  //   JSON.stringify(Array.from(update)),
  //   ydoc.clientID
  // );
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: "update", content: Array.from(update) })
    );
  }
});

const domContainer = document.querySelector("#editor");
ReactDOM.render(<Editor yDocRef={{ current: ydoc }} />, domContainer);
