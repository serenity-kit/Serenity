[![Build Status](https://travis-ci.com/marucjmar/opaque-wasm.svg?branch=master)](https://travis-ci.com/marucjmar/opaque-wasm)

## opaque-wasm

An implementation of the OPAQUE key exchange protocol in WASM(WebAssembly). This implementation is based on the [opaque-ke](https://github.com/novifinancial/opaque-ke).

### Installation

```
npm install --save opaque-wasm
yarn add opaque-wasm
```

### JS simple example of usage

Check full implementation in this [file](https://github.com/marucjmar/opaque-wasm/blob/master/js-test/test.mjs)

```js
import { Registration, Login } from "opaque-wasm";

const password = "asdf123";
const email = "myawesomeapp@seerv.dev";

try {
  const registration = new Registration();
  const firstMessage = registration.start(password);
  const secondMessage = await sendMessageToServer(firstMessage);
  const thirdMessage = registration.finish(secondMessage);
  const { status } = await sendMessageToServer(thirdMessage, { email });

  console.log(status); // 204 - Server Return ok, user account has been created

  const login = new Login();
  const firstLoginMessage = login.start(password);
  const secondLoginMessage = await sendMessageToServer(
    firstLoginMessage,
    email
  );
  const thirdLoginMessage = login.finish(secondLoginMessage);
  const sessionKey = login.getSessionKey();
  await sendMessageToServer(thirdLoginMessage);

  console.log(sessionKey); // eyhojo55....
} catch (e) {
  console.error(e);
}
```

### Build ES6 package

```
wasm-pack build
```

### Build for NodeJs

```
wasm-pack build --target nodejs
```
