import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const Chat4LineMessage = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 24 24">
      <Path fill="none" d="M0 0h24v24H0z" />
      <Path
        fill={color}
        d="M6.455 19L2 22.5V4C2 3.73478 2.10536 3.48043 2.29289 3.29289C2.48043 3.10536 2.73478 3 3 3H21C21.2652 3 21.5196 3.10536 21.7071 3.29289C21.8946 3.48043 22 3.73478 22 4V18C22 18.2652 21.8946 18.5196 21.7071 18.7071C21.5196 18.8946 21.2652 19 21 19H6.455ZM6 17.5H20.5V4.5H3.5V19.5L6 17.5ZM11 10H13V12H11V10ZM7 10H9V12H7V10ZM15 10H17V12H15V10Z"
      />
    </Svg>
  );
};
