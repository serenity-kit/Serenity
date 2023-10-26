import { idArg, nonNull, queryField } from "nexus";
import { getDocumentShareLinkSnapshotKeyBox } from "../../../database/document/getDocumentShareLinkSnapshotKeyBox";
import { SnapshotKeyBox } from "../../types/documentShareLink";

export const documentShareLinkSnapshotKeyBoxQuery = queryField((t) => {
  t.field("documentShareLinkSnapshotKeyBox", {
    type: SnapshotKeyBox,
    args: {
      token: nonNull(idArg()),
      snapshotId: nonNull(idArg()),
    },
    async resolve(root, args, context) {
      // documentShare links can be shared publicly and therefor
      // authentication except for a known token can't be required
      const snapshotKeyBox = await getDocumentShareLinkSnapshotKeyBox({
        token: args.token,
        snapshotId: args.snapshotId,
      });

      return {
        ...snapshotKeyBox,
        deviceSigningPublicKey:
          snapshotKeyBox.documentShareLinkDeviceSigningPublicKey,
      };
    },
  });
});
