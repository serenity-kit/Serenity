import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { IconButton } from "../iconButton/IconButton";
import { Tooltip } from "../tooltip/Tooltip";
import { View, ViewProps } from "../view/View";
import { Text, TextVariants } from "../text/Text";

export type TextAreaProps = ViewProps & {
  variant?: TextVariants;
  selectable?: boolean;
  testID?: string;
  isClipboardNoticeActive?: boolean;
  onCopyPress?: () => void;
};

export function TextArea(props: TextAreaProps) {
  const { variant = "xs", selectable, isClipboardNoticeActive } = props;
  const styles = StyleSheet.create({
    wrapper: tw`relative mb-2 py-4 px-5 border rounded ${
      selectable
        ? `pr-9 bg-primary-100/40 border-primary-200`
        : `bg-gray-100 border-gray-200`
    }`,
    text: selectable ? tw`text-primary-900` : tw`text-gray-400`,
  });

  return (
    <View style={[styles.wrapper, props.style]}>
      <Text
        variant={variant}
        style={styles.text}
        testID={props.testID}
        selectable={selectable}
      >
        {props.children}
      </Text>

      {selectable && props.onCopyPress ? (
        <View style={tw`absolute right-3 top-3`}>
          <Tooltip
            label={isClipboardNoticeActive ? "Copying..." : "Copy to clipboard"}
            placement={"left"}
          >
            <IconButton
              name="file-copy-line"
              color={"primary-300"}
              transparent
              onPress={props.onCopyPress}
              isLoading={isClipboardNoticeActive}
            />
          </Tooltip>
        </View>
      ) : null}
    </View>
  );
}
