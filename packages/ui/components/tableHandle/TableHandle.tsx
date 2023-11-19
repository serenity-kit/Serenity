import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Pressable, PressableProps } from "../pressable/Pressable";

export type TableHandleProps = PressableProps & {
  variant: "row" | "column";
  isActive?: boolean;
};

export const TableHandle = React.forwardRef(
  (props: TableHandleProps, ref: any) => {
    const { isActive = false, variant, ...rest } = props;
    const [isHovered, setIsHovered] = useState(false);

    const styles = StyleSheet.create({
      pressable: tw`bg-gray-120`,
      hovered: tw`bg-gray-150`,
      active: tw`bg-primary-500 border-primary-500`,
      row: tw`h-full w-4 border-b border-gray-300`,
      column: tw`h-4 w-full border-r border-gray-300`,
    });

    return (
      <Pressable
        ref={ref}
        {...rest}
        role={props.role ?? "button"}
        style={[
          styles.pressable,
          styles[variant],
          isHovered && styles.hovered,
          isActive && styles.active,
          // @ts-expect-error - native base style mismatch
          rest.style,
        ]}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
    );
  }
);
