import { Role } from "../../generated/graphql";

export const getDisplayRole = (role: Role): string | undefined => {
  if (role === Role.Admin) {
    return "Admin";
  } else if (role === Role.Editor) {
    return "Editor";
  } else if (role === Role.Viewer) {
    return "Viewer";
  } else if (role === Role.Commenter) {
    return "Commenter";
  } else {
    console.error(`Unknown role: ${role}`);
    return undefined;
  }
};
