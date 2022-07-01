import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const Functions = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M3.33334 12L8.45334 7.99999L3.33334 3.99999V2.66666H12.6667V3.99999H5.50868L10.6667 7.99999L5.50868 12H12.6667V13.3333H3.33334V12Z"
      />
    </Svg>
  );
};
