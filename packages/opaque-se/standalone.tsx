import { Registration, Login } from "opaque-wasm";

console.log("init opaque-se standalone | weee");

const password = "asdf123";
const email = "myawesomeapp@seerv.dev";

// import("opaque-wasm").then((x) => {
//   console.log(x);
// });

try {
  console.log("weee");
  const registration = new Registration();
  const firstMessage = registration.start(password);
  console.log("first message:", firstMessage);
} catch (e) {
  console.error(e);
}
