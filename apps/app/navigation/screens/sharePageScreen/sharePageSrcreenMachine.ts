import sodium from "@serenity-tools/libsodium";
import { assign, createMachine } from "xstate";
import {
  DocumentShareLinkQuery,
  runDocumentShareLinkQuery,
} from "../../../generated/graphql";

export type DocumentShareLinkQueryResult = {
  data?: DocumentShareLinkQuery;
  error?: {
    networkError?: any;
  };
};

type Context = {
  documentId?: string;
  token: string;
  virtualDeviceKey?: string;
  navigation: any;
  device?: any;
  documentShareLinkQueryResult?: DocumentShareLinkQueryResult;
};

export const sharePageSrcreenMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5SwBYEMBOYAKaYGUMBjLMAOwFk0iUBLMsAOgBsB7NCeqAYglYcb0AbqwDWTNhwAirIgFcAtuQAu+dFgAy9UQG0ADAF1EoAA6tYtZbX7GQAD0QA2AIyPGAZgCcjgCwAOPwBWQPc9PWcAdgAaEABPRGc-Rj1PCL9PSM8AJh9En0dHAF9CmNRMHDwwQhIwcioaegl2TjIePgFhMSbpWUUVNXKtMl1nIyQQMwsrG3GHBEC-PUY-CMCIx2DwiO8fGPiEZyy3TwCCzwWvVc9PYtL1CoJiUkpqOg6IZjBuWGVMZX0xqZzJZrGRbHMCh4fKEsnpHKdDkc9ogALSeRjODJw9wBQLZdw+LIRW4gMpYXCPGp1V6NFjNSDcAG2SYgmagObOMJJDZpeEuWE+QnIhBZLyMXKJRJ6LIBLJ4klkh5VJ61F4NASSCAMnSjZnA6Zg2aIPwExhpPR+AqOVaLCK7OKIUXoiV+TmyuXBHwK+4U5VUtVvJgAMzQtGY3DsPzQyiYaCDMYwAApYWEAJTfH2VarPeqBxghsNM8Ysg3gxA4pZpRZZQ689yBRzCuU+DwRIk43KOHKivze8q+7Oq3O0xVDUQyADuZE1DPaTE64kYWpIsRMygAarQMMo5GhmFIwEJaEQwEWgVNQWWDrl3IwckF0o4MjXrU3QsssudTqsuyF3H3ySzFVqXVJhR20Sdp3pCBuDADAMFYDBGBMZhoyDRCFCXMAVzXTdt13fdD2PU9DD1C82XsBIfDhZIMnOQIUjSQJImFQUkgiNJRS8IJ3A4wJihKEAyFYLV4HGRUB2AgNaU1LgyNZQ12WNCJxUSVI9GCJ88XcLJhRCZZvEWE4TT-bwAKVQcQLzWgPjAeTSyNBAUR0xhmMxDifAyAkX2FFFIkYTx8g2FJwj0dxHG88zJP9YcNWg+zL0czlCWWTzsmhZxqJrPxhUOY5Tj8ajqKCcIoqAmKaQEAtmASii5jbJJwpCQ4QhND0mxcO9AtWQJPIKIIikEiTypzSqwPuMdIJnCBasUyiDmlJZIjtG8QmtCJnGFdxTQYwkX3rQIazKylRtAxhhIAQSIE9YDE88FKvE10Q2TkOM8dw1MOLadr0PbXAOo6hszE6hzGpd+Ds4t9USpSDi7LIzSfdIiW0lJPD01xGF8ZwdJlBjPAtG4gf7EbQbO5cMFXZQDyPE8ADFQxqqHyLmjkvBbLttsOiIdIJ7w9M-cU9v8TS9A446-VOwNZqvFFFlc5x3LtLzCWcQJfM5Y4goKC0sk-GVnAEwogA */
  createMachine(
    {
      context: { navigation: null } as Context,
      id: "sharePageSrcreenMachine",
      initial: "idle",
      states: {
        loading: {
          invoke: {
            src: "loadDocumentShareLink",
            id: "loadDocumentShareLink",
            onDone: [
              {
                target: "loaded",
                cond: "hasNoNetworkError",
                actions: assign({
                  documentShareLinkQueryResult: (context, event) => {
                    return event.data;
                  },
                }),
              },
              {
                target: "fail",
              },
            ],
          },
        },
        idle: {
          on: {
            start: {
              target: "loading",
            },
          },
        },
        loaded: {
          always: [
            {
              target: "shareLinkDownloaded",
              cond: "hasAccess",
            },
            {
              target: "noAccess",
            },
          ],
        },
        fail: {
          after: {
            "2000": {
              target: "#sharePageSrcreenMachine.loading",
              actions: [],
              internal: false,
            },
          },
        },
        shareLinkDownloaded: {
          invoke: {
            src: "decryptVirtualDevice",
            id: "decryptVirtualDevice",
            onDone: [
              {
                target: "done",
                actions: assign({
                  device: (context, event) => {
                    return event.data;
                  },
                }),
              },
            ],
            onError: [
              {
                target: "decryptDeviceFail",
              },
            ],
          },
        },
        noAccess: {},
        done: {
          type: "final",
        },
        decryptDeviceFail: {
          type: "final",
        },
      },
    },
    {
      services: {
        loadDocumentShareLink: async (context, event) => {
          const documentShareLinkResult = await runDocumentShareLinkQuery({
            token: context.token,
          });
          return documentShareLinkResult;
        },
        decryptVirtualDevice: async (context, event) => {
          const virtualDeviceKey = context.virtualDeviceKey;
          const documentShareLink =
            context.documentShareLinkQueryResult?.data?.documentShareLink;
          const base64DeviceData = await sodium.crypto_secretbox_open_easy(
            documentShareLink?.deviceSecretBoxCiphertext!,
            documentShareLink?.deviceSecretBoxNonce!,
            virtualDeviceKey!
          );
          const device = JSON.parse(
            sodium.from_base64_to_string(base64DeviceData)
          );
          return device;
        },
      },
      guards: {
        hasNoNetworkError: (context, event) => {
          return !context.documentShareLinkQueryResult?.error?.networkError;
        },
        hasAccess: (context, event) => {
          return !!context.documentShareLinkQueryResult?.data?.documentShareLink
            ?.token;
        },
      },
    }
  );
