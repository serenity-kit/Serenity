import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const H4 = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M8.66668 13.3333H7.33334V8.66666H2.66668V13.3333H1.33334V2.66666H2.66668V7.33332H7.33334V2.66666H8.66668V13.3333ZM14.6667 5.33332V10.6667H15.6667V12H14.6667V13.3333H13.3333V12H9.66668V11.1067L13 5.33332H14.6667ZM13.3333 7.42199L11.46 10.6667H13.3333V7.42199Z"
      />
    </Svg>
  );
};
