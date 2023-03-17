import {
  NaishoNewSnapshotWithKeyRotationRequired,
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
import { URLSearchParams } from "url";
import { WebSocketServer } from "ws";
import { Role } from "../prisma/generated/output";
import { getSessionIncludingUser } from "./database/authentication/getSessionIncludingUser";
import { createSnapshot } from "./database/createSnapshot";
import { createUpdate } from "./database/createUpdate";
import { getDocument } from "./database/getDocument";
import { getUpdatesForDocument } from "./database/getUpdatesForDocument";
import { prisma } from "./database/prisma";
import { retryAsyncFunction } from "./retryAsyncFunction";
import { schema } from "./schema";
import { addConnection, addUpdate, removeConnection } from "./store";
import { ExpectedGraphqlError } from "./utils/expectedGraphqlError/expectedGraphqlError";

export default async function createServer() {
  const apolloServer = new ApolloServer({
    schema,
    plugins: [
      process.env.NODE_ENV === "production"
        ? ApolloServerPluginLandingPageDisabled()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
    persistedQueries: false, // to prevent denial of service attacks via memory exhaustion
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
      if (process.env.NODE_ENV !== "test") {
        console.error(err);
      }
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
    "http://localhost:19006", // development & e2e web app
    "http://localhost:4000", // needed for GraphiQL in development
    "http://localhost:4001", // needed for GraphiQL in e2e
    "serenity-desktop://app", // desktop app
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
    async function connection(connection, request, context) {
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

      if (!context.user) {
        // TODO close connection properly
        connection.send(JSON.stringify({ type: "unauthorized" }));
        connection.close();
        return;
      }

      // if the user doesn't have access to the workspace,
      // throw an error
      const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
        where: {
          userId: context.user.id,
          workspaceId: doc.doc.workspaceId,
          isAuthorizedMember: true,
        },
      });
      if (!userToWorkspace) {
        // TODO close connection properly
        connection.send(JSON.stringify({ type: "unauthorized" }));
        connection.close();
        return;
      }

      addConnection(documentId, connection);
      connection.send(JSON.stringify({ type: "document", ...doc }));

      connection.on("message", async function message(messageContent) {
        // messages from non-authorized users (viewer & commenters) are ignored
        if (
          userToWorkspace.role !== Role.ADMIN &&
          userToWorkspace.role !== Role.EDITOR
        ) {
          return;
        }

        const data = JSON.parse(messageContent.toString());

        // new snapshot
        if (data?.publicData?.snapshotId) {
          try {
            const activeSnapshotInfo =
              data.lastKnownSnapshotId && data.latestServerVersion
                ? {
                    latestVersion: data.latestServerVersion,
                    snapshotId: data.lastKnownSnapshotId,
                  }
                : undefined;
            const snapshot = await createSnapshot({
              snapshot: data,
              activeSnapshotInfo,
              workspaceId: userToWorkspace.workspaceId,
            });
            console.log("add snapshot");
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
              // log in case it's an unexpected error
              if (
                !(error instanceof NaishoNewSnapshotWithKeyRotationRequired)
              ) {
                console.error(error);
              }
              connection.send(
                JSON.stringify({
                  type: "snapshotFailed",
                })
              );
            }
          }
          // new update
        } else if (data?.publicData?.refSnapshotId) {
          let savedUpdate: undefined | UpdateWithServerData = undefined;
          try {
            // const random = Math.floor(Math.random() * 10);
            // if (random < 8) {
            //   throw new Error("CUSTOM ERROR");
            // }

            // TODO add a smart queue to create an offset based on the version?
            savedUpdate = await retryAsyncFunction(
              () =>
                createUpdate({
                  update: data,
                  workspaceId: userToWorkspace.workspaceId,
                }),
              [NaishoNewSnapshotWithKeyRotationRequired]
            );
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
                serverVersion: savedUpdate.serverData.version,
              })
            );
            console.log("add update");
            addUpdate(
              documentId,
              // @ts-expect-error not sure why savedUpdate is "never"
              { ...savedUpdate, type: "update" },
              connection
            );
          } catch (err) {
            console.log("update failed", err);
            if (savedUpdate === null || savedUpdate === undefined) {
              connection.send(
                JSON.stringify({
                  type: "updateFailed",
                  docId: data.publicData.docId,
                  snapshotId: data.publicData.refSnapshotId,
                  clock: data.publicData.clock,
                  requiresNewSnapshotWithKeyRotation:
                    err instanceof NaishoNewSnapshotWithKeyRotationRequired,
                })
              );
            }
          }
          // new ephemeral update
        } else {
          console.log("add ephemeralUpdate");
          // TODO check if user still has access to the document
          addUpdate(
            documentId,
            { ...data, type: "ephemeralUpdate" },
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

  server.on("upgrade", async (request, socket, head) => {
    let context = {};
    const queryStartPos = (request.url || "").indexOf("?");
    if (queryStartPos !== -1) {
      const queryString = request.url?.slice(queryStartPos + 1);
      const queryParameters = new URLSearchParams(queryString);
      const sessionKey = queryParameters.get("sessionKey");
      if (sessionKey) {
        const session = await getSessionIncludingUser({
          sessionKey,
        });
        if (session && session.user) {
          context = {
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
    }

    webSocketServer.handleUpgrade(request, socket, head, (ws) => {
      webSocketServer.emit("connection", ws, request, context);
    });
  });

  return server;
}
