import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const Separator = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M1.33334 7.33334H2.66668V8.66668H1.33334V7.33334ZM4.00001 7.33334H12V8.66668H4.00001V7.33334ZM13.3333 7.33334H14.6667V8.66668H13.3333V7.33334Z"
      />
    </Svg>
  );
};
