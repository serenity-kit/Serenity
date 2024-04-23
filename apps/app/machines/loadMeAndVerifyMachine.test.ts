jest.mock("../generated/graphql", () => ({
  __esModule: true,
  // default: jest.fn(),
  // namedExport: jest.fn(),
}));

import { createActor, fromPromise } from "xstate";
import { loadMeAndVerifyMachine } from "./loadMeAndVerifyMachine";

it("should reach validSession", (done) => {
  const machine = loadMeAndVerifyMachine.provide({
    actors: {
      fetchMe: fromPromise(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                // @ts-expect-error
                me: {
                  id: "123",
                },
              },
            });
          }, 1);
        });
      }),
    },
  });

  const service = createActor(machine, { input: { navigation: jest.fn() } });
  service.subscribe((state) => {
    if (state.matches("validSession")) {
      expect(state.context.meQueryResult).toMatchInlineSnapshot(`
        {
          "data": {
            "me": {
              "id": "123",
            },
          },
        }
      `);
      done();
    }
  });

  service.start();
});

it("should redirectToLogin if session is not valid", (done) => {
  const redirectToLogin = jest.fn();

  const machine = loadMeAndVerifyMachine.provide({
    actors: {
      fetchMe: fromPromise(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            // @ts-expect-error
            resolve({
              data: {
                me: null,
              },
            });
          }, 1);
        });
      }),
    },
    actions: {
      redirectToLogin,
    },
  });

  const service = createActor(machine, { input: { navigation: jest.fn() } });
  service.subscribe((state) => {
    if (state.matches("invalidSession")) {
      expect(redirectToLogin).toHaveBeenCalled();
      done();
    }
  });

  service.start();
});
