import { customColors } from "../../../../tailwind.config.js";
import { SLeaves } from "../types";

export type CollaborationColor = SLeaves<typeof customColors.collaboration>;

const collaboratorColorNames = Object.keys(customColors.collaboration);

// this is a very simple and not secure hash function that takes a string and returns a collaboratorColor
export const hashToCollaboratorColor = (value: string): CollaborationColor => {
  let hash = 0;

  // iterator through the entire string
  for (let stringIndex = 0; stringIndex < value.length; stringIndex++) {
    const characterNumber = value.charCodeAt(stringIndex);
    // cacluclate a new value and run modulo with the collaboratorColors length
    hash =
      (hash + characterNumber * stringIndex) % collaboratorColorNames.length;
  }
  return collaboratorColorNames[hash];
};
