import { NodeViewWrapper } from "@tiptap/react";
import React, { useEffect, useReducer } from "react";

type State =
  | {
      step: "uploading" | "downloading";
      contentAsBase64: null;
    }
  | {
      step: "done";
      contentAsBase64: string;
    };

type Action = {
  type: "setContentAsBase64";
  contentAsBase64: string;
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "setContentAsBase64":
      return { contentAsBase64: action.contentAsBase64, step: "done" };
  }
};

export const Image = (props: any) => {
  // Update Attributes example:
  //   props.updateAttributes({
  //     something: props.node.attrs.something + 2,
  //   });

  const { fileInfo, width, height } = props.node.attrs;
  const { fileId, key, nonce } = fileInfo
    ? fileInfo
    : { fileId: null, key: null, nonce: null };

  const { downloadAndDecryptFile } = props.editor.storage.image;
  const initialState: State = {
    step: fileId ? "downloading" : "uploading",
    contentAsBase64: null,
  };
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const retrieveContent = async () => {
      if (fileId && key && nonce) {
        const decryptedImageData = await downloadAndDecryptFile({
          fileId,
          workspaceId: "invalid",
          documentId: "invalid",
          key,
          publicNonce: nonce,
        });
        dispatch({
          type: "setContentAsBase64",
          contentAsBase64: decryptedImageData,
        });
      }
    };

    retrieveContent();
  }, [fileId, key, nonce, downloadAndDecryptFile]);

  return (
    <NodeViewWrapper
      style={{ outline: props.selected ? "2px solid blue" : "none" }}
    >
      {state.step !== "done" ? (
        <div
          style={{
            backgroundColor: "#ddd", // TODO replace with proper theme color
            aspectRatio: `1 / ${height / width}`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {state.step === "downloading"
            ? "Download in progress …"
            : "Upload in progress …"}
        </div>
      ) : (
        <img src={state.contentAsBase64!} />
      )}
    </NodeViewWrapper>
  );
};
