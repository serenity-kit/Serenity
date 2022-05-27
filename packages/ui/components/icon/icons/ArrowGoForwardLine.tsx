import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const ArrowGoForwardLine = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M12.1147 4.66668H7.33333C6.27247 4.66668 5.25505 5.08811 4.50491 5.83825C3.75476 6.5884 3.33333 7.60581 3.33333 8.66668C3.33333 9.72754 3.75476 10.745 4.50491 11.4951C5.25505 12.2453 6.27247 12.6667 7.33333 12.6667H13.3333V14H7.33333C5.91885 14 4.56229 13.4381 3.5621 12.4379C2.5619 11.4377 2 10.0812 2 8.66668C2 7.25219 2.5619 5.89564 3.5621 4.89544C4.56229 3.89525 5.91885 3.33335 7.33333 3.33335H12.1147L10.424 1.64268L11.3667 0.700012L14.6667 4.00001L11.3667 7.30001L10.424 6.35735L12.1147 4.66668Z"
      />
    </Svg>
  );
};
