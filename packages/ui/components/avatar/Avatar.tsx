import { Avatar as NbAvatar, IAvatarProps } from "native-base";
import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { tw } from "../../tailwind";
import { CollaborationColor } from "../../types";
import { View } from "../view/View";

export type AvatarSize = "2xl" | "xl" | "lg" | "md" | "sm" | "xs" | "xxs";
export type AvatarStatus = "active" | "inactive" | "default";

type CustomAvatarProps = {
  color?: CollaborationColor;
  size?: AvatarSize;
  status?: AvatarStatus;
};

export type AvatarProps = IAvatarProps & CustomAvatarProps;

export const Avatar = forwardRef((props: AvatarProps, ref) => {
  const {
    size = "sm",
    color = "serenity",
    status = "default",
  }: CustomAvatarProps = props;
  const styles = StyleSheet.create({
    avatar: tw``,
  });

  const statusStyling = {
    active: tw`border-2 border-white`,
    inactive: tw`opacity-50`,
    default: tw``,
  };

  const activeIndicatorSize = {
    "2xl": 33,
    xl: 25,
    lg: 17,
    md: 13,
    sm: 9,
    xs: 7,
    xxs: 6,
  };

  return (
    <NbAvatar
      {...props}
      size={size}
      style={[styles.avatar, statusStyling[status], props.style]}
      _text={{
        fontFamily: "Inter_600SemiBold",
        style: tw`uppercase`,
      }}
      bg={`collaboration.${color}`}
    >
      {status === "active" ? (
        <View
          style={[
            tw`absolute w-${activeIndicatorSize[size]} h-${activeIndicatorSize[size]} bg-transparent`,
            tw`rounded-full border-2 border-collaboration-${color}`,
            { zIndex: -1 },
          ]}
        />
      ) : null}
      {props.children}
    </NbAvatar>
  );
});
