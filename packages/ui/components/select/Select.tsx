import { ISelectProps, Select as NbSelect } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { useIsEqualOrLargerThanBreakpoint } from "../../hooks/useIsEqualOrLargerThanBreakpoint/useIsEqualOrLargerThanBreakpoint";
import { tw } from "../../tailwind";
import { Icon } from "../icon/Icon";
import { View } from "../view/View";

export type SelectProps = ISelectProps & {};

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
  const { dropdownIcon, ...rest } = props;

  // only the necessary styles are defined here, the basic Input stylings are in App.tsx to override the
  // native-base stylings as the Input is also used internally in the Select component
  const styles = StyleSheet.create({
    input: tw`${isEqualOrLargerThanXS ? "text-xs" : "text-input"}`,
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
      style={[styles.input, props.style]}
      borderColor={tw.color("gray-400")}
      // height needs to be defined here as when added via style some weird space is added
      height={isEqualOrLargerThanXS ? 10 : 12}
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
