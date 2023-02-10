import { AuthenticationError, UserInputError } from "apollo-server-express";
import { booleanArg, idArg, nonNull, queryField } from "nexus";
import { getSubfolders } from "../../../database/folder/getSubfolders";
import { formatFolder } from "../../../types/folder";
import { Folder } from "../../types/folder";

export const foldersQuery = queryField((t) => {
  // @ts-ignore sometimes the type is defined, sometimes not
  t.connectionField("folders", {
    type: Folder,
    disableBackwardPagination: true,
    cursorFromNode: (node) => node?.id ?? "",
    additionalArgs: {
      parentFolderId: nonNull(idArg()),
      usingOldKeys: booleanArg(),
    },
    async nodes(root, args, context) {
      if (args.first > 50) {
        throw new UserInputError(
          "Requested too many folders. First value exceeds 50."
        );
      }
      if (!args.parentFolderId) {
        throw new UserInputError(
          "Invalid input: parentFolderId cannot be null"
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
      const parentFolderId = args.parentFolderId;
      const usingOldKeys = args.usingOldKeys || false;
      const rawFolders = await getSubfolders({
        userId,
        parentFolderId,
        usingOldKeys,
        cursor,
        skip,
        take,
      });
      const folders = rawFolders.map((folder) => formatFolder(folder));
      return folders;
    },
  });
});
