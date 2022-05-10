import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const Menu = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 20 20">
      <Path
        d="M2.5 10.0972H17.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.5 5.09717H17.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.5 15.0972H17.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
