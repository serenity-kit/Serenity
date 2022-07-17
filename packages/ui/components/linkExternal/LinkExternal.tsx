import * as Linking from "expo-linking";
import * as React from "react";
import { Platform } from "react-native";
import { useFocusRing } from "@react-native-aria/focus";
import { Text, TextProps } from "../text/Text";
import { createLinkStyles } from "../link/Link";

export type LinkExternalProps = TextProps & {
  children: React.ReactNode;
  href: string;
};

export function LinkExternal(props: LinkExternalProps) {
  const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();
  const styles = createLinkStyles();

  return (
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
      style={[
        styles.default,
        isFocusVisible && styles.focusVisible,
        props.style,
      ]}
    >
      {props.children}
    </Text>
  );
}
