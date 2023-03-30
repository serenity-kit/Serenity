import React, { forwardRef } from "react";
import { HStack, IStackProps } from "native-base";
import { tw } from "../../tailwind";
import { View } from "../view/View";
import { Icon, IconNames } from "../icon/Icon";
import { Text } from "../text/Text";

export type EmptyMessageProps = IStackProps & {
  iconName?: IconNames;
};

export const EmptyMessage = forwardRef((props: EmptyMessageProps, ref) => {
  const { iconName = "information-line" } = props;

  return (
    <HStack space={3} style={tw`p-4`} {...props}>
      <View style={tw``}>
        <Icon name={iconName} color={"gray-500"} size={5} />
      </View>
      <Text variant="xs" muted>
        {props.children}
      </Text>
    </HStack>
  );
});
