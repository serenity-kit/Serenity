import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const ArrowUpDownSLine = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M7.9995 11.7813L11.2995 8.48132L12.2422 9.42399L7.9995 13.6667L3.75684 9.42399L4.6995 8.48132L7.9995 11.7813Z"
      />
      <Path
        fill={color}
        d="M7.99952 3.8853L4.69952 7.1853L3.75686 6.24264L7.99952 1.99997L12.2422 6.24264L11.2995 7.1853L7.99952 3.8853Z"
      />
    </Svg>
  );
};
