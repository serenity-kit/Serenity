import { AuthenticationError, UserInputError } from "apollo-server-express";
import { idArg, nonNull, queryField } from "nexus";
import { getWorkspaceFolders } from "../../../database/folder/getWorkspaceFolders";
import { formatFolder } from "../../../types/folder";
import { Folder } from "../../types/folder";

export const rootFoldersQuery = queryField((t) => {
  // @ts-ignore sometimes the type is defined, sometimes not
  t.connectionField("rootFolders", {
    type: Folder,
    disableBackwardPagination: true,
    cursorFromNode: (node) => node?.id ?? "",
    additionalArgs: {
      workspaceId: nonNull(idArg()),
    },
    async nodes(root, args, context) {
      if (args.first > 50) {
        throw new UserInputError(
          "Requested too many folders. First value exceeds 50."
        );
      }
      if (args.workspaceId === "") {
        throw new UserInputError(
          "Invalid input: workspaceId cannot be an empty string"
        );
      }
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      const userId = context.user.id;
      const cursor = args.after ? { id: args.after } : undefined;
      // prisma will include the cursor if skip: 1 is not set
      // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#do-i-always-have-to-skip-1
      const skip = cursor ? 1 : undefined;
      // include one extra project to set hasNextPage value
      const take: any = args.first ? args.first + 1 : undefined;
      const workspaceId = args.workspaceId;

      const rawFolders = await getWorkspaceFolders({
        userId,
        workspaceId,
        cursor,
        skip,
        take,
      });
      const folders = rawFolders.map((folder) => formatFolder(folder));
      return folders;
    },
  });
});
