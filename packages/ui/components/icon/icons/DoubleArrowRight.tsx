import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const DoubleArrowRight = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M6.63331 8.24267L3.33331 4.94267L4.27598 4L8.51865 8.24267L4.27598 12.4853L3.33331 11.5427L6.63331 8.24267Z"
      />
      <Path
        fill={color}
        d="M11.152 8.24267L7.85199 4.94267L8.79466 4L13.0373 8.24267L8.79466 12.4853L7.85199 11.5427L11.152 8.24267Z"
      />
    </Svg>
  );
};
