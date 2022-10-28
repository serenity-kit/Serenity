jest.mock("../../generated/graphql", () => ({ __esModule: true }));
jest.mock("./getFolder", () => ({
  __esModule: true,
  getFolder: jest.fn(),
}));

// import { deriveFolderKey } from "./deriveFolderKeyData";
// import { getFolder } from "./getFolder";
// import { getWorkspace } from "../workspace/getWorkspace";
// import { v4 as uuidv4 } from "uuid";
// import { createDeviceWithInfo } from "../../utils/authentication/createDeviceWithInfo";
// import { createAndEncryptWorkspaceKeyForDevice } from "../../utils/device/createAndEncryptWorkspaceKeyForDevice";
// import * as sodium from "@serenity-tools/libsodium";
// import { encryptFolderName } from "@serenity-tools/common";
// import { folderDerivedKeyContext } from "@serenity-tools/common";
// import { createDevice } from "@serenity-tools/common";

it("should return empty parentFolders", async () => {
  // const creatorDevice = await createDevice();
  // const activeDevice = await createDeviceWithInfo();
  //   const folderId = uuidv4();
  //   const workspaceId = uuidv4();
  //   const workspaceKeyId = uuidv4();
  //   const workspaceKey = await sodium.crypto_kdf_keygen();
  //   const workspaceKeyBoxData = await createAndEncryptWorkspaceKeyForDevice({
  //     receiverDeviceEncryptionPublicKey: activeDevice.encryptionPublicKey,
  //     creatorDeviceEncryptionPrivateKey:
  //       creatorDevice.encryptionPrivateKey!,
  //     workspaceKey: workspaceKey
  //   });
  //   const folderNameData = await encryptFolderName({
  //     name: "test",
  //     parentKey: workspaceKey
  //   })
  //   // @ts-ignore getFolder is mocked
  //   getFolder.mockReturnValueOnce({
  //     __typename: "Folder",
  //     id: "aaa",
  //     encryptedName: folderNameData.ciphertext,
  //     encryptedNameNonce: folderNameData.publicNonce,
  //     workspaceKeyId,
  //     subkeyId: folderNameData.folderSubkeyId,
  //     parentFolderId: null,
  //     workspaceId,
  //     keyDerivationTrace: {
  //       workspaceKeyId,
  //       parentFolders: [],
  //     },
  //   });
  //   // @ts-ignore getWorkspace is mocked
  //   getWorkspace.mockReturnValueOnce({
  //     __typename: "Workspace",
  //     id: workspaceId,
  //     name: "workspace",
  //     idSignature: "aaa",
  //     members: [{
  //         userId: "abc123",
  //         username: "user@example.com",
  //         isAdmin: true
  //     }],
  //     currentWorkspaceKey: {
  //         id: workspaceKeyId,
  //         workspaceId,
  //         generation: 0,
  //         workspaceKeyBox: {
  //             id: "aaa",
  //             workspaceKeyId,
  //             deviceSigningPublicKey: activeDevice.signingPublicKey,
  //             creatorDeviceSigningPublicKey: creatorDevice.signingPublicKey,
  //             nonce: workspaceKeyBoxData.nonce,
  //             ciphertext: workspaceKeyBoxData.ciphertext,
  //         }
  //     },
  //   });
  //   const derivedFolderKeyData = await deriveFolderKey({
  //     folderId,
  //     workspaceId,
  //     workspaceKeyId,
  //     activeDevice,
  //   });
  //   expect(derivedFolderKeyData).toMatchInlineSnapshot();
});
