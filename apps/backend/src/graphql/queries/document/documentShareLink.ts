import { idArg, nonNull, queryField } from "nexus";
import { getDocumentShareLink } from "../../../database/document/getDocumentShareLink";
import { DocumentShareLinkForSharePage } from "../../types/documentShareLink";

export const documentShareLinkQuery = queryField((t) => {
  t.field("documentShareLink", {
    type: DocumentShareLinkForSharePage,
    args: {
      token: nonNull(idArg()),
    },
    async resolve(root, args, context) {
      // documentShare links can be shared publicly and therefor
      // authentication except for a known token can't be required
      const documentShareLink = await getDocumentShareLink({
        token: args.token,
      });
      return {
        ...documentShareLink,
        snapshotKeyBoxs: documentShareLink.snapshotKeyBoxes.map(
          (snapshotKeyBox) => {
            return {
              ...snapshotKeyBox,
              creatorDevice: snapshotKeyBox.creatorDevice,
            };
          }
        ),
      };
    },
  });
});
