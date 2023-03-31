import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const TOCLine = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 24 24">
      <Path fill="none" d="M0 0h24v24H0z" />
      <Path
        fill={color}
        fillRule={"evenodd"}
        clipRule={"evenodd"}
        d="M5 22H19C19.7956 22 20.5587 21.6839 21.1213 21.1213C21.6839 20.5587 22 19.7956 22 19V15H18V3C18 2.73478 17.8946 2.48043 17.7071 2.29289C17.5196 2.10536 17.2652 2 17 2H3C2.73478 2 2.48043 2.10536 2.29289 2.29289C2.10536 2.48043 2 2.73478 2 3V19C2 19.7956 2.31607 20.5587 2.87868 21.1213C3.44129 21.6839 4.20435 22 5 22ZM16.5 3.5V20.5H5C4.73478 20.5 4.24633 20.4019 3.91549 20.0833C3.56928 19.75 3.5 19.2652 3.5 19V3.5H16.5ZM14.5 6.5H8.5V8H14.5V6.5ZM7 6.5H5.5V8H7V6.5ZM18 16.5V19C18 20 18.8118 20.3848 19.3118 20.3848C19.8118 20.3848 20.5 20 20.5 19V16.5H18Z"
      />
      <Path fill={color} d="M11.5 10H8.5V11.5H11.5V10Z" />
      <Path fill={color} d="M7 10H5.5V11.5H7V10Z" />
    </Svg>
  );
};
