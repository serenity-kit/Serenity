// import { _Z4facti } from './factorial.wasm';

// console.log('---- Sync Wasm Module');
// const factorial = _Z4facti;
// console.log(factorial); // [native code]
// console.log(factorial(1));
// console.log(factorial(2));
// console.log(factorial(3));

// import('./factorial.wasm').then(({ _Z4facti: AsyncFactorial }) => {
//   console.log('---- Async Wasm Module');
//   console.log(AsyncFactorial); // [native code]
//   console.log(AsyncFactorial(1));
//   console.log(AsyncFactorial(2));
//   console.log(AsyncFactorial(3));
// });
console.log("waaa");

import { Registration, Login } from "opaque-wasm";

const password = "asdf123";
const email = "myawesomeapp@seerv.dev";

try {
  const registration = new Registration();
  const firstMessage = registration.start(password);
  console.log(firstMessage);
  alert(firstMessage);
  // const secondMessage = await sendMessageToServer(firstMessage);
  // const thirdMessage = registration.finish(secondMessage);
  // const { status } = await sendMessageToServer(thirdMessage, { email });

  // console.log(status); // 204 - Server Return ok, user account has been created

  // const login = new Login();
  // const firstLoginMessage = login.start(password);
  // const secondLoginMessage = await sendMessageToServer(
  //   firstLoginMessage,
  //   email
  // );
  // const thirdLoginMessage = login.finish(secondLoginMessage);
  // const sessionKey = login.getSessionKey();
  // await sendMessageToServer(thirdLoginMessage);

  // console.log(sessionKey); // eyhojo55....
} catch (e) {
  console.error(e);
}
