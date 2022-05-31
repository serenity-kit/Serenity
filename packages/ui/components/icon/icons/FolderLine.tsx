import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const FolderLine = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M2.66665 3.33333V12.6667H13.3333V4.66667H7.72398L6.39065 3.33333H2.66665ZM8.27598 3.33333H14C14.1768 3.33333 14.3464 3.40357 14.4714 3.5286C14.5964 3.65362 14.6666 3.82319 14.6666 4V13.3333C14.6666 13.5101 14.5964 13.6797 14.4714 13.8047C14.3464 13.9298 14.1768 14 14 14H1.99998C1.82317 14 1.6536 13.9298 1.52858 13.8047C1.40355 13.6797 1.33331 13.5101 1.33331 13.3333V2.66667C1.33331 2.48986 1.40355 2.32029 1.52858 2.19526C1.6536 2.07024 1.82317 2 1.99998 2H6.94265L8.27598 3.33333Z"
      />
    </Svg>
  );
};
