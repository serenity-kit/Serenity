import { Icon, Spinner, Text, tw } from "@serenity-tools/ui";
import { NodeViewWrapper } from "@tiptap/react";
import { HStack } from "native-base";
import React, { useEffect, useReducer } from "react";
import { formatBytes } from "../utils/formatBytes";
import { guessMimeType } from "../utils/guessMimeType";
import { Image } from "./Image";
import { State } from "./types";

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

export const File = (props: any) => {
  // Update Attributes example:
  //   props.updateAttributes({
  //     something: props.node.attrs.something + 2,
  //   });

  const { fileInfo } = props.node.attrs;
  const { fileId, key, nonce } = fileInfo
    ? fileInfo
    : { fileId: null, key: null, nonce: null };

  const { downloadAndDecryptFile } = props.editor.storage.file;
  const initialState: State = {
    step: fileId ? "downloading" : "uploading",
    contentAsBase64: null,
  };
  const [state, dispatch] = useReducer(reducer, initialState);

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

  if (props.node.attrs.subtype === "image") {
    return (
      <Image
        selected={props.selected}
        state={state}
        subtypeAttributes={props.node.attrs.subtypeAttributes}
      />
    );
  }

  const { fileSize, fileName } = props.node.attrs.subtypeAttributes;
  const isLoading = state.step === "uploading" || state.step === "downloading";
  const hasFailedToDecrypt = state.step === "failedToDecrypt";
  const isDone = state.step === "done";

  return (
    <NodeViewWrapper
      style={{
        outline: props.selected
          ? `2px solid ${tw.color(
              hasFailedToDecrypt ? "error-200" : "primary-400"
            )}`
          : "none",
      }}
    >
      <div className={"w-full rounded" + (isLoading && " shimmerBG")}>
        <HStack space={2} alignItems={"center"} style={tw`p-1.5`}>
          <Icon
            name={
              hasFailedToDecrypt
                ? "lock-unlock-line-close"
                : "file-transfer-line"
            }
            size={5}
            color={isDone ? "gray-900" : "gray-600"}
          />
          <Text
            variant="md"
            muted={!isDone}
            style={hasFailedToDecrypt && tw`line-through`}
          >
            {fileName}
          </Text>
          {/* padding to adjust centered look */}
          <Text variant="xs" muted style={tw`pt-0.5`}>
            {formatBytes(fileSize)}
          </Text>
          <HStack alignItems={"center"}>
            {isLoading ? (
              <Spinner
                color={tw.color("gray-500")}
                style={[
                  tw`ml-5 mr-1`,
                  {
                    transform: [
                      {
                        scale: 0.8,
                      },
                    ],
                  },
                ]}
              />
            ) : null}
            {/* padding to adjust centered look */}
            <Text
              variant="xs"
              muted
              style={[tw`pt-0.5`, hasFailedToDecrypt && tw`ml-5`]}
            >
              {
                {
                  downloading: "Downloading …",
                  uploading: "Uploading …",
                  failedToDecrypt: "Failed to decrypt",
                }[state.step]
              }
            </Text>
          </HStack>
        </HStack>
      </div>
    </NodeViewWrapper>
  );
};
