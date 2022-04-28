import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const Heading = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 24 24">
      <Path fill="none" d="M0 0h24v24H0z" />
      <Path fill={color} d="M17 11V4h2v17h-2v-8H7v8H5V4h2v7z" />
    </Svg>
  );
};
