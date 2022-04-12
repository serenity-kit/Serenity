import sodium from "@serenity-tools/libsodium";
import { to_base64 } from "./index";

test("to_base64", async () => {
  await sodium.ready;

  expect(to_base64("Hallo")).toEqual("SGFsbG8=");
});
