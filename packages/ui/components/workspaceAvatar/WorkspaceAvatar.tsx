import React from "react";
import { tw } from "../../tailwind";
import { Icon } from "../icon/Icon";
import { Avatar, AvatarProps } from "../avatar/Avatar";
import { CollaborationColor } from "../../types";

export type WorkspaceAvatarProps = AvatarProps & {
  customColor?: CollaborationColor; // needs custom Name as otherwise types get mixed
};

export const WorkspaceAvatar = React.forwardRef(
  (props: WorkspaceAvatarProps, ref) => {
    const { size = "xs", customColor = "serenity" } = props;

    return (
      <Avatar
        {...props}
        size={size}
        // TODO adjust color for each workspace if no image is set
        bg={tw.color(`collaboration-${customColor}`)}
        borderRadius={4}
      >
        {/* TODO show conditionally when no image-source is set */}
        <Icon
          name="serenity-feather"
          color={tw.color("black/35")}
          size={5}
          mobileSize={5}
        />
      </Avatar>
    );
  }
);
