import React from "react";
import Svg, { Path, Line } from "react-native-svg";

export type Props = { color: string; size: number };

export const Cursor = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Line stroke={color} x1="0.5" y1="2.18557e-08" x2="0.499999" y2="20" />
    </Svg>
  );
};
