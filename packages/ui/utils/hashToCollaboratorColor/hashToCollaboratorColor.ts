import { colors } from "../../tailwind";
import { CollaborationColor } from "../../types";

const collaboratorColorNames = Object.keys(colors.collaboration);

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
  return collaboratorColorNames[hash] as CollaborationColor;
};
