import { useLayoutEffect, useRef } from "react";
import { Platform, TextInput } from "react-native";

export const Textarea = (props) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    if (Platform.OS === "web" && textareaRef.current) {
      // reset the height to get the correct scrollHeight for the textarea
      textareaRef.current.style.height = "0px";

      const computedStyles = window.getComputedStyle(textareaRef.current);
      const height =
        parseInt(computedStyles.getPropertyValue("padding-top"), 10) +
        parseInt(computedStyles.getPropertyValue("padding-bottom"), 10) +
        parseInt(computedStyles.getPropertyValue("border-top-width"), 10) +
        parseInt(computedStyles.getPropertyValue("border-bottom-width"), 10) +
        textareaRef.current.scrollHeight;

      textareaRef.current.style.height = `${height}px`;
    }
  }, [props.value]);

  return <TextInput {...props} multiline ref={textareaRef} />;
};
