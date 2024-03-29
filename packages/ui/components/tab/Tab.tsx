import { useFocusRing } from "@react-native-aria/focus";
import React from "react";
import { Platform } from "react-native";
import { tw } from "../../tailwind";
import { Pressable, PressableProps } from "../pressable/Pressable";
import { Text } from "../text/Text";

export type TabProps = PressableProps & {
  tabId: string;
  isActive: boolean;
  disabled: boolean;
};

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
      role="tab"
      // exists in the docs, but not in the types https://necolas.github.io/react-native-web/docs/accessibility/
      aria-controls={`${tabId}-panel`}
      aria-selected={isActive}
      id={`${tabId}-tab`}
      style={[
        pressableStyles,
        // @ts-expect-error - native base style mismatch
        { cursor: otherProps.disabled ? "default" : "pointer" },
      ]}
      _focusVisible={{
        // @ts-expect-error - web only
        _web: { style: [pressableStyles, { outlineStyle: "none" }] },
      }}
      {...otherProps}
    >
      <Text variant="xs" bold={isActive} muted={otherProps.disabled}>
        {children}
      </Text>
    </Pressable>
  );
}
