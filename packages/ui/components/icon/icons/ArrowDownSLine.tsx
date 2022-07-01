import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const ArrowDownSLine = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M7.99999 8.78132L11.3 5.48132L12.2427 6.42399L7.99999 10.6667L3.75732 6.42399L4.69999 5.48132L7.99999 8.78132Z"
      />
    </Svg>
  );
};
