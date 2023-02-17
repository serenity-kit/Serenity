jest.mock("../../generated/graphql", () => ({ __esModule: true }));
jest.mock("./getFolderTrace", () => ({
  __esModule: true,
  getFolderTrace: jest.fn(),
}));

import { folderDerivedKeyContext } from "@serenity-tools/common";
import { createFolderKeyDerivationTrace } from "./createFolderKeyDerivationTrace";
import { getFolderTrace } from "./getFolderTrace";

it("should return empty parentFolders", async () => {
  const result = await createFolderKeyDerivationTrace({
    folderId: null,
    workspaceKeyId: "workspaceId",
  });
  expect(result).toMatchInlineSnapshot(`
    {
      "trace": [],
      "workspaceKeyId": "workspaceId",
    }
  `);
});

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
        parentFolders: [],
      },
    },
  ]);

  const result = await createFolderKeyDerivationTrace({
    folderId: "folderId",
    workspaceKeyId: "workspaceKeyId",
  });
  expect(result).toMatchInlineSnapshot(`
    {
      "trace": [
        {
          "context": "${folderDerivedKeyContext}",
          "entryId": "folderId",
          "parentId": null,
          "subkeyId": undefined,
        },
      ],
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
        parentFolders: [],
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
        parentFolders: [],
      },
    },
  ]);

  const result = await createFolderKeyDerivationTrace({
    folderId: "childFolderId",
    workspaceKeyId: "workspaceId",
  });
  expect(result).toMatchInlineSnapshot(`
    {
      "trace": [
        {
          "context": "${folderDerivedKeyContext}",
          "entryId": "parentFolderId",
          "parentId": null,
          "subkeyId": undefined,
        },
        {
          "context": "${folderDerivedKeyContext}",
          "entryId": "childFolderId",
          "parentId": "parentFolderId",
          "subkeyId": undefined,
        },
      ],
      "workspaceKeyId": "workspaceId",
    }
  `);
});
