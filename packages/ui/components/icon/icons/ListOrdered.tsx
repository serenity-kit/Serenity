import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const ListOrdered = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M5.33333 2.66667H14V4H5.33333V2.66667ZM3.33333 2V4H4V4.66667H2V4H2.66667V2.66667H2V2H3.33333ZM2 9.33333V7.66667H3.33333V7.33333H2V6.66667H4V8.33333H2.66667V8.66667H4V9.33333H2ZM3.33333 13H2V12.3333H3.33333V12H2V11.3333H4V14H2V13.3333H3.33333V13ZM5.33333 7.33333H14V8.66667H5.33333V7.33333ZM5.33333 12H14V13.3333H5.33333V12Z"
      />
    </Svg>
  );
};
