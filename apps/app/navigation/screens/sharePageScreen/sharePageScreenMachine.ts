import { LocalDevice } from "@serenity-tools/common";
import sodium from "react-native-libsodium";
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
  device?: LocalDevice;
  snapshotKey?: string;
  documentShareLinkQueryResult?: DocumentShareLinkQueryResult;
};

export const sharePageScreenMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5SwBYEMBOYAKaYGUBjLMAOwFk1CUBLUsAOgBsB7NCOqAYghfoboA3FgGtGrdgBEWhAK4BbMgBd86LABk6IgNoAGALqJQABxawaSmnyMgAHogCcAZgBMDAOy6ALC5cBGADYADnd3BwC-ABoQAE9EPy8AjwCvdycAVi8vby8HB3SAXwLo1EwcPDAiEgoqWn4JDlJuXn4hUXE2CGk5RVIVNTBNUh0-QyQQU3NLa3H7BD8nXQZnF0WvRYWAp3cA6LiEZwZ0hz8XAPCHIK8glIcikoHcAmIwMkpqOkYaCCYwLlglJglHoxiYzBYrKQbHMFksVmsNk4tjs9vEHO4juldN53Okwn54fcQKUsE9Ki83rVPsxOpAuCCbJMITNQDDrl4GBk8e5ri53H5QkFUfMwstcXlzilzi5dAEiSTys9qu86h12HTtKNGeDplDZvF2Zz0tzefzBcKgukGLlgutEmcgoEXPLHhUqq8ah9+AAzNA0JhcWwAtBKRhob2hjAAChl2IAlP9XUqPSrqb7-QzxkzddD4otlq4EbpNttdrEDVa8bL0jcnEEgk5LnLisSk+TlVT+AqhiJpAB3UgNOktL6kYRiBgQMDEGLGJQANRoGCUsjQTEkYEENEIYEzYKmkNzCBlXj8nOyrlS-N0uKF5ZFZ+OflOiNW7nrLrKZPdlK9jG7Wj9oOtIQFwYAYBgLAYAwxhMCG3pQfIk7Thgs4LkuK5rhuW47nuEw6oe+rHt4Z5OBeLhXn4N41sKz4OAwEQCmRN4uPWXiFC2CrfhSnqqshOFgBuM5zn8I4CGO7TIcJKikGgxioCwSgANJgDEeHZoRrKIHyuQMP4OzpAEAR8roNy0eienpFRWRBLoxrnIZn6km6PGpvwU4CUJqEiWBEFQTBcFKAhGBIVO0n4LJ8koIpKlqQY2oHiydjabiSy5I6AQ8jKAreMKrFJD41wCqsN66HkHEtqQLBTvA4xcS5HZ-jS7CcAlzJ6lpCDpEiHi+Dpix1g4WS0T1TibLip4DRKTmKu2Kadl8PxgG1OZET45lBAwOTGQ2WzZKxM3cY1fFDhAK2acl8x1ks3LdWk6wnIktGeAwtlnMWmRjYEfiHQ181NemTDnUlczrfeCwYmkGSsfywQUTsv3Jr+fEAcMQGncDHWXYE7FGg2oR1maYP7AkbjoiECRXFk-irIjc3I9SVUAIKEDusC1fu7VHjjVoZPjaQU1lFpk2x4TBGx3hOHTP68dSHnboJKFoctWYESD2lkW4xmnNcSKsQ4Lh5d4enFkELgG8EoQRM6nFtjLbmMGF3lKNhCsAGJ+kDquJVjcwlRyY2hDsLjHJahvgwSDE3n4tkEjcp66FLttfn9DPuXwKuc6tnWLL41roulqXGoE5kYhRhm6GceR5M+7jS65C1Sc7EVybAMWqR7-qQJjR4mW4VyhGchObMKGROHpCQvtkZV4t19fHZ8PdEQAtGW+yr1t2LYqsDZm8+ZxFEUQA */
  createMachine(
    {
      context: { navigation: null } as Context,
      id: "sharePageScreenMachine",
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
              target: "#sharePageScreenMachine.loading",
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
                target: "deviceDecrypte",
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
        deviceDecrypte: {
          invoke: {
            src: "decryptSnapshotKey",
            id: "decryptSnapshotKey",
            onDone: [
              {
                target: "done",
                actions: assign({
                  snapshotKey: (context, event) => {
                    return event.data;
                  },
                }),
              },
            ],
            onError: [
              {
                target: "decryptSnapsotKeyFailed",
              },
            ],
          },
        },
        decryptDeviceFail: {
          type: "final",
        },
        done: {
          type: "final",
        },
        decryptSnapsotKeyFailed: {
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
          const base64DeviceData = sodium.crypto_secretbox_open_easy(
            sodium.from_base64(documentShareLink?.deviceSecretBoxCiphertext!),
            sodium.from_base64(documentShareLink?.deviceSecretBoxNonce!),
            sodium.from_base64(virtualDeviceKey!)
          );
          const device = JSON.parse(sodium.to_string(base64DeviceData));
          return device;
        },
        decryptSnapshotKey: async (context, event) => {
          if (
            context.device &&
            context.documentShareLinkQueryResult?.data?.documentShareLink
              ?.snapshotKeyBoxs &&
            context.documentShareLinkQueryResult.data.documentShareLink
              .snapshotKeyBoxs.length > 0
          ) {
            const snapshotKeyBox =
              context.documentShareLinkQueryResult.data.documentShareLink
                .snapshotKeyBoxs[0];

            const snapshotKey = sodium.crypto_box_open_easy(
              sodium.from_base64(snapshotKeyBox.ciphertext),
              sodium.from_base64(snapshotKeyBox.nonce),
              sodium.from_base64(
                snapshotKeyBox.creatorDevice.encryptionPublicKey
              ),
              sodium.from_base64(context.device?.encryptionPrivateKey)
            );
            return sodium.to_base64(snapshotKey);
          }
          throw new Error("Snapshot could not be decrypted");
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
