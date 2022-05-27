import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const DownloadLine = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M2 12.6667H14V14H2V12.6667ZM8.66667 8.78134L12.714 4.73334L13.6567 5.67601L8 11.3333L2.34333 5.67668L3.286 4.73334L7.33333 8.78001V1.33334H8.66667V8.78134Z"
      />
    </Svg>
  );
};
