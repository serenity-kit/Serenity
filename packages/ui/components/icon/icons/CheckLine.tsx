import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const CheckLine = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M6.66668 10.1147L12.7947 3.98599L13.738 4.92866L6.66668 12L2.42401 7.75733L3.36668 6.81466L6.66668 10.1147Z"
      />
    </Svg>
  );
};
