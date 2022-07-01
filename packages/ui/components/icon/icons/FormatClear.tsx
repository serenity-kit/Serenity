import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const FormatClear = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M8.43398 9.37665L7.73665 13.3333H6.38265L7.28265 8.22599L2.34265 3.28599L3.28665 2.34332L13.6567 12.7133L12.714 13.656L8.43398 9.37599V9.37665ZM7.84865 5.01999L8.02865 3.99999H6.82865L5.49532 2.66666H13.3333V3.99999H9.38198L8.99998 6.17132L7.84865 5.01999Z"
      />
    </Svg>
  );
};
