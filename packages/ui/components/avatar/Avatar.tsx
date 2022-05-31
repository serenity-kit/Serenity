import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { Avatar as NbAvatar, IAvatarProps } from "native-base";
import { tw } from "../../tailwind";

export type AvatarProps = IAvatarProps & {};

export const Avatar = forwardRef((props: AvatarProps, ref) => {
  const { size = "sm" } = props;
  const styles = StyleSheet.create({
    avatar: tw``,
  });

  return (
    <NbAvatar
      {...props}
      size={size}
      style={[styles.avatar, props.style]}
      _text={{
        fontFamily: "Inter_600SemiBold",
      }}
    >
      {props.children}
    </NbAvatar>
  );
});
