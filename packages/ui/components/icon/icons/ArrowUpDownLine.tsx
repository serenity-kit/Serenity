import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const ArrowUpDownLine = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M7.96664 5.3L7.02397 6.24267L5.3333 4.552V13.3333H3.99997V4.552L2.30997 6.24267L1.36664 5.3L4.66664 2L7.96664 5.3ZM14.6333 10.7L11.3333 14L8.0333 10.7L8.97597 9.75733L10.6673 11.448L10.6666 2.66667H12V11.448L13.6906 9.75733L14.6333 10.7Z"
      />
    </Svg>
  );
};
