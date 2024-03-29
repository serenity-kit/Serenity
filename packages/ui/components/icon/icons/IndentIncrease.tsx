import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const IndentIncrease = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M2 2.66666H14V3.99999H2V2.66666ZM2 12.6667H14V14H2V12.6667ZM7.33333 9.33332H14V10.6667H7.33333V9.33332ZM7.33333 5.99999H14V7.33332H7.33333V5.99999ZM4.66667 8.33332L2 10.6667V5.99999L4.66667 8.33332Z"
      />
    </Svg>
  );
};
