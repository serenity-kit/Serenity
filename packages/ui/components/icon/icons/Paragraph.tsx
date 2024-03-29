import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const Paragraph = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M7.99999 3.99999V14H6.66666V10.6667C5.60579 10.6667 4.58838 10.2452 3.83823 9.49508C3.08808 8.74494 2.66666 7.72752 2.66666 6.66666C2.66666 5.60579 3.08808 4.58837 3.83823 3.83823C4.58838 3.08808 5.60579 2.66666 6.66666 2.66666H13.3333V3.99999H11.3333V14H9.99999V3.99999H7.99999ZM6.66666 3.99999C5.95941 3.99999 5.28114 4.28094 4.78104 4.78104C4.28094 5.28114 3.99999 5.95941 3.99999 6.66666C3.99999 7.3739 4.28094 8.05218 4.78104 8.55227C5.28114 9.05237 5.95941 9.33332 6.66666 9.33332V3.99999Z"
      />
    </Svg>
  );
};
