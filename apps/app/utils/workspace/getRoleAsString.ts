import { Role } from "../../generated/graphql";

export const getRoleAsString = (role: Role): string | undefined => {
  if (role === Role.Admin) {
    return "admin";
  } else if (role === Role.Editor) {
    return "editor";
  } else if (role === Role.Viewer) {
    return "viewer";
  } else if (role === Role.Commenter) {
    return "commenter";
  } else {
    console.error(`Unknown role: ${role}`);
    return undefined;
  }
};
