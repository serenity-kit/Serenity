import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const BookOpenLine = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M8.66665 14V15.3333H7.33331V14H1.99998C1.82317 14 1.6536 13.9298 1.52858 13.8047C1.40355 13.6797 1.33331 13.5101 1.33331 13.3333V2.66667C1.33331 2.48986 1.40355 2.32029 1.52858 2.19526C1.6536 2.07024 1.82317 2 1.99998 2H5.99998C6.37837 1.99955 6.7525 2.07984 7.09739 2.2355C7.44228 2.39116 7.75 2.61861 7.99998 2.90267C8.24996 2.61861 8.55768 2.39116 8.90257 2.2355C9.24746 2.07984 9.62159 1.99955 9.99998 2H14C14.1768 2 14.3464 2.07024 14.4714 2.19526C14.5964 2.32029 14.6666 2.48986 14.6666 2.66667V13.3333C14.6666 13.5101 14.5964 13.6797 14.4714 13.8047C14.3464 13.9298 14.1768 14 14 14H8.66665ZM13.3333 12.6667V3.33334H9.99998C9.64636 3.33334 9.30722 3.47381 9.05717 3.72386C8.80712 3.97391 8.66665 4.31305 8.66665 4.66667V12.6667H13.3333ZM7.33331 12.6667V4.66667C7.33331 4.31305 7.19284 3.97391 6.94279 3.72386C6.69274 3.47381 6.3536 3.33334 5.99998 3.33334H2.66665V12.6667H7.33331Z"
      />
    </Svg>
  );
};
