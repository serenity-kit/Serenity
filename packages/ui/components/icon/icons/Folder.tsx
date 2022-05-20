import React from "react";
import Svg, { LinearGradient, Path, Defs, Stop } from "react-native-svg";

export type Props = { size: number };

export const Folder = ({ size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 20 20">
      <Path
        d="M9.5 4L11.5 6H17C17.5523 6 18 6.44772 18 7V15C18 15.5523 17.5523 16 17 16H4C3.44772 16 3 15.5523 3 15V5C3 4.44772 3.44772 4 4 4H9.5Z"
        fill="url(#paint0_linear_333_2054)"
      />
      <Defs>
        <LinearGradient
          id="paint0_linear_333_2054"
          x1="10.5"
          y1="4"
          x2="10.5"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0.625" stopColor="#91A0FF" />
          <Stop offset="1" stopColor="#7587FF" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};
