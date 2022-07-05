import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const FileAddFill = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M10.6667 1.33334L14 4.66667V14.0053C13.9998 14.1808 13.93 14.349 13.8059 14.473C13.6817 14.597 13.5135 14.6667 13.338 14.6667H2.662C2.48692 14.6654 2.31934 14.5954 2.19548 14.4717C2.07161 14.3479 2.0014 14.1804 2 14.0053V1.99467C2 1.62934 2.29667 1.33334 2.662 1.33334H10.6667ZM7.33333 7.33334H5.33333V8.66667H7.33333V10.6667H8.66667V8.66667H10.6667V7.33334H8.66667V5.33334H7.33333V7.33334Z"
      />
    </Svg>
  );
};
