jest.mock("../../generated/graphql", () => ({ __esModule: true }));
jest.mock("./getFolder", () => ({
  __esModule: true,
  getFolder: jest.fn(),
}));

import { buildKeyDerivationTrace } from "./buildKeyDerivationTrace";
import { getFolder } from "./getFolder";

it("should return empty parentFolders", async () => {
  const result = await buildKeyDerivationTrace({
    folderId: null,
    workspaceKeyId: "abc",
  });
  expect(result).toMatchInlineSnapshot(`
    {
      "parentFolders": [],
      "workspaceKeyId": "abc",
    }
  `);
});

it("should return one parent folder", async () => {
  // @ts-ignore getFolder is mocked
  getFolder.mockReturnValueOnce({
    __typename: "Folder",
    id: "aaa",
    encryptedName: "aaa",
    encryptedNameNonce: "aaa",
    workspaceKeyId: "aaa",
    subkeyId: 1,
    parentFolderId: null,
    workspaceId: "aaa",
    keyDerivationTrace: {
      workspaceKeyId: "aaa",
      parentFolders: [],
    },
  });

  const result = await buildKeyDerivationTrace({
    folderId: "aaa",
    workspaceKeyId: "abc",
  });
  expect(result).toMatchInlineSnapshot(`
    {
      "parentFolders": [
        {
          "folderId": "aaa",
          "parentFolderId": null,
          "subkeyId": 1,
        },
      ],
      "workspaceKeyId": "abc",
    }
  `);
});

it("should return two parent folders", async () => {
  // @ts-ignore getFolder is mocked
  getFolder.mockImplementation((props) => {
    if (props.id === "aaa") {
      return {
        __typename: "Folder",
        id: "aaa",
        encryptedName: "aaa",
        encryptedNameNonce: "aaa",
        workspaceKeyId: "aaa",
        subkeyId: 1,
        parentFolderId: "bbb",
        workspaceId: "aaa",
        keyDerivationTrace: {
          workspaceKeyId: "aaa",
          parentFolders: [],
        },
      };
    }

    if (props.id === "bbb") {
      return {
        __typename: "Folder",
        id: "bbb",
        encryptedName: "bbb",
        encryptedNameNonce: "bbb",
        workspaceKeyId: "bbb",
        subkeyId: 2,
        parentFolderId: null,
        workspaceId: "bbb",
        keyDerivationTrace: {
          workspaceKeyId: "bbb",
          parentFolders: [],
        },
      };
    }
  });

  const result = await buildKeyDerivationTrace({
    folderId: "aaa",
    workspaceKeyId: "abc",
  });
  expect(result).toMatchInlineSnapshot(`
    {
      "parentFolders": [
        {
          "folderId": "aaa",
          "parentFolderId": "bbb",
          "subkeyId": 1,
        },
        {
          "folderId": "bbb",
          "parentFolderId": null,
          "subkeyId": 2,
        },
      ],
      "workspaceKeyId": "abc",
    }
  `);
});