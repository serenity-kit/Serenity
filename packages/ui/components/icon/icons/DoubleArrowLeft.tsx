import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const DoubleArrowLeft = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M9.73735 8.24268L13.0374 11.5427L12.0947 12.4854L7.85202 8.24268L12.0947 4.00002L13.0374 4.94268L9.73735 8.24268Z"
      />
      <Path
        fill={color}
        d="M5.21868 8.24268L8.51868 11.5427L7.57601 12.4854L3.33334 8.24268L7.57601 4.00002L8.51868 4.94268L5.21868 8.24268Z"
      />
    </Svg>
  );
};
