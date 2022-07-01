import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const PageSeparator = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M11.3333 14V11.3333H4.66668V14H3.33334V10.6667C3.33334 10.4899 3.40358 10.3203 3.52861 10.1953C3.65363 10.0702 3.8232 10 4.00001 10H12C12.1768 10 12.3464 10.0702 12.4714 10.1953C12.5964 10.3203 12.6667 10.4899 12.6667 10.6667V14H11.3333ZM4.66668 2V4.66667H11.3333V2H12.6667V5.33333C12.6667 5.51014 12.5964 5.67971 12.4714 5.80474C12.3464 5.92976 12.1768 6 12 6H4.00001C3.8232 6 3.65363 5.92976 3.52861 5.80474C3.40358 5.67971 3.33334 5.51014 3.33334 5.33333V2H4.66668ZM1.33334 6L4.00001 8L1.33334 10V6ZM14.6667 6V10L12 8L14.6667 6Z"
      />
    </Svg>
  );
};
