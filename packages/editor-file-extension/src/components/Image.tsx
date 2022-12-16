import { Icon, Text, tw, useIsDesktopDevice, View } from "@serenity-tools/ui";
import { NodeViewWrapper } from "@tiptap/react";
import React from "react";
import { FileState } from "../types";

type Props = {
  subtypeAttributes: {
    width: number;
    height: number;
  };
  state: FileState;
  selected: boolean;
};

export const Image: React.FC<Props> = (props) => {
  const { subtypeAttributes, state } = props;
  const { width, height } = subtypeAttributes;
  const isDesktopDevice = useIsDesktopDevice();
  const isPortrait = height > width;

  return (
    <NodeViewWrapper
      style={{
        outline: props.selected
          ? `2px solid ${tw.color(
              state.step === "failedToDecrypt" ? "error-200" : "primary-400"
            )}`
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
                name={
                  state.step === "failedToDecrypt"
                    ? "lock-unlock-line-close"
                    : "image-2-line"
                }
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
        <img src={state.contentAsBase64} />
      )}
    </NodeViewWrapper>
  );
};
