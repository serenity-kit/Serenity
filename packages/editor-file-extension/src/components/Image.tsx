import { Icon, Text, tw, useIsDesktopDevice, View } from "@serenity-tools/ui";
import { NodeViewWrapper } from "@tiptap/react";
import React, { useState } from "react";
import { FileState } from "../types";
import { StyleSheet } from "react-native";

type Props = {
  subtypeAttributes: {
    width: number;
    height: number;
  };
  state: FileState;
  selected: boolean;
  mimeType: string;
};

export const Image: React.FC<Props> = (props) => {
  const { subtypeAttributes, state, mimeType } = props;
  const [isHovered, setIsHovered] = useState(false);
  const { width, height } = subtypeAttributes;
  const isDesktopDevice = useIsDesktopDevice();
  const isPortrait = height > width;
  const dataUri = `data:${mimeType};base64,${state.contentAsBase64}`;

  return (
    <NodeViewWrapper
      style={{
        outline: props.selected
          ? `2px solid ${tw.color(
              state.step === "failedToDecrypt" ? "error-200" : "primary-400"
            )}`
          : "none",
        marginTop: 8,
        cursor: "pointer",
        backgroundColor: isHovered ? tw.color("primary-100") : "transparent",
      }}
      // needs to be here otherwise image won't be draggable
      // read https://github.com/ueberdosis/tiptap/issues/2597 for more detailed info
      data-drag-handle=""
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <View
        style={[
          tw`w-[${width}px] max-w-full`,
          {
            aspectRatio: `1 / ${height / width}`,
          },
          isHovered && tw`opacity-80`,
        ]}
      >
        {state.step !== "done" ? (
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
        ) : (
          <img src={dataUri} />
        )}
      </View>
    </NodeViewWrapper>
  );
};
