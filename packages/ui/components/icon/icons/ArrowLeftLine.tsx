import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const ArrowLeftLine = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 24 24">
      <Path fill="none" d="M0 0h24v24H0z" />
      <Path
        fill={color}
        d="M7.828 11H20v2H7.828l5.364 5.364-1.414 1.414L4 12l7.778-7.778 1.414 1.414z"
      />
    </Svg>
  );
};
