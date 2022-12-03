import { useFocusRing } from "@react-native-aria/focus";
import React from "react";
import { Platform } from "react-native";
import { tw } from "../../tailwind";
import { Pressable, PressableProps } from "../pressable/Pressable";
import { Text } from "../text/Text";

export type TabProps = PressableProps & { tabId: string; isActive: boolean };

// Currently each Tab is focusable. The proper way would be to implement
// navigation via arrow keys, but that also would require more research
// and testing to not negatively affect the accessibility for mobile.
// The current version seemed like an ok compromise for now.
// Learn more https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role
export function Tab({ isActive, tabId, children, ...otherProps }: TabProps) {
  const { isFocusVisible, focusProps: focusRingProps } = useFocusRing();

  const pressableStyles = [
    tw`py-1.5 px-2`,
    isFocusVisible && (Platform.OS === "web" ? tw`se-inset-focus-mini` : tw``),
  ];

  return (
    <Pressable
      {...focusRingProps} // sets onFocus and onBlur
      accessibilityRole="tab"
      // exists in the docs, but not in the types https://necolas.github.io/react-native-web/docs/accessibility/
      accessibilityControls={`${tabId}-panel`}
      accessibilitySelected={isActive}
      nativeID={`${tabId}-tab`}
      style={pressableStyles}
      _focusVisible={{
        // @ts-expect-error - web only
        _web: { style: [pressableStyles, { outlineStyle: "none" }] },
      }}
      {...otherProps}
    >
      <Text variant="xs" bold={isActive}>
        {children}
      </Text>
    </Pressable>
  );
}
