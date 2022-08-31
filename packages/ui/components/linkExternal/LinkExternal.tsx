import * as Linking from "expo-linking";
import * as React from "react";
import { Platform } from "react-native";
import { useFocusRing } from "@react-native-aria/focus";
import { Text, TextProps } from "../text/Text";
import { createLinkStyles } from "../link/Link";
import { Icon } from "../icon/Icon";
import { tw } from "../../tailwind";
import { HStack } from "native-base";
import { View } from "../view/View";

export type LinkExternalProps = TextProps & {
  children: React.ReactNode;
  href: string;
  icon?: boolean;
};

export function LinkExternal(props: LinkExternalProps) {
  const { variant = "md", icon } = props;
  const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();
  const styles = createLinkStyles();

  const iconSizes = {
    xxs: 3.5,
    xs: 4,
    sm: 4,
    md: 5,
    lg: 8,
  };

  return (
    <HStack alignItems={"center"}>
      <Text
        {...props}
        {...focusRingProps} // sets onFocus and onBlur
        accessibilityRole="link"
        // @ts-expect-error
        href={props.href}
        hrefAttrs={{
          target: "_blank",
        }}
        onPress={(event) => {
          // on web it's a regular link and therefor
          // no custom onPress handling is necessary
          if (Platform.OS !== "web") {
            Linking.openURL(props.href);
          }
          props.onPress && props.onPress(event);
        }}
        variant={variant}
        style={[
          styles.default,
          isFocusVisible && styles.focusVisible,
          props.style,
        ]}
      >
        {props.children}
      </Text>
      {icon ? (
        <View style={tw`pl-0.5`}>
          <Icon
            name="external-link-line"
            color={tw.color("primary-500")}
            size={iconSizes[variant]}
          />
        </View>
      ) : null}
    </HStack>
  );
}
