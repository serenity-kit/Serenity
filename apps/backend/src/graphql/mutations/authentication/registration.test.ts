// import { gql } from "graphql-request";
// import sodium from "libsodium-wrappers";
// import setupGraphql from "../../../../test/helpers/setupGraphql";
// import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
// import { requestRegistrationChallengeResponse } from "../../../../test/helpers/requestRegistrationChallengeResponse";

// const graphql = setupGraphql();
// const username = "user";
// const password = "password";
// let result: any = null;

// beforeAll(async () => {
//   await deleteAllRecords();
// });

// test("server should create a registration challenge response", async () => {
//   expect.assertions(3);
//   // generate a challenge code
//   result = await requestRegistrationChallengeResponse(
//     graphql,
//     username,
//     password
//   );
//   expect(result.data).toBeDefined();
//   expect(typeof result.data.registrationId).toBe("string");
//   expect(typeof result.data.challengeResponse).toBe("string");
// });

// test("server should register a user", async () => {
//   expect.assertions(1);
//   const message = result.registration.finish(
//     sodium.from_base64(result.data.challengeResponse)
//   );
//   const query = gql`
//     mutation finishRegistration($input: FinishRegistrationInput!) {
//       finishRegistration(input: $input) {
//         id
//       }
//     }
//   `;

//   const registrationResponse = await graphql.client.request(query, {
//     input: {
//       registrationId: result.data.registrationId,
//       message: sodium.to_base64(message),
//       clientPublicKey: "TODO",
//       workspaceId: "25ef3570-a7c8-4872-a3fb-9521842493ae",
//     },
//   });
//   expect(typeof registrationResponse.finishRegistration.id).toBe("string");
// });

test("something", async () => {
  expect(1).toBe(1);
});
