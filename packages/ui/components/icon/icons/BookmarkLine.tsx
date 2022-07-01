import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: string };

export const BookmarkLine = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M3.33335 1.33333H12.6667C12.8435 1.33333 13.0131 1.40357 13.1381 1.52859C13.2631 1.65361 13.3334 1.82318 13.3334 1.99999V14.762C13.3334 14.8216 13.3175 14.8801 13.2873 14.9315C13.2571 14.9829 13.2136 15.0252 13.1614 15.0541C13.1093 15.0829 13.0504 15.0973 12.9908 15.0956C12.9312 15.094 12.8732 15.0764 12.8227 15.0447L8.00002 12.02L3.17735 15.044C3.12693 15.0757 3.06895 15.0933 3.00942 15.0949C2.9499 15.0966 2.89101 15.0823 2.83888 15.0535C2.78676 15.0248 2.74329 14.9825 2.71301 14.9313C2.68273 14.88 2.66673 14.8215 2.66669 14.762V1.99999C2.66669 1.82318 2.73693 1.65361 2.86195 1.52859C2.98697 1.40357 3.15654 1.33333 3.33335 1.33333ZM12 2.66666H4.00002V12.9547L8.00002 10.4473L12 12.9547V2.66666Z"
      />
    </Svg>
  );
};
