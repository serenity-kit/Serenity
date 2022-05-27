import React from "react";
import Svg, { Path } from "react-native-svg";

export type Props = { color: string; size: number };

export const ArchiveFill = ({ color, size }: Props) => {
  return (
    <Svg height={size} width={size} viewBox="0 0 16 16">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        fill={color}
        d="M1.99998 6.66667H14V13.336C14 13.7027 13.7033 14 13.338 14H2.66198C2.5749 13.9999 2.48869 13.9827 2.40828 13.9492C2.32788 13.9158 2.25484 13.8669 2.19336 13.8052C2.13188 13.7435 2.08316 13.6704 2.04998 13.5898C2.01679 13.5093 1.9998 13.4231 1.99998 13.336V6.66667ZM5.99998 8V9.33333H9.99998V8H5.99998ZM1.33331 2.66667C1.33331 2.29867 1.63665 2 1.99465 2H14.0053C14.3706 2 14.6666 2.296 14.6666 2.66667V5.33333H1.33331V2.66667Z"
      />
    </Svg>
  );
};
