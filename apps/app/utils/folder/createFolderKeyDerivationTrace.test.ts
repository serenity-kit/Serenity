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
      nameCiphertext: "encrypted folder name",
      nameNonce: "encrypted folder nonce",
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
          "subkeyId": 1,
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
      nameCiphertext: "parent folder name",
      nameNonce: "parent folder nonce",
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
      nameCiphertext: "child folder name",
      nameNonce: "child folder nonce",
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
            subkeyId: 2,
          },
          {
            entryId: "childFolderId",
            parentId: null,
            context: folderDerivedKeyContext,
            subkeyId: 1,
          },
        ],
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
          "subkeyId": 2,
        },
        {
          "context": "${folderDerivedKeyContext}",
          "entryId": "childFolderId",
          "parentId": "parentFolderId",
          "subkeyId": 1,
        },
      ],
      "workspaceKeyId": "workspaceId",
    }
  `);
});
