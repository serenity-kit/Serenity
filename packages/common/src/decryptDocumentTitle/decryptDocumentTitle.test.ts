import sodium from "@serenity-tools/libsodium";
import { createDocumentKey } from "../createDocumentKey/createDocumentKey";
import { encryptDocumentTitle } from "../encryptDocumentTitle/encryptDocumentTitle";
import { recreateDocumentKey } from "../recreateDocumentKey/recreateDocumentKey";
import { decryptDocumentTitle } from "./decryptDocumentTitle";

beforeAll(async () => {
  await sodium.ready;
});

test("decryptDocumentTitle", async () => {
  const folderKey = "3NmUk0ywlom5Re-ShkR_nE3lKLxq5FSJxm56YdbOJto";
  const initialDocumentKey = await createDocumentKey({ folderKey });
  const result = await encryptDocumentTitle({
    key: initialDocumentKey.key,
    title: "Todos",
  });

  const documentKey = await recreateDocumentKey({
    folderKey,
    subkeyId: initialDocumentKey.subkeyId,
  });
  const documentTitle = await decryptDocumentTitle({
    key: documentKey.key,
    ciphertext: result.ciphertext,
    publicNonce: result.publicNonce,
  });

  expect(documentTitle).toBe("Todos");
});
