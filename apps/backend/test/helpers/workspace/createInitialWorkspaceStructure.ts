import { gql } from "graphql-request";
import { createIntroductionDocumentSnapshot } from "@serenity-tools/common";
import sodium from "@serenity-tools/libsodium";

type Params = {
  graphql: any;
  workspaceId: string;
  workspaceName: string;
  deviceSigningPublicKey: string;
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
        deviceSigningPublicKey,
        deviceAeadCiphertext,
        folderId,
        folderIdSignature,
        folderName,
        documentId,
        documentName,
        documentSnapshot,
      },
    },
    authorizationHeaders
  );
  return result;
};
