jest.mock("../generated/graphql", () => ({
  __esModule: true,
  // default: jest.fn(),
  // namedExport: jest.fn(),
}));

import { interpret } from "xstate";
import { loadMeAndVerifyMachine } from "./loadMeAndVerifyMachine";

it("should reach validSession", (done) => {
  const machine = loadMeAndVerifyMachine.withConfig({
    services: {
      fetchMe: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                me: {
                  id: "123",
                },
              },
            });
          }, 1);
        });
      },
    },
  });

  const service = interpret(machine).onTransition((state) => {
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

  const machine = loadMeAndVerifyMachine.withConfig({
    services: {
      fetchMe: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                me: null,
              },
            });
          }, 1);
        });
      },
    },
    actions: {
      redirectToLogin,
    },
  });

  const service = interpret(machine).onTransition((state) => {
    if (state.matches("invalidSession")) {
      expect(redirectToLogin).toHaveBeenCalled();
      done();
    }
  });

  service.start();
});
