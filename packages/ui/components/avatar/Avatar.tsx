import React, { forwardRef } from "react";
import { StyleSheet } from "react-native";
import { Avatar as NbAvatar, IAvatarProps } from "native-base";
import { tw } from "../../tailwind";
import { CollaborationColor } from "../../types";
import { View } from "../view/View";

export type AvatarVariant = "2xl" | "xl" | "lg" | "md" | "sm" | "xs" | "xxs";
export type AvatarStatus = "active" | "inactive" | "default";

export type AvatarProps = IAvatarProps & {
  customColor?: CollaborationColor;
  variant?: AvatarVariant;
  status?: AvatarStatus;
};

export const Avatar = forwardRef((props: AvatarProps, ref) => {
  const {
    variant = "sm",
    customColor = "serenity",
    status = "default",
  } = props;
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
      size={variant}
      style={[styles.avatar, statusStyling[status], props.style]}
      _text={{
        fontFamily: "Inter_600SemiBold",
        style: tw`uppercase`,
      }}
      bg={`collaboration.${customColor}`}
    >
      {status === "active" ? (
        <View
          style={[
            tw`absolute w-${activeIndicatorSize[variant]} h-${activeIndicatorSize[variant]} bg-transparent`,
            tw`rounded-full border-2 border-collaboration-${customColor}`,
            { zIndex: -1 },
          ]}
        />
      ) : null}
      {props.children}
    </NbAvatar>
  );
});
