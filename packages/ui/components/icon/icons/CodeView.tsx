import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const CodeView = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M11.3 5.64266L12.2427 4.7L15.5427 8L12.2427 11.3L11.3 10.3573L13.6567 8L11.3 5.64266ZM4.7 5.64266L2.34334 8L4.7 10.3573L3.75734 11.3L0.457336 8L3.75734 4.7L4.7 5.64266Z"
      />
    </Svg>
  );
};
