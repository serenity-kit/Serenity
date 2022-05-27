import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const More = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="round"
        d="M7.99998 8.66683C8.36817 8.66683 8.66665 8.36835 8.66665 8.00016C8.66665 7.63197 8.36817 7.3335 7.99998 7.3335C7.63179 7.3335 7.33331 7.63197 7.33331 8.00016C7.33331 8.36835 7.63179 8.66683 7.99998 8.66683Z"
      />
      <Path
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="round"
        d="M12.6667 8.66683C13.0349 8.66683 13.3333 8.36835 13.3333 8.00016C13.3333 7.63197 13.0349 7.3335 12.6667 7.3335C12.2985 7.3335 12 7.63197 12 8.00016C12 8.36835 12.2985 8.66683 12.6667 8.66683Z"
      />
      <Path
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="round"
        d="M3.33335 8.66683C3.70154 8.66683 4.00002 8.36835 4.00002 8.00016C4.00002 7.63197 3.70154 7.3335 3.33335 7.3335C2.96516 7.3335 2.66669 7.63197 2.66669 8.00016C2.66669 8.36835 2.96516 8.66683 3.33335 8.66683Z"
      />
    </Svg>
  );
};
