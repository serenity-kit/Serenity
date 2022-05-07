import { idArg, nonNull, queryField } from "nexus";
import { getDocumentPreviews } from "../../database/getDocumentPreviews";
import { DocumentPreview } from "../types/documentPreview";

export const documentPreviews = queryField((t) => {
  // @ts-ignore sometimes the type is defined, sometimes not
  t.connectionField("documentPreviews", {
    type: DocumentPreview,
    disableBackwardPagination: true,
    cursorFromNode: (node) => node?.id ?? "",
    additionalArgs: {
      workspaceId: nonNull(idArg()),
    },
    async nodes(root, args, ctx, info) {
      const cursor = args.after ? { id: args.after } : undefined;
      // prisma will include the cursor if skip: 1 is not set
      // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#do-i-always-have-to-skip-1
      const skip = cursor ? 1 : undefined;
      // include one extra project to set hasNextPage value
      const take = args.first ? args.first + 1 : undefined;

      console.log("ARGS", args);

      const documentPreviews = await getDocumentPreviews({
        workspaceId: args.workspaceId,
        cursor,
        skip,
        take,
      });
      return documentPreviews;
    },
  });
});
