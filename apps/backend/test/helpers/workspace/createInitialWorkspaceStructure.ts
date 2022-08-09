import {
  createIntroductionDocumentSnapshot,
  encryptFolder,
} from "@serenity-tools/common";
import sodium from "@serenity-tools/libsodium";
import { gql } from "graphql-request";
import { createWorkspaceKeyAndCipherTextForDevice } from "../device/createWorkspaceKeyAndCipherTextForDevice";

type Params = {
  graphql: any;
  workspaceId: string;
  workspaceName: string;
  deviceSigningPublicKey: string;
  deviceEncryptionPublicKey: string;
  deviceEncryptionPrivateKey: string;
  folderId: string;
  folderIdSignature: string;
  folderName: string;
  documentId: string;
  documentName: string;
  authorizationHeader: string;
};

export const createInitialWorkspaceStructure = async ({
  graphql,
  workspaceName,
  workspaceId,
  deviceSigningPublicKey,
  deviceEncryptionPublicKey,
  deviceEncryptionPrivateKey,
  folderId,
  folderIdSignature,
  folderName,
  documentId,
  documentName,
  authorizationHeader,
}: Params) => {
  const authorizationHeaders = {
    authorization: authorizationHeader,
  };
  const { nonce, ciphertext, workspaceKey } =
    await createWorkspaceKeyAndCipherTextForDevice({
      receiverDeviceEncryptionPublicKey: deviceEncryptionPublicKey,
      creatorDeviceEncryptionPrivateKey: deviceEncryptionPrivateKey,
    });
  const query = gql`
    mutation createInitialWorkspaceStructure(
      $input: CreateInitialWorkspaceStructureInput!
    ) {
      createInitialWorkspaceStructure(input: $input) {
        workspace {
          id
          name
          members {
            userId
            isAdmin
          }
          currentWorkspaceKey {
            id
            workspaceId
            generation
            workspaceKeyBox {
              id
              workspaceKeyId
              deviceSigningPublicKey
              ciphertext
              nonce
            }
          }
        }
        folder {
          id
          name
          encryptedName
          nameNonce
          subKeyId
          parentFolderId
          rootFolderId
          workspaceId
        }
      }
    }
  `;

  const encryptedFolderResult = await encryptFolder({
    name: folderName,
    parentKey: workspaceKey,
  });
  const encryptedFolderName = encryptedFolderResult.ciphertext;
  const folderNameNonce = encryptedFolderResult.publicNonce;
  const folderSubkeyId = encryptedFolderResult.folderSubkeyId;

  // currently hard-coded until we enable e2e encryption per workspace
  const documentEncryptionKey = sodium.from_base64(
    "cksJKBDshtfjXJ0GdwKzHvkLxDp7WYYmdJkU1qPgM-0"
  );
  const documentSnapshot = await createIntroductionDocumentSnapshot({
    documentId,
    documentEncryptionKey,
  });

  const result = await graphql.client.request(
    query,
    {
      input: {
        workspaceName,
        workspaceId,
        folderId,
        folderIdSignature,
        folderName,
        encryptedFolderName,
        folderNameNonce,
        folderSubkeyId,
        documentId,
        documentName,
        documentSnapshot,
        deviceWorkspaceKeyBoxes: [
          {
            deviceSigningPublicKey,
            creatorDeviceSigningPublicKey: deviceSigningPublicKey,
            nonce,
            ciphertext,
          },
        ],
      },
    },
    authorizationHeaders
  );
  return result;
};
