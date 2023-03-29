import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

export type Props = { color: string; size: string };

export const Chat4LineDot = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Circle cx="13.5" cy="2.5" r="2.5" fill="#435BF8" />
      <Path
        fill={color}
        d="M10 2H1.99998C1.82317 2 1.6536 2.07024 1.52858 2.19526C1.40355 2.32029 1.33331 2.48986 1.33331 2.66667V15L4.30331 12.6667H14C14.1768 12.6667 14.3464 12.5964 14.4714 12.4714C14.5964 12.3464 14.6666 12.1768 14.6666 12V6H13.3333V11.3333H3.84198L2.66665 12.2567V3.33333H10V2Z"
      />
    </Svg>
  );
};
