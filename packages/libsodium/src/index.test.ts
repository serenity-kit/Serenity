import sodium from "react-native-libsodium";
import { base64_to_url_safe_base64, url_safe_base64_to_base64 } from "./index";

test("should decode libsodium-compatible base64 to a string", async () => {
  await sodium.ready;

  const result = base64_to_url_safe_base64(
    "TllqyZUK9X/oa3MzucvObvNibV85o++l+0XhGDtjjs6+QwNHitwYhTT/W+jxWtpNFf7db0IK7vI4LI3+yMO0AQ=="
  );

  expect(result).toEqual(
    "TllqyZUK9X_oa3MzucvObvNibV85o--l-0XhGDtjjs6-QwNHitwYhTT_W-jxWtpNFf7db0IK7vI4LI3-yMO0AQ"
  );
});

test("should decode libsodium-compatible base64 to a string", async () => {
  await sodium.ready;

  const result = url_safe_base64_to_base64(
    "TllqyZUK9X_oa3MzucvObvNibV85o--l-0XhGDtjjs6-QwNHitwYhTT_W-jxWtpNFf7db0IK7vI4LI3-yMO0AQ"
  );

  expect(result).toEqual(
    "TllqyZUK9X/oa3MzucvObvNibV85o++l+0XhGDtjjs6+QwNHitwYhTT/W+jxWtpNFf7db0IK7vI4LI3+yMO0AQ=="
  );
});
