import { NodeViewWrapper } from "@tiptap/react";
import React, { useEffect, useReducer } from "react";
import { guessMimeType } from "./utils/guessMimeType";
import { tw, View, Text, Icon, useIsDesktopDevice } from "@serenity-tools/ui";

type State =
  | {
      step: "uploading" | "downloading" | "failedToDecrypt";
      contentAsBase64: null;
    }
  | {
      step: "done";
      contentAsBase64: string;
    };

type Action =
  | {
      type: "setContentAsBase64";
      contentAsBase64: string;
    }
  | {
      type: "failedToDecrypt";
      contentAsBase64: null;
    };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "setContentAsBase64":
      return { contentAsBase64: action.contentAsBase64, step: "done" };
    case "failedToDecrypt":
      return { contentAsBase64: null, step: "failedToDecrypt" };
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
  const isDesktopDevice = useIsDesktopDevice();

  useEffect(() => {
    const retrieveContent = async () => {
      if (fileId && key && nonce) {
        try {
          const decryptedImageData = await downloadAndDecryptFile({
            fileId,
            key,
            publicNonce: nonce,
          });
          const mimeType = guessMimeType({
            base64FileData: decryptedImageData,
          });
          const dataUri = `data:${mimeType};base64,${decryptedImageData}`;
          dispatch({
            type: "setContentAsBase64",
            contentAsBase64: dataUri,
          });
        } catch (err) {
          dispatch({
            type: "failedToDecrypt",
            contentAsBase64: null,
          });
        }
      }
    };

    retrieveContent();
  }, [fileId, key, nonce, downloadAndDecryptFile]);

  const isPortrait = height > width;

  return (
    <NodeViewWrapper
      style={{
        outline: props.selected
          ? `2px solid ${tw.color("primary-400")}`
          : "none",
      }}
    >
      {state.step !== "done" ? (
        <View
          style={[
            tw``,
            {
              aspectRatio: `1 / ${height / width}`,
            },
          ]}
        >
          <div className="shimmerBG flex h-full w-full flex-col items-center justify-center">
            <View
              style={tw`max-${isPortrait ? "w" : "h"}-30 ${
                isPortrait ? "w-1/3" : "h-2/5"
              }`}
            >
              <Icon
                name="image-2-line"
                color={"gray-300"}
                size="full"
                mobileSize={"full"}
              />
            </View>
            <Text
              variant={isDesktopDevice || isPortrait ? "xs" : "xxs"}
              style={tw`text-gray-400 opacity-80`}
              bold
            >
              {
                {
                  downloading: "Downloading …",
                  uploading: "Uploading …",
                  failedToDecrypt: "Failed to decrypt",
                }[state.step]
              }
            </Text>
          </div>
        </View>
      ) : (
        <img src={state.contentAsBase64!} />
      )}
    </NodeViewWrapper>
  );
};
