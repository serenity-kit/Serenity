import sodium from "libsodium-wrappers";
import sodium2 from "react-native-libsodium";

// @ts-expect-error
global.setImmediate = jest.useRealTimers;

jest.setTimeout(25000);

beforeEach(async () => {
  await sodium.ready;
  await sodium2.ready;
});
