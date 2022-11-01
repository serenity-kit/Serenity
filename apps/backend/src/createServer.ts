import {
  NaishoSnapshotBasedOnOutdatedSnapshotError,
  NaishoSnapshotMissesUpdatesError,
  UpdateWithServerData,
} from "@naisho/core";
import {
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import {
  ApolloServer,
  AuthenticationError,
  ForbiddenError,
  SyntaxError,
  UserInputError,
  ValidationError,
} from "apollo-server-express";
import cors from "cors";
import express from "express";
import { createServer as httpCreateServer } from "http";
import { WebSocketServer } from "ws";
import { getSessionIncludingUser } from "./database/authentication/getSessionIncludingUser";
import { createSnapshot } from "./database/createSnapshot";
import { createUpdate } from "./database/createUpdate";
import { getDocument } from "./database/getDocument";
import { getUpdatesForDocument } from "./database/getUpdatesForDocument";
import { retryAsyncFunction } from "./retryAsyncFunction";
import { schema } from "./schema";
import { addConnection, addUpdate, removeConnection } from "./store";
import { KeyDerivationTrace } from "./types/folder";
import { ExpectedGraphqlError } from "./utils/expectedGraphqlError/expectedGraphqlError";

export default async function createServer() {
  const apolloServer = new ApolloServer({
    schema,
    plugins: [
      process.env.NODE_ENV === "production"
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
    context: async (request) => {
      if (request.req.headers.authorization) {
        const session = await getSessionIncludingUser({
          sessionKey: request.req.headers.authorization,
        });
        if (session && session.user) {
          return {
            session,
            user: session.user,
            assertValidDeviceSigningPublicKeyForThisSession: (
              deviceSigningPublicKey: string
            ) => {
              if (
                deviceSigningPublicKey !== session.deviceSigningPublicKey &&
                deviceSigningPublicKey !==
                  session.user.mainDeviceSigningPublicKey
              ) {
                throw new Error(
                  "Invalid deviceSigningPublicKey for this session"
                );
              }
            },
          };
        }
      }
      return {};
    },
    formatError: (err) => {
      // useful for debugging
      // console.error(err);
      if (
        err.originalError instanceof AuthenticationError ||
        err.originalError instanceof ForbiddenError ||
        err.originalError instanceof ExpectedGraphqlError ||
        // need to cover built in and manual thrown errors
        err.originalError instanceof SyntaxError ||
        err instanceof SyntaxError ||
        err.originalError instanceof ValidationError ||
        err instanceof ValidationError ||
        err.originalError instanceof UserInputError ||
        err instanceof UserInputError
      ) {
        return err;
      }

      return new Error("Internal server error");
    },
    mocks: process.env.MOCK_GRAPHQL
      ? {
          // should be unique for all the IDs and keys
          String: () => (Math.random() + 1).toString(36).substring(2),
        }
      : false,
  });
  await apolloServer.start();

  // Note: on staging we also want the dev setup to be able to connect
  const allowedList = [
    "https://www.serenity.li", // production web app
    "http://localhost:19006", // development web app
    "http://localhost:3000", // e2e web app
    "http://localhost:4000", // needed for GraphiQL in development
    "http://localhost:4001", // needed for GraphiQL in e2e
  ];
  const allowedOrigin = (origin, callback) => {
    if (allowedList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  };
  const corsOptions = { credentials: true, origin: allowedOrigin };
  const app = express();
  app.use(cors(corsOptions));
  apolloServer.applyMiddleware({ app, cors: corsOptions });

  const server = httpCreateServer(app);

  const webSocketServer = new WebSocketServer({ noServer: true });
  webSocketServer.on(
    "connection",
    async function connection(connection, request) {
      // unique id for each client connection

      console.log("connected");

      const documentId = request.url?.slice(1)?.split("?")[0] || "";

      let doc = await getDocument(documentId);
      if (!doc) {
        // TODO close connection properly
        connection.send(JSON.stringify({ type: "documentNotFound" }));
        connection.close();
        return;
      }
      addConnection(documentId, connection);
      connection.send(JSON.stringify({ type: "document", ...doc }));

      connection.on("message", async function message(messageContent) {
        const data = JSON.parse(messageContent.toString());

        if (data?.publicData?.snapshotId) {
          try {
            const activeSnapshotInfo =
              data.lastKnownSnapshotId && data.latestServerVersion
                ? {
                    latestVersion: data.latestServerVersion,
                    snapshotId: data.lastKnownSnapshotId,
                  }
                : undefined;
            // NOTE: this is a bit of a hack.
            // The server doesn't have access to the client's private data
            // so it can't create a "real" key derivation trace.
            // so instead we copy the parent folder's key derivation trace from the client
            const snapshotKeyDerivationTrace = doc?.parentFolder
              .keyDerivationTrace as KeyDerivationTrace;
            const snapshot = await createSnapshot(
              data,
              snapshotKeyDerivationTrace,
              activeSnapshotInfo
            );
            console.log("addUpdate snapshot");
            connection.send(
              JSON.stringify({
                type: "snapshotSaved",
                snapshotId: snapshot.id,
                docId: snapshot.documentId,
              })
            );
            addUpdate(
              documentId,
              {
                ...data,
                type: "snapshot",
                serverData: {
                  latestVersion: snapshot.latestVersion,
                },
              },
              connection
            );
          } catch (error) {
            if (error instanceof NaishoSnapshotBasedOnOutdatedSnapshotError) {
              let doc = await getDocument(documentId);
              if (!doc) return; // should never be the case?
              connection.send(
                JSON.stringify({
                  type: "snapshotFailed",
                  docId: data.publicData.docId,
                  snapshot: doc.snapshot,
                  updates: doc.updates,
                })
              );
            } else if (error instanceof NaishoSnapshotMissesUpdatesError) {
              const result = await getUpdatesForDocument(
                documentId,
                data.lastKnownSnapshotId,
                data.latestServerVersion
              );
              connection.send(
                JSON.stringify({
                  type: "snapshotFailed",
                  docId: data.publicData.docId,
                  updates: result.updates,
                })
              );
            } else {
              console.error(error);
              connection.send(
                JSON.stringify({
                  type: "snapshotFailed",
                })
              );
            }
          }
        } else if (data?.publicData?.refSnapshotId) {
          let savedUpdate: undefined | UpdateWithServerData = undefined;
          try {
            // const random = Math.floor(Math.random() * 10);
            // if (random < 8) {
            //   throw new Error("CUSTOM ERROR");
            // }

            // TODO add a smart queue to create an offset based on the version?
            savedUpdate = await retryAsyncFunction(() => createUpdate(data));
            if (savedUpdate === undefined) {
              throw new Error("Update could not be saved.");
            }

            connection.send(
              JSON.stringify({
                type: "updateSaved",
                docId: data.publicData.docId,
                snapshotId: data.publicData.refSnapshotId,
                clock: data.publicData.clock,
                // @ts-expect-error not sure why savedUpdate is "never"
                serverVersion: savedUpdate.version,
              })
            );
            console.log("addUpdate update");
            addUpdate(
              documentId,
              // @ts-expect-error not sure why savedUpdate is "never"
              { ...savedUpdate, type: "update" },
              connection
            );
          } catch (err) {
            if (savedUpdate === null || savedUpdate === undefined) {
              connection.send(
                JSON.stringify({
                  type: "updateFailed",
                  docId: data.publicData.docId,
                  snapshotId: data.publicData.refSnapshotId,
                  clock: data.publicData.clock,
                })
              );
            }
          }
        } else {
          console.log("addUpdate awarenessUpdate");
          addUpdate(
            documentId,
            { ...data, type: "awarenessUpdate" },
            connection
          );
        }
      });

      connection.on("close", function () {
        console.log("close connection");
        removeConnection(documentId, connection);
      });
    }
  );

  server.on("upgrade", (request, socket, head) => {
    // @ts-ignore
    webSocketServer.handleUpgrade(request, socket, head, (ws) => {
      webSocketServer.emit("connection", ws, request);
    });
  });

  return server;
}
