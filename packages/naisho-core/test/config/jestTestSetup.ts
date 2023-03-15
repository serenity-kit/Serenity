import sodium from "libsodium-wrappers";
// @ts-expect-error no types available
import { WebSocket } from "mock-socket";

// @ts-expect-error
global.setImmediate = jest.useRealTimers;
global.WebSocket = WebSocket;

jest.setTimeout(25000);

beforeEach(async () => {
  await sodium.ready;
});
