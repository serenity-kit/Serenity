import React from "react";
import Svg, { Path, Line, Defs, Stop } from "react-native-svg";

export type Props = { size: number };

export const Page = ({ size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 20 20">
      <Path
        d="M16 17V3C16 2.44772 15.5523 2 15 2H5C4.44772 2 4 2.44772 4 3V17C4 17.5523 4.44772 18 5 18H15C15.5523 18 16 17.5523 16 17Z"
        fill="url(#paint0_linear_333_2185)"
      />
      <Line
        x1="6.76929"
        y1="9.8125"
        x2="13.2308"
        y2="9.8125"
        stroke="#8A8B96"
        stroke-width="1.5"
      />
      <Line
        x1="6.76929"
        y1="13"
        x2="11.3847"
        y2="13"
        stroke="#8A8B96"
        stroke-width="1.5"
      />
      <Defs>
        <linearGradient
          id="paint0_linear_333_2185"
          x1="10"
          y1="2"
          x2="10"
          y2="18"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.786458" stop-color="#E4E5ED" />
          <Stop offset="1" stop-color="#CBCBD3" />
        </linearGradient>
      </Defs>
    </Svg>
  );
};
