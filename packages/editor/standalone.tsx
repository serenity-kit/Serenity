import React from "react";
import ReactDOM from "react-dom";
import { NativeBaseProvider } from "native-base";
import { Editor } from "./Editor";
import * as Y from "yjs";
import {
  Awareness,
  encodeAwarenessUpdate,
  applyAwarenessUpdate,
  removeAwarenessStates,
} from "y-protocols/awareness";
import { UpdateEditorParams } from "./types";
import { updateEditor } from "./updateEditor";
import { getEditorToolbarStateFromEditor } from "./getEditorToolbarStateFromEditor";

const ydoc = new Y.Doc();
window.ydoc = ydoc;
window.isNew = window.isNew === undefined ? false : window.isNew;
if (window.initialContent) {
  const update = new Uint8Array(window.initialContent);
  Y.applyUpdateV2(window.ydoc, update, "react-native-bridge");
}
window.applyYjsUpdate = function (updateArray) {
  if (updateArray) {
    const update = new Uint8Array(updateArray);
    Y.applyUpdateV2(window.ydoc, update, "react-native-bridge");
  }
};
ydoc.on("update", (update: any, origin: string) => {
  if (window.ReactNativeWebView && origin !== "react-native-bridge") {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: "update", content: Array.from(update) })
    );
  }
});

const yAwareness = new Awareness(ydoc);
window.applyYAwarenessUpdate = function (update) {
  if (update) {
    const updateArray = new Uint8Array(update);
    applyAwarenessUpdate(yAwareness, updateArray, "react-native-bridge");
  }
};
yAwareness.on("update", ({ added, updated, removed }: any, origin: string) => {
  if (window.ReactNativeWebView && origin !== "react-native-bridge") {
    const changedClients = added.concat(updated).concat(removed);
    const update = encodeAwarenessUpdate(yAwareness, changedClients);

    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "updateYAwareness",
        content: Array.from(update),
      })
    );
  }
});

const openDrawer = () => {
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: "openDrawer" }));
};

const updateTitle = (title: string) => {
  window.ReactNativeWebView.postMessage(
    JSON.stringify({ type: "updateTitle", title })
  );
};

window.updateEditor = (paramsString: string) => {
  const params: UpdateEditorParams = JSON.parse(paramsString);
  updateEditor(window.editor, params);
};

const domContainer = document.querySelector("#editor");
ReactDOM.render(
  <NativeBaseProvider>
    <Editor
      documentId={"dummyDocumentId"}
      yDocRef={{ current: ydoc }}
      yAwarenessRef={{ current: yAwareness }}
      openDrawer={openDrawer}
      updateTitle={updateTitle}
      isNew={window.isNew}
      editorHeight={window.editorHeight}
      onCreate={(params) => (window.editor = params.editor)}
      onTransaction={({ editor }) => {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "update-editor-toolbar-state",
            content: getEditorToolbarStateFromEditor(editor),
          })
        );
      }}
    />
  </NativeBaseProvider>,
  domContainer
);
