import { SLeaves } from "@serenity-tools/common";
import { colors } from "./tailwind";

export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl";
export type CollaborationColor = SLeaves<typeof colors.collaboration>;
export type Color = SLeaves<typeof colors>;
