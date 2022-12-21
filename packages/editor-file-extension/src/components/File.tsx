import { Icon, IconButton, Spinner, Text, tw } from "@serenity-tools/ui";
import { NodeViewWrapper } from "@tiptap/react";
import { HStack } from "native-base";
import React, { useEffect } from "react";
import { useFileStatesStore } from "../stores/fileStatesStore";
import { FileInfo, FileState } from "../types";
import { formatBytes } from "../utils/formatBytes";
import { Image } from "./Image";

export const File = (props: any) => {
  const {
    fileInfo,
    mimeType,
  }: { fileInfo: FileInfo; mimeType: string; state: FileState } =
    props.node.attrs;

  const { fileId, key, nonce } = fileInfo
    ? fileInfo
    : { fileId: null, key: null, nonce: null };

  const { downloadAndDecryptFile, shareOrSaveFile } = props.editor.storage.file;

  const fileStates = useFileStatesStore((state) => state.fileStates);
  const state: FileState = (fileId && fileStates[fileId]) ||
    (fileId && {
      step: "downloading",
      contentAsBase64: null,
    }) || {
      step: "uploading",
      contentAsBase64: null,
    };

  const updateFileState = useFileStatesStore((state) => state.updateFileState);

  useEffect(() => {
    const retrieveContent = async () => {
      if (fileId && key && nonce && state.step === "downloading") {
        try {
          const decryptedImageData = await downloadAndDecryptFile({
            fileId,
            key,
            publicNonce: nonce,
          });
          updateFileState(fileId, {
            step: "done",
            contentAsBase64: decryptedImageData,
          });
        } catch (err) {
          updateFileState(fileId, {
            step: "failedToDecrypt",
            contentAsBase64: null,
          });
        }
      }
    };

    retrieveContent();
  }, [
    fileId,
    key,
    nonce,
    downloadAndDecryptFile,
    mimeType,
    updateFileState,
    state.step,
  ]);

  if (props.node.attrs.subtype === "image") {
    return (
      <Image
        selected={props.selected}
        state={state}
        subtypeAttributes={props.node.attrs.subtypeAttributes}
        mimeType={mimeType}
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
        // using these to align Icon with text without cramping the focus-outline to the content
        marginRight: -6,
        marginLeft: -6,
      }}
      // needs to be here otherwise image won't be draggable
      // read https://github.com/ueberdosis/tiptap/issues/2597 for more detailed info
      data-drag-handle=""
    >
      <div className={"w-full rounded" + (isLoading && " shimmerBG")}>
        <HStack space={2} alignItems={"center"} style={tw`mt-2 p-1.5`}>
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
            numberOfLines={1}
            ellipsizeMode="middle"
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
                  done: "",
                }[state.step]
              }
            </Text>
            <IconButton
              name="download-line"
              onPress={() => {
                if (state.contentAsBase64) {
                  shareOrSaveFile({
                    contentAsBase64: state.contentAsBase64,
                    fileName,
                    mimeType,
                  });
                }
              }}
              disabled={!state.contentAsBase64}
            />
          </HStack>
        </HStack>
      </div>
    </NodeViewWrapper>
  );
};
