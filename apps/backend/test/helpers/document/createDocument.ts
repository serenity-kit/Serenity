import {
  createDocumentTitleKey,
  createSnapshotKey,
  deriveKeysFromKeyDerivationTrace,
  encryptDocumentTitleByKey,
  generateId,
  KeyDerivationTrace,
  LocalDevice,
  SerenitySnapshotPublicData,
  snapshotDerivedKeyContext,
} from "@serenity-tools/common";
import {
  createInitialSnapshot,
  Snapshot,
  SnapshotPublicData,
} from "@serenity-tools/secsync";
import { gql } from "graphql-request";
import { KeyPair } from "libsodium-wrappers";
import sodium from "react-native-libsodium";
import { prisma } from "../../../src/database/prisma";
import { createFolderKeyDerivationTrace } from "../folder/createFolderKeyDerivationTrace";

type RunCreateDocumentMutationParams = {
  graphql: any;
  id: string;
  nameCiphertext: string;
  nameNonce: string;
  subkeyId: number;
  parentFolderId: string | null;
  workspaceId: string;
  snapshot?: Snapshot | null | undefined;
  authorizationHeader: string;
};
const runCreateDocumentMutation = async ({
  graphql,
  id,
  nameCiphertext,
  nameNonce,
  subkeyId,
  parentFolderId,
  workspaceId,
  snapshot,
  authorizationHeader,
}: RunCreateDocumentMutationParams) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const query = gql`
    mutation createDocument($input: CreateDocumentInput!) {
      createDocument(input: $input) {
        id
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
        subkeyId,
        parentFolderId,
        workspaceId,
        snapshot,
      },
    },
    authorizationHeaders
  );
};

type Params = {
  graphql: any;
  id: string;
  name?: string | null | undefined;
  parentFolderId: string | null;
  workspaceId: string;
  activeDevice: LocalDevice;
  authorizationHeader: string;
};

export const createDocument = async ({
  graphql,
  id,
  name,
  parentFolderId,
  workspaceId,
  activeDevice,
  authorizationHeader,
}: Params) => {
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
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
    // return the query to produce an error
    return runCreateDocumentMutation({
      graphql,
      id,
      nameCiphertext: "",
      nameNonce: "",
      subkeyId: 1,
      parentFolderId,
      workspaceId,
      snapshot: null,
      authorizationHeader,
    });
  }
  const workspaceKeyBox = workspace.workspaceKeys[0].workspaceKeyBoxes[0];

  const folder = await prisma.folder.findFirst({
    where: {
      id: parentFolderId!,
      workspaceId,
    },
  });
  if (!folder) {
    // return the query to produce an error
    return runCreateDocumentMutation({
      graphql,
      id,
      nameCiphertext: "",
      nameNonce: "",
      subkeyId: 1,
      parentFolderId,
      workspaceId,
      snapshot: null,
      authorizationHeader,
    });
  }
  const folderKeyTrace = deriveKeysFromKeyDerivationTrace({
    keyDerivationTrace: folder.keyDerivationTrace as KeyDerivationTrace,
    activeDevice,
    workspaceKeyBox,
  });
  const folderKey = folderKeyTrace.trace[folderKeyTrace.trace.length - 1].key;
  const snapshotKey = createSnapshotKey({
    folderKey,
  });

  const snapshotKeyDerivationTrace = await createFolderKeyDerivationTrace({
    workspaceKeyId: workspaceKeyBox.workspaceKeyId,
    parentFolderId,
  });
  const snapshotId = generateId();
  snapshotKeyDerivationTrace.trace.push({
    entryId: snapshotId,
    parentId: parentFolderId,
    subkeyId: snapshotKey.subkeyId,
    context: snapshotDerivedKeyContext,
  });

  const signatureKeyPair: KeyPair = {
    publicKey: sodium.from_base64(activeDevice.signingPublicKey),
    privateKey: sodium.from_base64(activeDevice.signingPrivateKey),
    keyType: "ed25519",
  };

  const publicData: SnapshotPublicData & SerenitySnapshotPublicData = {
    snapshotId: generateId(),
    docId: id,
    pubKey: sodium.to_base64(signatureKeyPair.publicKey),
    keyDerivationTrace: snapshotKeyDerivationTrace,
    parentSnapshotId: "",
    parentSnapshotUpdateClocks: {},
  };

  const initialDocument = "";
  const snapshot = createInitialSnapshot(
    sodium.from_base64(initialDocument),
    publicData,
    sodium.from_base64(snapshotKey.key),
    signatureKeyPair,
    sodium
  );

  let useName = "Untitled";
  if (name) {
    useName = name;
  }
  const documentNameKey = createDocumentTitleKey({
    snapshotKey: snapshotKey.key,
  });
  const documentNameData = encryptDocumentTitleByKey({
    title: useName,
    key: documentNameKey.key,
  });

  return runCreateDocumentMutation({
    graphql,
    id,
    nameCiphertext: documentNameData.ciphertext,
    nameNonce: documentNameData.publicNonce,
    subkeyId: documentNameKey.subkeyId,
    parentFolderId,
    workspaceId,
    snapshot,
    authorizationHeader,
  });
};
