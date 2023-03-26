import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const Chat4Fill = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 12 12">
      <Path fill="none" d="M0 0h12v12H0z" />
      <Path
        fill={color}
        d="M3.2275 9.5L1 11.25V2C1 1.86739 1.05268 1.74021 1.14645 1.64645C1.24021 1.55268 1.36739 1.5 1.5 1.5H10.5C10.6326 1.5 10.7598 1.55268 10.8536 1.64645C10.9473 1.74021 11 1.86739 11 2V9C11 9.13261 10.9473 9.25979 10.8536 9.35355C10.7598 9.44732 10.6326 9.5 10.5 9.5H3.2275Z"
      />
    </Svg>
  );
};
