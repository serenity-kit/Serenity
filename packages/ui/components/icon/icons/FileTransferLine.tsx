import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const FileTransferLine = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M10 2.66666H3.33333V13.3333H12.6667V5.33333H10V2.66666ZM2 1.99466C2 1.62933 2.298 1.33333 2.666 1.33333H10.6667L14 4.66666V13.9953C14.0006 14.0829 13.984 14.1697 13.951 14.2508C13.9181 14.3319 13.8695 14.4058 13.808 14.4681C13.7466 14.5304 13.6734 14.5801 13.5928 14.6141C13.5121 14.6482 13.4255 14.6661 13.338 14.6667H2.662C2.48692 14.6654 2.31934 14.5954 2.19548 14.4717C2.07161 14.3479 2.0014 14.1804 2 14.0053V1.99466ZM8 7.33333V5.33333L10.6667 8L8 10.6667V8.66666H5.33333V7.33333H8Z"
      />
    </Svg>
  );
};
