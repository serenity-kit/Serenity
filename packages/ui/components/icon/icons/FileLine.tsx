import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const FileLine = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M14 5.33333V13.9953C14.0006 14.0829 13.984 14.1697 13.951 14.2508C13.9181 14.3319 13.8695 14.4058 13.808 14.4681C13.7466 14.5304 13.6734 14.5801 13.5928 14.6141C13.5121 14.6482 13.4255 14.6661 13.338 14.6667H2.662C2.48654 14.6667 2.31826 14.597 2.19413 14.473C2.07 14.349 2.00018 14.1808 2 14.0053V1.99466C2 1.63666 2.29933 1.33333 2.668 1.33333H9.998L14 5.33333ZM12.6667 6H9.33333V2.66666H3.33333V13.3333H12.6667V6Z"
      />
    </Svg>
  );
};
