import { gql } from "graphql-request";
import { createIntroductionDocumentSnapshot } from "@serenity-tools/common";
import sodium from "@serenity-tools/libsodium";
import { createWorkspaceKeyAndCipherTextForDevice } from "../device/createWorkspaceKeyAndCipherTextForDevice";

type Params = {
  graphql: any;
  workspaceId: string;
  workspaceName: string;
  deviceSigningPublicKey: string;
  deviceEncryptionPublicKey: string;
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
  const { nonce, ciphertext } = await createWorkspaceKeyAndCipherTextForDevice({
    receiverDeviceEncryptionPublicKey: deviceEncryptionPublicKey,
    creatorDeviceEncryptionPrivateKey: deviceEncryptionPublicKey,
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
            }
          }
        }
        folder {
          id
          name
          parentFolderId
          rootFolderId
          workspaceId
        }
      }
    }
  `;

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
