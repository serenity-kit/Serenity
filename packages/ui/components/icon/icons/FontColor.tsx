import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const FontColor = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M10.164 9.33333H5.836L4.76933 12H3.33333L7.33333 2H8.66667L12.6667 12H11.2307L10.164 9.33333ZM9.63067 8L8 3.92333L6.36933 8H9.63067ZM2 13.3333H14V14.6667H2V13.3333Z"
      />
    </Svg>
  );
};
