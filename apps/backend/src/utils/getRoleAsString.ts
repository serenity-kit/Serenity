import { Role } from "../../prisma/generated/output";

export const getRoleAsString = (role: string): string | undefined => {
  if (role === Role.ADMIN) {
    return "admin";
  } else if (role === Role.EDITOR) {
    return "editor";
  } else if (role === Role.VIEWER) {
    return "viewer";
  } else if (role === Role.COMMENTER) {
    return "commenter";
  } else {
    return undefined;
  }
};
