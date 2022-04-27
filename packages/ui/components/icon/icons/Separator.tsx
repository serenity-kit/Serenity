import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const Separator = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 24 24">
      <Path fill="none" d="M0 0h24v24H0z" />
      <Path fill={color} d="M2 11h2v2H2v-2zm4 0h12v2H6v-2zm14 0h2v2h-2v-2z" />
    </Svg>
  );
};
