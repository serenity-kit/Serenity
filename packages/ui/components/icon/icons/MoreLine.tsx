import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const MoreLine = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M3 7C2.45 7 2 7.45 2 8C2 8.55 2.45 9 3 9C3.55 9 4 8.55 4 8C4 7.45 3.55 7 3 7ZM13 7C12.45 7 12 7.45 12 8C12 8.55 12.45 9 13 9C13.55 9 14 8.55 14 8C14 7.45 13.55 7 13 7ZM8 7C7.45 7 7 7.45 7 8C7 8.55 7.45 9 8 9C8.55 9 9 8.55 9 8C9 7.45 8.55 7 8 7Z"
      />
    </Svg>
  );
};
