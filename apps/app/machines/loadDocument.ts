import { createMachine } from "xstate";

// Stateless machine definition
// machine.transition(...) is a pure function used by the interpreter.
export const documentLoadingMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QBED2BjArgWzAOwBcACAGVQEMIBLPKAOgBsNyG6qIGwBiRUAB1SwqBKqjy8QAD0QBaAIwAmAJx0AbABZVAZlVKA7FoCsADiVa5qgDQgAnojnm6ABiWrDC9UsPqDe9QoBfAOs0LFxCUgpqWkZmViZKGiguCDEwNjwAN1QAa3TQnHxiMkSYpnQWWNKoBBpsipExAG0nAF0JASFG8SQpRHcVbScDBRMXBQU5azsEOXVjZyN1QyVjJ3WHIJCMQoiS6PpyyoSDrjAAJ3PUc7o+BnICADNr7DoC8OKopNiK+K-aWpZZjdFrtXqdYSiHqgaQIbzqOiGLQ6FzGOTGFZuaaIUYKOhaJRyJHogmqdF6QLBEDvIqRap0c5gbCoAjpE5JFJpDLZPJvHYfOkHBlMlls-41OrAqGgjqCSFiCSw5Z0TRKVaGJwKVR6QwU9TYuHo-HGBRGE1zdROQyqLbU-m0-bfRnM1lVU4XK43O4PZ7nV40vbi4UusXVQH1B7StqyrpQxWyBQLbSqYxrZZWy1eA0UvR0PR6ORyJQ+VZmDG2gOfenO0V0R5gAjoAAWkE5eHSkt5lcFTpFrvrjZbEHDUua0fBcu68cNTjzmrWmvRJoUegNqk1ag1TnUBOty08FftgerffSA+brY911u9yeLz5YQdQZr-YbF+HkoaUbB-Encd6sKGIWdCrFokyGEBqzkqutiICms4asYZIYsY-iuJSVJ4KgEBwBI3aOmUcRsBwYAxvK0J9AgMhgQs3halomrWrqBYGnMeJOEYmpKKMWj+JMxiHo+x5CkcfzVGRU4AfYGLOE4656MWSLLFoMEzBYCLqss2p6GiEHeIJuxViJRGwJg6DoHA8ATrGCpSQgxhGHmRLDOYxj5oWWisf4iwagSch6Ou+7qAZAoEYcRFYQQABiqCYHgEASf+MKICahhqA4DiqDxEHzAayIqIo7hkpMPhFsiIVPvSomJbZyVUUYeJ0UMoxuO5BorHQcguOY-nqF1rhZTaVL4c+p5ukkNUUbC1EriqPjzQxmo+Faa4TJ1S2pvo7hdYYFXCb2IZ1m+Q6TdOHgIpMqhkloulmCua6mHQbnzEWozcfoeh7UZB21o85BUJwEAACqoFFx2nXZOkLG5OmaFlfi6FMsH2cBuqePmEyeIolLbEJ30xC+6SmeZlkQ3V+YqAp6IaCpxXDO1rhqJ412ZkhwXDUe+P0ITdb-YDIPIGA6DnDYfAEGTlE6bOJIcQp+heEo2brE9Gy4tx2laF9PYE2NNaZJAEuwvmqggVthI+EYGpIzMkGdRqCkKC4Tjoh4WthcGoqG7IRhyHNfh+ItHh6CtyPqJo+JeIomg3Vdzu7RzePa1AXv1QFiL+M1TFtcj8h4jDMMcWs6ImBhARAA */
  createMachine({
    context: {
      clientType: "web", // "web" | "mobile" | "desktop",
      hasLocalDocument: false,
    },
    tsTypes: {} as import("./loadDocument.typegen").Typegen0,
    predictableActionArguments: true,
    type: "parallel",
    id: "Document Loading",
    states: {
      local: {
        initial: "idle",
        states: {
          idle: {
            always: [
              {
                cond: "isMobileOrDesktop",
                target: "loading",
              },
              {
                target: "notFound",
              },
            ],
          },
          loading: {
            invoke: {
              src: "load",
              onDone: [
                {
                  target: "success",
                },
              ],
              onError: [
                {
                  target: "notFound",
                },
              ],
            },
          },
          success: {},
          notFound: {},
        },
      },
      remote: {
        initial: "loading",
        states: {
          loading: {
            invoke: {
              src: "fetch",
              onDone: [
                {
                  cond: "isTombstone",
                  target: "removed",
                },
                {
                  target: "fetched",
                },
              ],
              onError: [
                {
                  target: "failedToFetch",
                },
              ],
            },
          },
          fetched: {
            invoke: {
              src: "decrypt",
              onDone: [
                {
                  target: "success",
                },
              ],
              onError: [
                {
                  target: "failedToDecrypt",
                },
              ],
            },
          },
          failedToFetch: {},
          success: {},
          failedToDecrypt: {},
          removed: {},
        },
      },
    },
  });
