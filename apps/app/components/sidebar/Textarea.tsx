import { RawInput } from "@serenity-tools/ui";
import { useLayoutEffect, useRef } from "react";
import { Platform } from "react-native";

const twoRowsHeight = 58;

export const Textarea = (props) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    if (Platform.OS === "web" && textareaRef.current) {
      // reset the height to get the correct scrollHeight for the textarea
      textareaRef.current.style.height = "0px";
      const height = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.max(height, twoRowsHeight)}px`;
    }
  }, [props.value]);

  return (
    <RawInput
      minHeight={twoRowsHeight}
      height="auto"
      {...props}
      multiline
      ref={textareaRef}
    />
  );
};
