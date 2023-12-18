import { IAvatarProps, Avatar as NbAvatar } from "native-base";
import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { CollaborationColor } from "../../types";

export type AvatarSize = "2xl" | "xl" | "lg" | "md" | "sm" | "xs" | "xxs";
export type AvatarStatus = "active" | "inactive";

type CustomAvatarProps = {
  color?: CollaborationColor;
  size?: AvatarSize;
  status?: AvatarStatus;
  muted?: boolean;
};

export type AvatarProps = IAvatarProps & CustomAvatarProps;

export const Avatar = forwardRef((props: AvatarProps, ref) => {
  const {
    size = "sm",
    color = "serenity",
    status = "active",
  }: CustomAvatarProps = props;
  const styles = StyleSheet.create({
    avatar: tw``,
  });

  const borderWidth = {
    "2xl": 4,
    xl: 4,
    lg: 3,
    md: 3,
    sm: 2,
    xs: 2,
    xxs: 0,
  };

  const fontSize = {
    "2xl": 64,
    xl: 48,
    lg: 32,
    md: 24,
    sm: 14,
    xs: 10,
    xxs: 8,
  };

  const statusStyling = {
    active: tw`border-${borderWidth[size]} border-solid border-white/60`,
    inactive: tw`opacity-40`,
  };

  return (
    <NbAvatar
      {...props}
      size={size}
      style={[styles.avatar, statusStyling[status], props.style]}
      _text={{
        fontFamily: "Inter_600SemiBold",
        fontSize: fontSize[size],
        style: tw`uppercase`,
      }}
      bg={props.muted ? "gray.400" : `collaboration.${color}`}
    >
      {props.children}
    </NbAvatar>
  );
});
