import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const ArrowRight = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path fill={color} d="M11 8L5 13V3L11 8Z" />
    </Svg>
  );
};
