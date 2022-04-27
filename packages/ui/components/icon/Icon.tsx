import React from "react";
import { tw } from "../../tailwind";
import { ArchiveLine } from "./icons/ArchiveLine";
import { AtLine } from "./icons/AtLine";
import { Bold } from "./icons/Bold";
import { Italic } from "./icons/Italic";
import { ListCheck2 } from "./icons/ListCheck2";
import { ListOrdered } from "./icons/ListOrdered";
import { ListUnordered } from "./icons/ListUnordered";
import { PrinterLine } from "./icons/PrinterLine";

export type Props = {
  name:
    | "archive-line"
    | "at-line"
    | "bold"
    | "calendar-check-fill"
    | "italic"
    | "list-check-2"
    | "list-unordered"
    | "list-ordered"
    | "printer-line";
  color?: string;
  size?: number;
};

export const Icon = (props: Props) => {
  const { name } = props;
  const color = props.color ?? (tw.color("gray-900") as string);
  const size = props.size ?? 24;
  if (name === "archive-line") return <ArchiveLine color={color} size={size} />;
  if (name === "at-line") return <AtLine color={color} size={size} />;
  if (name === "bold") return <Bold color={color} size={size} />;
  if (name === "calendar-check-fill") return <Bold color={color} size={size} />;
  if (name === "italic") return <Italic color={color} size={size} />;
  if (name === "list-check-2") return <ListCheck2 color={color} size={size} />;
  if (name === "list-ordered") return <ListOrdered color={color} size={size} />;
  if (name === "list-unordered")
    return <ListUnordered color={color} size={size} />;
  if (name === "printer-line") return <PrinterLine color={color} size={size} />;
  return null;
};
