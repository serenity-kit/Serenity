import React, { useLayoutEffect, useRef } from "react";
import { Platform } from "react-native";
import { RawInput, RawInputProps } from "../rawInput/RawInput";

export type TextAreaProps = RawInputProps & {
  minRows?: number;
  maxRows?: number;
};

const calculateHeight = (rows: number) => {
  // rows * lineheight + top-padding as the bottom padding needs to be on the container
  return rows * 18 + 16;
};

export const TextArea = (props: TextAreaProps) => {
  const { minRows = 2, maxRows = 5 } = props;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const minRowsHeight = calculateHeight(minRows);

  useLayoutEffect(() => {
    if (Platform.OS === "web" && textareaRef.current) {
      // reset the height to get the correct scrollHeight for the textarea
      textareaRef.current.style.height = "0px";
      const height = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.max(height, minRowsHeight)}px`;
    }
  }, [props.value, minRowsHeight]);

  return (
    <RawInput
      // px needed as a sheer number can result in inconsistent behaviour, as nativebase has a type ISizes
      // and if the number matches with one from this type it is automagically converted in a different
      // px-size (entered number x 4) => e.g. 10 => 40px but 11 => 11px and then 12 => 48px
      minHeight={`${minRowsHeight}px`}
      height="auto"
      {...props}
      multiline
      ref={textareaRef}
      _input={{
        // needs to be on the textarea element directly for correct overflow scroll behaviour
        minHeight: `${minRowsHeight}px`,
        maxHeight: `${calculateHeight(maxRows)}px`,
      }}
    />
  );
};
