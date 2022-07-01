import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const AddLine = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M7.33331 7.33334V3.33334H8.66665V7.33334H12.6666V8.66668H8.66665V12.6667H7.33331V8.66668H3.33331V7.33334H7.33331Z"
      />
    </Svg>
  );
};
