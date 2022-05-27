import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const ListCheck2 = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M7.33333 2.66666H14V3.99999H7.33333V2.66666ZM7.33333 5.33332H11.3333V6.66666H7.33333V5.33332ZM7.33333 9.33332H14V10.6667H7.33333V9.33332ZM7.33333 12H11.3333V13.3333H7.33333V12ZM2 2.66666H6V6.66666H2V2.66666ZM3.33333 3.99999V5.33332H4.66667V3.99999H3.33333ZM2 9.33332H6V13.3333H2V9.33332ZM3.33333 10.6667V12H4.66667V10.6667H3.33333Z"
      />
    </Svg>
  );
};
