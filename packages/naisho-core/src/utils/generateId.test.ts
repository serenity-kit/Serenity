import sodium from "react-native-libsodium";
import { generateId } from "./generateId";

beforeAll(async () => {
  await sodium.ready;
});

test("should return a non-empty string", () => {
  const id = generateId();
  expect(typeof id).toBe("string");
  expect(id.length).toBeGreaterThan(0);
});

test("should return a base64 encoded string", () => {
  const id = generateId();
  const urlSafeBase64Regex =
    /^(?:[A-Za-z0-9-_]{4})*(?:[A-Za-z0-9-_]{2}==|[A-Za-z0-9-_]{3}=)?$/;
  expect(urlSafeBase64Regex.test(id)).toBe(true);
});

test("should return a URL-safe base64 encoded string without padding", () => {
  const id = generateId();
  const urlSafeBase64Regex =
    /^(?:[A-Za-z0-9-_]{4})*([A-Za-z0-9-_]{2}|[A-Za-z0-9-_]{3})?$/;
  expect(urlSafeBase64Regex.test(id)).toBe(true);
});

test("should return a 32 character string", () => {
  const id = generateId();
  expect(id.length).toBe(32);
});

test("should return unique ids on multiple calls", () => {
  const id1 = generateId();
  const id2 = generateId();
  const id3 = generateId();

  expect(id1).not.toBe(id2);
  expect(id1).not.toBe(id3);
  expect(id2).not.toBe(id3);
});
