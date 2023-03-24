import { tw } from "../../tailwind";
import { CollaborationColor } from "../../types";

export const collaboratorColorToHex = (color: CollaborationColor) => {
  return tw.color(`collaboration-${color}`) ?? "#435BF8"; // "serenity" default color
};
