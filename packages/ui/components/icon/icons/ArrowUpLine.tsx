import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const ArrowUpLine = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        stroke={color}
        strokeWidth={0.5}
        d="M8.66667 5.21875V13.3334H7.33333V5.21875L3.75733 8.79475L2.81467 7.85208L8 2.66675L13.1853 7.85208L12.2427 8.79475L8.66667 5.21875Z"
      />
    </Svg>
  );
};
