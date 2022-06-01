import React, {
  forwardRef,
  useEffect,
  useRef,
  useImperativeHandle,
} from "react";
import { StyleSheet, TextInput } from "react-native";
import { tw } from "../../tailwind";

export type InlineInputProps = TextInput["props"] & {
  onCancel: () => void;
  onSubmit: (text: string) => void;
  value: string;
};

export const InlineInput = forwardRef<TextInput, InlineInputProps>(
  (props: InlineInputProps, ref) => {
    const styles = StyleSheet.create({
      input: tw`text-small text-gray-900`,
    });

    const [canceled, setCanceled] = React.useState(false);
    const [value, setValue] = React.useState(props.value);
    const innerRef = useRef<TextInput>(null);

    // @ts-expect-error it works :)
    useImperativeHandle(ref, () => innerRef.current);

    useEffect(() => {
      if (props.value) {
        setValue(props.value);
      }
    }, [props.value]);

    useEffect(() => {
      // for some reason in react-native-web we can't focus instantly on the input
      // this is a workaround that works consistently
      setTimeout(() => {
        if (innerRef.current) {
          innerRef.current.focus();
        }
      }, 250);
    }, []);

    return (
      <TextInput
        {...props}
        ref={innerRef}
        style={[styles.input, props.style]}
        onChangeText={setValue}
        value={value}
        onFocus={() => setCanceled(false)}
        onBlur={() => {
          if (!canceled) {
            props.onSubmit(value);
          } else {
            props.onCancel();
          }
        }}
        onKeyPress={(evt) => {
          if (evt.nativeEvent.key === "Escape") {
            evt.preventDefault();
            evt.stopPropagation(); // to avoid closing the drawer
            setCanceled(true);
            props.onCancel();
          }
        }}
      />
    );
  }
);
