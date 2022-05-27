import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const Heading = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M11.3333 7.33332V2.66666H12.6667V14H11.3333V8.66666H4.66668V14H3.33334V2.66666H4.66668V7.33332H11.3333Z"
      />
    </Svg>
  );
};
