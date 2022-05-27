import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const IndentDecrease = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M2 2.66666H14V3.99999H2V2.66666ZM2 12.6667H14V14H2V12.6667ZM7.33333 9.33332H14V10.6667H7.33333V9.33332ZM7.33333 5.99999H14V7.33332H7.33333V5.99999ZM2 8.33332L4.66667 5.99999V10.6667L2 8.33332Z"
      />
    </Svg>
  );
};
