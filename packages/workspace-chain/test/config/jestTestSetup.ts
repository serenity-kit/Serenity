import sodium from "react-native-libsodium";

// @ts-expect-error
global.setImmediate = jest.useRealTimers;

jest.setTimeout(25000);

beforeEach(async () => {
  await sodium.ready;
});
