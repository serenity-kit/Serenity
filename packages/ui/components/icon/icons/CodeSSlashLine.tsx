import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const CodeSSlashLine = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M16 8L12.2287 11.7713L11.286 10.8287L14.1147 8L11.286 5.17133L12.2287 4.22867L16 8ZM1.88533 8L4.714 10.8287L3.77133 11.7713L0 8L3.77133 4.22867L4.71333 5.17133L1.88533 8ZM6.52533 14H5.10667L9.47467 2H10.8933L6.52533 14Z"
      />
    </Svg>
  );
};
