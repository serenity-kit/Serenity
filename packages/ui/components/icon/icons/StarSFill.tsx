import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const StarSFill = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M7.73336 3.20001L9.38136 6.53868L13.0667 7.07735L10.4 9.67468L11.0294 13.344L7.73336 11.6107L4.43736 13.344L5.06669 9.67468L2.40002 7.07735L6.08536 6.53868L7.73336 3.20001Z"
      />
    </Svg>
  );
};
