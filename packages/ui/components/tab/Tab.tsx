import React from "react";
import { Pressable, PressableProps } from "../pressable/Pressable";
import { Text } from "../text/Text";

export type TabProps = PressableProps & { tabId: string; isActive: boolean };

// Currently each Tab is focusable. The proper way would be to implement
// navigation via arrow keys, but that also would require more research
// and testing to not negatively affect the accessibility for mobile.
// The current version seemed like an ok compromise for now.
// Learn more https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role
export function Tab({ isActive, tabId, children, ...otherProps }: TabProps) {
  return (
    <Pressable
      accessibilityRole="tab"
      // @ts-expect-error exists in the docs, but not in the types https://necolas.github.io/react-native-web/docs/accessibility/
      accessibilityControls={`${tabId}-panel`}
      accessibilitySelected={isActive}
      nativeID={`${tabId}-tab`}
      {...otherProps}
    >
      <Text variant="xs" bold={isActive}>
        {children}
      </Text>
    </Pressable>
  );
}
