import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const Functions = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 24 24">
      <Path fill="none" d="M0 0h24v24H0z" />
      <Path
        fill={color}
        d="M5 18l7.68-6L5 6V4h14v2H8.263L16 12l-7.737 6H19v2H5v-2z"
      />
    </Svg>
  );
};
