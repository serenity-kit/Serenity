import sodiumWrapper from "libsodium-wrappers";
import sodium from "@serenity-tools/libsodium";
import { v4 as uuidv4 } from "uuid";
import { encryptAead, decryptAead } from "./crypto";

test("encryptAead and decryptAead", async () => {
  await sodium.ready;

  const key = sodiumWrapper.from_hex(
    "724b092810ec86d7e35c9d067702b31ef90bc43a7b598626749914d6a3e033ed"
  );

  const publicData = {
    snapshotId: uuidv4(),
  };

  const encryptedResult = await encryptAead(
    "Hallo",
    sodiumWrapper.to_base64(JSON.stringify(publicData)),
    sodium.to_base64(key)
  );

  const decryptedResult = await decryptAead(
    sodium.from_base64(encryptedResult.ciphertext),
    sodiumWrapper.to_base64(JSON.stringify(publicData)),
    sodium.to_base64(key),
    encryptedResult.publicNonce
  );
  expect(sodium.from_base64_to_string(decryptedResult)).toEqual("Hallo");
});
