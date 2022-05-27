import setupGraphql from "../../../../test/helpers/setupGraphql";
import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
import { registerUser } from "../../../../test/helpers/registerUser";
import { createWorkspace } from "../../../../test/helpers/workspace/createWorkspace";

const graphql = setupGraphql();
let userId: string = "";
const username = "user";
const password = "password";

beforeAll(async () => {
  await deleteAllRecords();
});

beforeEach(async () => {
  // TODO: we don't want this before every test
  const cerateUserResponse = await registerUser(
    graphql,
    username,
    password,
    "31f63652-a995-41ff-b541-3ccdaaaac551"
  );
  userId = cerateUserResponse.registrationResponse.finalizeRegistration.id;
});

test("user should be able to create a workspace", async () => {
  // generate a challenge code
  const authorizationHeader = `TODO+${username}`;
  const name = "workspace";
  const id = "7154dda5-f237-455e-9a60-584b64fde8a9";
  const result = await createWorkspace({
    name,
    id,
    graphql,
    authorizationHeader,
  });
  expect(result.createWorkspace).toMatchInlineSnapshot(`
    Object {
      "workspace": Object {
        "id": "${id}",
        "members": Array [
          Object {
            "isAdmin": true,
            "userId": "${userId}",
          },
        ],
        "name": "${name}",
      },
    }
  `);
});
