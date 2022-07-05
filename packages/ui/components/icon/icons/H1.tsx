import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const H1 = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M8.66666 13.3333H7.33333V8.66666H2.66666V13.3333H1.33333V2.66666H2.66666V7.33332H7.33333V2.66666H8.66666V13.3333ZM14 5.33332V13.3333H12.6667V6.80266L11.3333 7.15999V5.77999L13 5.33332H14Z"
      />
    </Svg>
  );
};
