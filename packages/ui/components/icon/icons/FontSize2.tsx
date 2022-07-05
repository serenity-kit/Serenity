import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const FontSize2 = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M6.66668 3.99999V14H5.33334V3.99999H1.33334V2.66666H10.6667V3.99999H6.66668ZM12 9.33332V14H10.6667V9.33332H8.66668V7.99999H14V9.33332H12Z"
      />
    </Svg>
  );
};
