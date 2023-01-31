import React from "react";
import { StyleSheet } from "react-native";
import { Select as NbSelect, ISelectProps } from "native-base";
import { Icon } from "../icon/Icon";
import { tw } from "../../tailwind";
import { useIsEqualOrLargerThanBreakpoint } from "../../hooks/useIsEqualOrLargerThanBreakpoint/useIsEqualOrLargerThanBreakpoint";
import { RawInputSize } from "../rawInput/RawInput";
import { View } from "../view/View";

export type SelectProps = ISelectProps & {
  size?: RawInputSize;
};

/* 
depending on which property is passed different elements will be adressed

findings so far

    SelectWrapper => marginRight
    InputWrapper => borderColor, height, backgroundColor
    Input => style

    none => paddingRight, pr
*/

export const Select = React.forwardRef((props: SelectProps, ref) => {
  const isEqualOrLargerThanXS = useIsEqualOrLargerThanBreakpoint("xs");
  const {
    dropdownIcon,
    size = isEqualOrLargerThanXS ? "md" : "lg",
    ...rest
  } = props;

  const styles = StyleSheet.create({
    input: tw`py-3 px-4 font-input ${size == "md" ? "text-xs" : "text-input"}`,
  });

  return (
    <NbSelect
      // @ts-ignore
      ref={ref}
      {...rest}
      dropdownIcon={
        <View style={tw`pr-2`}>
          <Icon
            name={"arrow-down-s-line"}
            color={"gray-600"}
            size={4}
            mobileSize={5}
          />
        </View>
      }
      style={styles.input}
      borderColor={tw.color("gray-400")}
      // height needs to be defined here as when added via style some weird space is added
      height={size === "md" ? 10 : 12}
      backgroundColor={tw.color("white")}
      _actionSheetContent={{
        style: tw`bg-white`,
      }}
      _selectedItem={{
        _text: {
          color: tw.color("primary-600"),
          // fontFamily: "Inter_500Medium",
        },
      }}
    >
      {props.children}
    </NbSelect>
  );
});
