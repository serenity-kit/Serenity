import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const Hashtag = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M5.18934 9.33333L5.46934 6.66667H2.66667V5.33333H5.61001L5.96 2H7.30067L6.95067 5.33333H9.61001L9.96 2H11.3007L10.9507 5.33333H13.3333V6.66667H10.8107L10.5307 9.33333H13.3333V10.6667H10.39L10.04 14H8.69934L9.04934 10.6667H6.39001L6.04001 14H4.69934L5.04934 10.6667H2.66667V9.33333H5.18934ZM6.53001 9.33333H9.19001L9.47001 6.66667H6.81001L6.53001 9.33333Z"
      />
    </Svg>
  );
};
