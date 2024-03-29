import { deriveSessionAuthorization } from "@serenity-tools/common";
import { loginUser } from "../../../../test/helpers/authentication/loginUser";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { getMainDevice } from "../../../../test/helpers/device/getMainDevice";
import setupGraphql from "../../../../test/helpers/setupGraphql";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
let userAndDevice: any = null;

beforeAll(async () => {
  await deleteAllRecords();
  userAndDevice = await createUserWithWorkspace({
    username,
  });
});

test("user should be retrieve the mainDevice", async () => {
  const { sessionKey } = await loginUser({
    graphql,
    username,
    password: "12345689",
    mainDevice: userAndDevice.mainDevice,
  });
  const authorizationHeader = deriveSessionAuthorization({
    sessionKey,
  }).authorization;
  const result = await getMainDevice({
    graphql,
    authorizationHeader,
  });
  const retrivedDevice = result.mainDevice.device;
  expect(retrivedDevice).toMatchInlineSnapshot(`undefined`);
});

test("Unauthenticated", async () => {
  await expect(
    (async () =>
      await getMainDevice({
        graphql,
        authorizationHeader: "badauthheader",
      }))()
  ).rejects.toThrowError(/UNAUTHENTICATED/);
});
