// import sodiumWrapper from "libsodium-wrappers";
import serenitySodium from "@serenity-tools/libsodium";
import sodium from "libsodium-wrappers-sumo";
// import { v4 as uuidv4 } from "uuid";
// import { encryptAead, decryptAead } from "./crypto";
declare const Buffer;

/*
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
/* */

test("Can encode libsodium-compatible base64", async () => {
  await sodium.ready;
  const testStrings = [
    "\0\x01\x02\x03\x04\x05\x06\x07\b\t\n\x0B\f\r\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\x7F",
    "a",
    "aa",
    "aaa",
    "foo\0",
    "foo\0\0",
    "",
    "f",
    "fo",
    "foo",
    "foob",
    "fooba",
    "fobar",
    "\xFF\xFF\xC0",
    "\0",
    "\0a",
    "\uD800\uDC00",
  ];
  for (let i = 0; i < testStrings.length; i++) {
    const testBytes = new Uint8Array(Buffer.from(testStrings[i]));
    const encodedValue = serenitySodium.to_base64(testBytes);
    const expectedResult = sodium.to_base64(testBytes);
    expect(encodedValue).toBe(expectedResult);
  }
});

test("Can decode libsodium-compatible base64", async () => {
  await sodium.ready;
  const testStrings = [
    "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn8=",
    "AAECA\t\n\f\r wQFBgcICQoLDA0ODx\t\n\f\r AREhMUFRYXGBkaGxwdHh8gIS\t\n\f\r IjJCUmJygpKissLS4vMDEyMzQ1Njc4OT\t\n\f\r o7PD0+P0BBQkNERUZHSElKS0xNT\t\n\f\r k9QUVJTVFVWV1hZWltcXV5fY\t\n\f\r GFiY2RlZmdoaWprbG\t\n\f\r 1ub3BxcnN0dXZ3eH\t\n\f\r l6e3x9fn8=",
    "YQ===",
    "YWE=",
    "YWFh",
    "YQ",
    // "YR", // libsodium throws 'invalid input' error
    "Zm9vIGJhciBiYXo=",
    "Zm9vIGJhcg==",
    "Zm9v",
    "Zm9vAA==",
    "Zm9vAAA=",
    "abcd",
    " abcd",
    "abcd ",
    "abcd===",
    " abcd===",
    "abcd=== ",
    "abcd === ",
    "a",
    // "ab", // libsodium process this into []
    "abc",
    // "abcde", // invalid input
    // "\uD800\uDC00", // libsodium process this into [255, 255, 255]
    "=",
    "==",
    "===",
    "====",
    "=====",
    "a=",
    "a==",
    "a===",
    "a====",
    "a=====",
    // "ab=", // libsodium process these into []
    // "ab===",
    // "ab====",
    // "ab=====",
    "abc=",
    "abc==",
    "abc===",
    "abc====",
    "abc=====",
    "abcd=",
    "abcd==",
    "abcd===",
    "abcd====",
    "abcd=====",
    // "abcde=", // libsodium process these into []
    // "abcde==",
    // "abcde===",
    // "abcde====",
    // "abcde=====",
    "=a=",
    "a=b",
    "a=b=",
    // "ab=c", // libsodium process these into []
    // "ab=c=", // libsodium process these into []
    // "ab=c=d", // libsodium process these into []
    // "ab=c=d=", // libsodium process these into []
    "ab\tcd",
    "ab\ncd",
    "ab\fcd",
    "ab\rcd",
    "ab cd",
    "ab\xA0cd",
    "ab\t\n\f\r cd",
    " \t\n\f\r ab\t\n\f\r cd\t\n\f\r ",
    "ab\t\n\f\r =\t\n\f\r =\t\n\f\r ",
    "A",
    "/A",
    "//A",
    "///A",
    // "////A", // libsodium throws an "invalid input" error
    "/",
    // "A/", // libsodium throws an "invalid input" error
    // "AA/", // libsodium throws an "invalid input" error
    "AAA/",
    // "AAAA/", // libsodium throws an "invalid input" error
    "\0",
    "\0nonsense",
    "abcd\0nonsense",
  ];
  for (let i = 0; i < testStrings.length; i++) {
    const testString = testStrings[i]
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replace(/=+$/, "");
    let decodedValue = new Array();
    let expectedResult = new Array();
    let localError = "";
    let sodiumError = "";
    try {
      decodedValue = Array.from(serenitySodium.from_base64(testString));
    } catch (error) {
      localError = error.name;
    }
    try {
      expectedResult = Array.from(sodium.from_base64(testString));
    } catch (error) {
      sodiumError = error.name;
    }
    expect(localError).toEqual(sodiumError);
    expect(decodedValue).toEqual(expect.arrayContaining(expectedResult));
  }
});
