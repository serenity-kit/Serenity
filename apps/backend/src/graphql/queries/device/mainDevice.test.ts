import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
import { getMainDevice } from "../../../../test/helpers/device/getMainDevice";

const graphql = setupGraphql();
const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";
let userAndDevice: any = null;

beforeAll(async () => {
  await deleteAllRecords();
  userAndDevice = await createUserWithWorkspace({
    id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
    username,
  });
});

test("user should be retrieve the mainDevice", async () => {
  const authorizationHeader = userAndDevice.device.signingPublicKey;
  const result = await getMainDevice({
    graphql,
    authorizationHeader,
  });
  const retrivedDevice = result.mainDevice.device;
  expect(retrivedDevice).toMatchInlineSnapshot(`undefined`);
});
