import React from "react";
import { StyleSheet } from "react-native";
import { View } from "../view/View";
import { tw } from "../../tailwind";
import { Pressable, PressableProps } from "../pressable/Pressable";
import { Icon } from "../icon/Icon";

export type TableInsertProps = PressableProps & {};

export const TableInsert = React.forwardRef(
  (props: TableInsertProps, ref: any) => {
    const styles = StyleSheet.create({
      pressable: tw`flex justify-center items-center h-4 w-4`,
      view: tw`flex justify-center items-center h-1 w-1 bg-gray-300 rounded-full`,
      hovered: tw`h-4 w-4 bg-primary-500`,
      pressed: tw`bg-primary-700`,
    });

    return (
      <Pressable
        ref={ref}
        {...props}
        accessibilityRole={props.accessibilityRole ?? "button"}
        style={[styles.pressable]}
      >
        {({ isPressed, isHovered, isFocused }) => {
          return (
            <View
              style={[
                styles.view,
                isHovered && styles.hovered,
                isPressed && styles.pressed,
              ]}
            >
              {isHovered ? <Icon name="add-line" color="white" /> : null}
            </View>
          );
        }}
      </Pressable>
    );
  }
);
