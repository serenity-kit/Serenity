import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const ListCheck = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M5.33333 2.66668H14V4.00001H5.33333V2.66668ZM2 2.33334H4V4.33334H2V2.33334ZM2 7.00001H4V9.00001H2V7.00001ZM2 11.6667H4V13.6667H2V11.6667ZM5.33333 7.33334H14V8.66668H5.33333V7.33334ZM5.33333 12H14V13.3333H5.33333V12Z"
      />
    </Svg>
  );
};
