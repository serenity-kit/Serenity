import React from "react";
import { tw } from "../../tailwind";
import { Bold } from "./icons/Bold";
import { ListCheck2 } from "./icons/ListCheck2";
import { ListUnordered } from "./icons/ListUnordered";

export type Props = {
  name: "bold" | "list-check-2" | "list-unordered";
  color?: string;
  size?: number;
};

export const Icon = (props: Props) => {
  const { name } = props;
  const color = props.color ?? (tw.color("gray-900") as string);
  const size = props.size ?? 24;
  if (name === "bold") return <Bold color={color} size={size} />;
  if (name === "list-check-2") return <ListCheck2 color={color} size={size} />;
  if (name === "list-unordered")
    return <ListUnordered color={color} size={size} />;
  return null;
};
