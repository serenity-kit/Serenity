// import { gql } from "graphql-request";
// import setupGraphql from "../../../../test/helpers/setupGraphql";
// import deleteAllRecords from "../../../../test/helpers/deleteAllRecords";
// import createUserWithWorkspace from "../../../database/testHelpers/createUserWithWorkspace";
// import { createDevice } from "../../../../test/helpers/device/createDevice";
// import { getDevices } from "../../../../test/helpers/device/getDevices";

// const graphql = setupGraphql();
// const username = "7dfb4dd9-88be-414c-8a40-b5c030003d89@example.com";

// beforeAll(async () => {
//   await deleteAllRecords();
//   await createUserWithWorkspace({
//     id: "5a3484e6-c46e-42ce-a285-088fc1fd6915",
//     username,
//   });
// });

// test("user should be able to list their devices", async () => {
//   const authorizationHeader = `TODO+${username}`;
//   await createDevice({
//     graphql,
//     authorizationHeader,
//   });
//   await createDevice({
//     graphql,
//     authorizationHeader,
//   });

//   const result = await getDevices({
//     graphql,
//     authorizationHeader,
//   });

//   const edges = result.devices.edges;
//   expect(edges.length).toBe(3);
// });
