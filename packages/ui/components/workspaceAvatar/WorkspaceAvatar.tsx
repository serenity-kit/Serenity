import React from "react";
import { tw } from "../../tailwind";
import { CollaborationColor } from "../../types";
import { Avatar, AvatarProps } from "../avatar/Avatar";
import { Icon } from "../icon/Icon";
import { View } from "../view/View";

export type SizeVariants = "xxs" | "xs" | "sm";

export type WorkspaceAvatarProps = AvatarProps & {
  customColor?: CollaborationColor; // needs custom Name as otherwise types get mixed
  size?: SizeVariants;
};

export const WorkspaceAvatar = React.forwardRef(
  (props: WorkspaceAvatarProps, ref) => {
    const { size = "xs" as SizeVariants, customColor = "serenity" } = props;

    const iconSize = {
      xxs: 4,
      xs: 5,
      sm: 7,
    };

    return (
      <Avatar
        {...props}
        // TODO adjust color for each workspace if no image is set
        bg={tw.color(`collaboration-${customColor}`)}
        style={tw`border-0`} // override for Avatar
        borderRadius={4}
        size={size}
      >
        {/* TODO show conditionally when no image-source is set */}
        <View style={tw`opacity-35`}>
          <Icon
            name="serenity-feather"
            color={"black"}
            size={iconSize[size]}
            mobileSize={iconSize[size]}
          />
        </View>
      </Avatar>
    );
  }
);
