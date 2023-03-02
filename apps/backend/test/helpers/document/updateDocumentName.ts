import {
  createDocumentKey,
  deriveKeysFromKeyDerivationTrace,
  encryptDocumentTitle,
  LocalDevice,
} from "@serenity-tools/common";
import { gql } from "graphql-request";
import { prisma } from "../../../src/database/prisma";
import { getSnapshot } from "../snapshot/getSnapshot";

type RunUpdateDocumentNameMutationParams = {
  graphql: any;
  id: string;
  nameCiphertext: string;
  nameNonce: string;
  subkeyId: number;
  workspaceKeyId: string;
  authorizationHeader: string;
};
const runUpdateDocumentNameMutation = async ({
  graphql,
  id,
  nameCiphertext,
  nameNonce,
  subkeyId,
  workspaceKeyId,
  authorizationHeader,
}: RunUpdateDocumentNameMutationParams) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation updateDocumentName($input: UpdateDocumentNameInput!) {
      updateDocumentName(input: $input) {
        document {
          nameCiphertext
          nameNonce
          id
          parentFolderId
          workspaceId
          subkeyId
        }
      }
    }
  `;
  return graphql.client.request(
    query,
    {
      input: {
        id,
        nameCiphertext,
        nameNonce,
        workspaceKeyId,
        subkeyId,
      },
    },
    authorizationHeaders
  );
};

type Params = {
  graphql: any;
  id: string;
  name: string;
  activeDevice: LocalDevice;
  workspaceKeyId: string;
  authorizationHeader: string;
};

export const updateDocumentName = async ({
  graphql,
  id,
  name,
  activeDevice,
  workspaceKeyId,
  authorizationHeader,
}: Params) => {
  const document = await prisma.document.findFirst({
    where: { id },
  });
  if (!document) {
    // return the same result as if the document was found but had no snapshot
    return runUpdateDocumentNameMutation({
      graphql,
      id,
      nameCiphertext: "",
      nameNonce: "",
      subkeyId: 123,
      workspaceKeyId,
      authorizationHeader,
    });
  }
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: document.workspaceId!,
    },
    include: {
      workspaceKeys: {
        orderBy: { generation: "desc" },
        take: 1,
        include: {
          workspaceKeyBoxes: {
            where: { deviceSigningPublicKey: activeDevice.signingPublicKey },
            include: { creatorDevice: true },
          },
        },
      },
    },
  });
  if (!workspace) {
    // return the same result as if the document was found but had no workspace
    return runUpdateDocumentNameMutation({
      graphql,
      id,
      nameCiphertext: "",
      nameNonce: "",
      subkeyId: 123,
      workspaceKeyId,
      authorizationHeader,
    });
  }
  const workspaceKeyBox = workspace.workspaceKeys[0].workspaceKeyBoxes[0];

  const snapshotResult = await getSnapshot({
    graphql,
    documentId: id,
    documentShareLinkToken: null,
    authorizationHeader,
  });
  if (!snapshotResult.snapshot) {
    // return the same result as if the document was found but had no snapshot
    return runUpdateDocumentNameMutation({
      graphql,
      id,
      nameCiphertext: "",
      nameNonce: "",
      subkeyId: 123,
      workspaceKeyId,
      authorizationHeader,
    });
  }
  const snapshot = snapshotResult.snapshot;
  const snapshotKeyTrace = deriveKeysFromKeyDerivationTrace({
    keyDerivationTrace: snapshot.keyDerivationTrace,
    activeDevice,
    workspaceKeyBox,
  });
  const snapshotKey =
    snapshotKeyTrace.trace[snapshotKeyTrace.trace.length - 1].key;
  const documentKeyData = createDocumentKey({
    snapshotKey,
  });
  const encryptedDocumentResult = encryptDocumentTitle({
    title: name,
    key: documentKeyData.key,
  });

  return runUpdateDocumentNameMutation({
    graphql,
    id,
    nameCiphertext: encryptedDocumentResult.ciphertext,
    nameNonce: encryptedDocumentResult.publicNonce,
    subkeyId: documentKeyData.subkeyId,
    workspaceKeyId,
    authorizationHeader,
  });
};
