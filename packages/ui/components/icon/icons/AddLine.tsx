import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const AddLine = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 24 24">
      <Path fill="none" d="M0 0h24v24H0z" />
      <Path fill={color} d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
    </Svg>
  );
};
