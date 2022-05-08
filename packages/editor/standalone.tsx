import React from "react";
import ReactDOM from "react-dom";
import { NativeBaseProvider } from "native-base";
import { Editor } from "./Editor";
import * as Y from "yjs";

const ydoc = new Y.Doc();
window.ydoc = ydoc;

window.applyYjsUpdate = function (updateArray) {
  if (updateArray) {
    const update = new Uint8Array(updateArray);
    Y.applyUpdateV2(window.ydoc, update, "react-native-bridge");
  }
};

ydoc.on("update", (update: any) => {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: "update", content: Array.from(update) })
    );
  }
});

const openDrawer = () => {
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: "openDrawer" }));
};

const domContainer = document.querySelector("#editor");
ReactDOM.render(
  <NativeBaseProvider>
    <Editor
      documentId={"dummyDocumentId"}
      yDocRef={{ current: ydoc }}
      openDrawer={openDrawer}
    />
  </NativeBaseProvider>,
  domContainer
);
