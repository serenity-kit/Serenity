import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { Avatar as NbAvatar } from "native-base";
// explicit path needed as it is not reexported in native-base directly
import { IAvatarGroupProps } from "native-base/lib/typescript/components/composites/Avatar/types.d";
import { tw } from "../../tailwind";
import { View } from "../view/View";

export type AvatarGroupProps = IAvatarGroupProps & {};

export const AvatarGroup = forwardRef((props: AvatarGroupProps, ref) => {
  const { max = 3 } = props;
  const styles = StyleSheet.create({
    wrapper: {
      flex: 1,
      flexDirection: "row", // needed so reversed Avatars in Group are positioned correctly in their container
    },
    avatarGroup: tw``,
  });

  return (
    <View style={[styles.wrapper, tw`bg-transparent`]}>
      <NbAvatar.Group
        {...props}
        max={max}
        style={[styles.avatarGroup, props.style]}
        _avatar={{
          borderColor: "white",
        }}
        _hiddenAvatarPlaceholder={{
          style: tw`-ml-1 bg-transparent border-transparent`, // nb-overrides
          _text: {
            color: "gray.800", // nb-override
            letterSpacing: "xs", // nb-override so written whitespace "+ <plusAvatars>" isn't too big
          },
        }}
      >
        {props.children}
      </NbAvatar.Group>
    </View>
  );
});
