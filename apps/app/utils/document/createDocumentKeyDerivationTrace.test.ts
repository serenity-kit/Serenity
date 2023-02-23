jest.mock("../../generated/graphql", () => ({ __esModule: true }));
jest.mock("../folder/getFolderTrace", () => ({
  __esModule: true,
  getFolderTrace: jest.fn(),
}));

import { folderDerivedKeyContext } from "@serenity-tools/common";
import { getFolderTrace } from "../folder/getFolderTrace";
import { createDocumentKeyDerivationTrace } from "./createDocumentKeyDerivationTrace";

it("should return one parent folder", async () => {
  // @ts-ignore getFolder is mocked
  getFolderTrace.mockReturnValueOnce([
    {
      __typename: "Folder",
      id: "folderId",
      encryptedName: "encrypted folder name",
      encryptedNameNonce: "encrypted folder nonce",
      workspaceKeyId: "workspaceKeyId",
      subkeyId: 1,
      parentFolderId: null,
      workspaceId: "workspaceId",
      keyDerivationTrace: {
        workspaceKeyId: "workspaceKeyId",
        trace: [
          {
            entryId: "parentFolderId",
            parentId: null,
            context: folderDerivedKeyContext,
            subkeyId: 1,
          },
        ],
      },
    },
  ]);

  const result = await createDocumentKeyDerivationTrace({
    folderId: "folderId",
    subkeyId: 2,
    workspaceKeyId: "workspaceKeyId",
  });
  expect(result).toMatchInlineSnapshot(`
    {
      "parentFolders": [
        {
          "folderId": "folderId",
          "parentFolderId": null,
          "subkeyId": 1,
        },
      ],
      "subkeyId": 2,
      "workspaceKeyId": "workspaceKeyId",
    }
  `);
});

it("should return two parent folders", async () => {
  // @ts-ignore getFolder is mocked
  getFolderTrace.mockImplementation((props) => [
    {
      __typename: "Folder",
      id: "parentFolderId",
      encryptedName: "parent folder name",
      encryptedNameNonce: "parent folder nonce",
      workspaceKeyId: "workspaceKeyId",
      subkeyId: 2,
      parentFolderId: null,
      workspaceId: "workspaceId",
      keyDerivationTrace: {
        workspaceKeyId: "workspaceKeyId",
        trace: [
          {
            entryId: "parentFolderId",
            parentId: null,
            context: folderDerivedKeyContext,
            subkeyId: 2,
          },
        ],
      },
    },
    {
      __typename: "Folder",
      id: "childFolderId",
      encryptedName: "child folder name",
      encryptedNameNonce: "child folder nonce",
      workspaceKeyId: "workspaceKeyId",
      subkeyId: 1,
      parentFolderId: "parentFolderId",
      workspaceId: "workspaceId",
      keyDerivationTrace: {
        workspaceKeyId: "workspaceKeyId",
        trace: [
          {
            entryId: "parentFolderId",
            parentId: null,
            context: folderDerivedKeyContext,
          },
          {
            entryId: "childFolderId",
            parentId: "parentFolderId",
            context: folderDerivedKeyContext,
            subkeyId: 1,
          },
        ],
      },
    },
  ]);

  const result = await createDocumentKeyDerivationTrace({
    folderId: "childFolderId",
    subkeyId: 3,
    workspaceKeyId: "workspaceKeyId",
  });
  expect(result).toMatchInlineSnapshot(`
    {
      "parentFolders": [
        {
          "folderId": "parentFolderId",
          "parentFolderId": null,
          "subkeyId": 2,
        },
        {
          "folderId": "childFolderId",
          "parentFolderId": "parentFolderId",
          "subkeyId": 1,
        },
      ],
      "subkeyId": 3,
      "workspaceKeyId": "workspaceKeyId",
    }
  `);
});
