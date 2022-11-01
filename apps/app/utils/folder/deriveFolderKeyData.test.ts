jest.mock("../../generated/graphql", () => ({ __esModule: true }));
jest.mock("./getFolder", () => ({
  __esModule: true,
  getFolder: jest.fn(),
}));
jest.mock("../workspace/getWorkspace", () => ({
  __esModule: true,
  getWorkspace: jest.fn(),
}));

import { createDevice } from "@serenity-tools/common";
import sodium from "@serenity-tools/libsodium";
import { v4 as uuidv4 } from "uuid";
import { deriveFolderKey } from "./deriveFolderKeyData";
import { getFolder } from "./getFolder";
import { getWorkspace } from "./getWorkspace";

beforeAll(async () => {
  await sodium.ready;
});

it("should return empty parentFolders", async () => {
  getWorkspace.mockImplementation((props) => {
    return {
      __typename: "Workspace",
      id: "abc",
      currentWorkspaceKey: {
        __typename: "WorkspaceKey",
        id: "abcd",
      },
    };
  });

  // @ts-ignore getFolder is mocked
  getFolder.mockImplementation((props) => {
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
  });

  const activeDevice = await createDevice();
  const folderId = uuidv4();
  const workspaceId = uuidv4();
  const workspaceKeyId = uuidv4();

  const derivedFolderKeyData = await deriveFolderKey({
    folderId,
    workspaceId,
    workspaceKeyId,
    activeDevice,
  });
  expect(derivedFolderKeyData).toMatchInlineSnapshot();
});
