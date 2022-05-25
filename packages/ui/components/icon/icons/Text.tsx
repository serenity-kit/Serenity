import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const Text = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M8.66666 3.99999V14H7.33333V3.99999H3.33333V2.66666H12.6667V3.99999H8.66666Z"
      />
    </Svg>
  );
};
