import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const Underline = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M5.33332 2V8C5.33332 8.70724 5.61427 9.38552 6.11437 9.88562C6.61447 10.3857 7.29275 10.6667 7.99999 10.6667C8.70723 10.6667 9.38551 10.3857 9.88561 9.88562C10.3857 9.38552 10.6667 8.70724 10.6667 8V2H12V8C12 9.06087 11.5786 10.0783 10.8284 10.8284C10.0783 11.5786 9.06086 12 7.99999 12C6.93912 12 5.92171 11.5786 5.17156 10.8284C4.42142 10.0783 3.99999 9.06087 3.99999 8V2H5.33332ZM2.66666 13.3333H13.3333V14.6667H2.66666V13.3333Z"
      />
    </Svg>
  );
};
