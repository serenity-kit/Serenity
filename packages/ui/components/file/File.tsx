import React, { forwardRef } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Text } from "../text/Text";
import { HStack } from "native-base";
import { Spinner } from "../spinner/Spinner";
import { Icon } from "../icon/Icon";

type State =
  | {
      step: "uploading" | "downloading" | "failedToDecrypt";
      contentAsBase64: null;
    }
  | {
      step: "done";
      contentAsBase64: string;
    };

export type FileProps = {
  fileSize: string;
  fileName: string;
  state: State;
  selected?: boolean;
};

// TODO
// shimmerBG or Spinner ?
// focus

export const File = forwardRef((props: FileProps, ref) => {
  const { fileSize, fileName, state } = props;

  const styles = StyleSheet.create({
    stack: tw`w-full rounded`,
  });

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
      {/* <View style={[styles.stack, isLoading && tw`bg-gray-200`]}> */}
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
            {fileSize}
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
      {/* </View> */}
    </NodeViewWrapper>
  );
});
