// @ts-expect-error no types available
import { Server } from "mock-socket";
import { interpret } from "xstate";
import { syncMachine } from "./syncMachine";

const url = "wss://www.example.com";
let mockServer: Server;

beforeEach(() => {
  mockServer = new Server(url);
});

afterEach((done) => {
  mockServer.stop(() => {
    done();
  });
});

it("should start with connecting", (done) => {
  const syncService = interpret(
    syncMachine.withContext({
      ...syncMachine.context,
      websocketHost: url,
      websocketSessionKey: "sessionKey",
    })
  ).onTransition((state) => {
    if (state.matches("connecting")) {
      done();
    }
  });

  syncService.start();
});

it("should connect", (done) => {
  const url = "wss://www.example.com";

  const syncService = interpret(
    syncMachine.withContext({
      ...syncMachine.context,
      websocketHost: url,
      websocketSessionKey: "sessionKey",
    })
  ).onTransition((state) => {
    if (state.matches("connected")) {
      done();
    }
  });

  syncService.start();
});
