import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const Chat4Line = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M3.84198 11.3333H13.3333V3.33333H2.66665V12.2567L3.84198 11.3333ZM4.30331 12.6667L1.33331 15V2.66667C1.33331 2.48986 1.40355 2.32029 1.52858 2.19526C1.6536 2.07024 1.82317 2 1.99998 2H14C14.1768 2 14.3464 2.07024 14.4714 2.19526C14.5964 2.32029 14.6666 2.48986 14.6666 2.66667V12C14.6666 12.1768 14.5964 12.3464 14.4714 12.4714C14.3464 12.5964 14.1768 12.6667 14 12.6667H4.30331Z"
      />
    </Svg>
  );
};
