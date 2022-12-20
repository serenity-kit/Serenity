import sodium from "libsodium-wrappers";
import * as base64native from "./base64native";
import * as base64wasm from "./base64wasm";

test("should decode libsodium-compatible base64 to a string", async () => {
  await sodium.ready;

  expect(base64wasm.from_base64_to_string("SGVsbG8")).toEqual("Hello");
  expect(base64native.from_base64_to_string("SGVsbG8")).toEqual("Hello");
  expect(base64wasm.from_base64_to_string("w7_Dv8OA")).toEqual("\xFF\xFF\xC0");
  expect(base64native.from_base64_to_string("w7_Dv8OA")).toEqual(
    "\xFF\xFF\xC0"
  );
});
