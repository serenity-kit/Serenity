import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const Italic = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 24 24">
      <Path fill="none" d="M0 0h24v24H0z" />
      <Path
        fill={color}
        d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15z"
      />
    </Svg>
  );
};
