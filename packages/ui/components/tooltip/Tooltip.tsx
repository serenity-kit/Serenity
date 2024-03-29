import React from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { Tooltip as NBTooltip } from "native-base";
import { ITooltipProps } from "native-base/lib/typescript/components/composites/Tooltip/types.d";

type TooltipProps = ITooltipProps & {
  hasArrow?: boolean;
};

export const Tooltip = React.forwardRef((props: TooltipProps, ref) => {
  const { hasArrow = true } = props;

  const styles = StyleSheet.create({
    default: tw`shadow-none`,
    text: tw`text-xxs font-inter-semi`,
  });

  return (
    <NBTooltip
      {...props}
      openDelay={600}
      style={[styles.default, props.style]}
      backgroundColor={"gray.800"} // needed here so arrow-color is set accordingly
      borderWidth={0}
      borderRadius={2}
      hasArrow={hasArrow}
      arrowSize={10}
      _text={{
        style: styles.text,
      }}
    >
      {props.children}
    </NBTooltip>
  );
});
