import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const Italic = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M10 13.3333H4.66667V12H6.61801L8.02867 3.99999H6.00001V2.66666H11.3333V3.99999H9.382L7.97134 12H10V13.3333Z"
      />
    </Svg>
  );
};
