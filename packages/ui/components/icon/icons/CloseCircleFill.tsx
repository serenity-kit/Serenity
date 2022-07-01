import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const CloseCircleFill = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M7.99998 14.6667C4.31798 14.6667 1.33331 11.682 1.33331 8.00001C1.33331 4.31801 4.31798 1.33334 7.99998 1.33334C11.682 1.33334 14.6666 4.31801 14.6666 8.00001C14.6666 11.682 11.682 14.6667 7.99998 14.6667ZM7.99998 7.05734L6.11465 5.17134L5.17131 6.11468L7.05731 8.00001L5.17131 9.88534L6.11465 10.8287L7.99998 8.94268L9.88531 10.8287L10.8286 9.88534L8.94265 8.00001L10.8286 6.11468L9.88531 5.17134L7.99998 7.05734Z"
      />
    </Svg>
  );
};
