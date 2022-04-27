import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const FontSize2 = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 24 24">
      <Path fill="none" d="M0 0h24v24H0z" />
      <Path
        fill={color}
        d="M10 6v15H8V6H2V4h14v2h-6zm8 8v7h-2v-7h-3v-2h8v2h-3z"
      />
    </Svg>
  );
};
