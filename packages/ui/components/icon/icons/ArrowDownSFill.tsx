import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const ArrowDownSFill = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path fill={color} d="M8 10.6667L4 6.66666H12L8 10.6667Z" />
    </Svg>
  );
};
