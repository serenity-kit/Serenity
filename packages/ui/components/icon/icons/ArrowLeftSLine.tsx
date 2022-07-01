import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const ArrowLeftSLine = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 24 24">
      <Path fill="none" d="M0 0h24v24H0z" />
      <Path
        fill={color}
        d="M10.828 12l4.95 4.95-1.414 1.414L8 12l6.364-6.364 1.414 1.414z"
      />
    </Svg>
  );
};
