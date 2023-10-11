import { InvalidAuthorWorkspaceChainError } from "@serenity-kit/workspace-chain";
import { SerenitySnapshotPublicData } from "@serenity-tools/common";
import {
  CreateSnapshotParams,
  CreateUpdateParams,
  GetDocumentParams,
  createWebSocketConnection,
} from "@serenity-tools/secsync";
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
import { getSessionIncludingUser } from "./database/authentication/getSessionIncludingUser";
import { createSnapshot } from "./database/createSnapshot";
import { createUpdate } from "./database/createUpdate";
import { getDocument } from "./database/getDocument";
import { getUpdatesForDocument } from "./database/getUpdatesForDocument";
import { prisma } from "./database/prisma";
import { schema } from "./schema";
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
        } else {
          // currently only used for addDevice mutation after loginFinish mutation
          return {
            authorizationHeader: request.req.headers.authorization,
          };
        }
      }
      return {};
    },
    formatError: (err) => {
      // useful for debugging
      if (process.env.NODE_ENV !== "test") {
        console.error(err);
        console.error(err.extensions?.exception?.stacktrace);
      }
      if (err.originalError instanceof InvalidAuthorWorkspaceChainError) {
        throw new ForbiddenError("Unauthorized");
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

  const allowedList =
    process.env.SERENITY_ENV === "production"
      ? [
          "https://www.serenityapp.page", // production web app
          "serenity-desktop://app", // electron desktop app
        ]
      : [
          "https://www.serenity.li", // staging web app
          "http://localhost:19006", // development & e2e web app
          "http://localhost:4000", // needed for GraphiQL in development
          "http://localhost:4001", // needed for GraphiQL in e2e
          "serenity-desktop://app", // electron desktop app
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
    createWebSocketConnection({
      getDocument: async (params: GetDocumentParams) => {
        return getUpdatesForDocument(params);
      },
      createSnapshot: async (params: CreateSnapshotParams) => {
        let doc = await getDocument(params.snapshot.publicData.docId);
        if (!doc) {
          throw new Error("Document not found");
        }
        // @ts-expect-error TODO fix types via generics in the future
        return createSnapshot({ ...params, workspaceId: doc.doc.workspaceId });
      },
      createUpdate: async (params: CreateUpdateParams) => {
        let doc = await getDocument(params.update.publicData.docId);
        if (!doc) {
          throw new Error("Document not found");
        }
        return createUpdate({ ...params, workspaceId: doc.doc.workspaceId });
      },
      hasAccess: async (params) => {
        if (!params.context.user) {
          return false;
        }

        let doc = await getDocument(params.documentId);
        if (!doc) {
          return false;
        }
        const userToWorkspace = await prisma.usersToWorkspaces.findFirst({
          where: {
            userId: params.context.user.id,
            workspaceId: doc.doc.workspaceId,
            isAuthorizedMember: true,
          },
        });

        if (!userToWorkspace) {
          return false;
        }

        if (
          params.action === "write-update" &&
          (userToWorkspace.role === "ADMIN" ||
            userToWorkspace.role === "EDITOR")
        ) {
          return true;
        }
        if (
          params.action === "write-snapshot" &&
          (userToWorkspace.role === "ADMIN" ||
            userToWorkspace.role === "EDITOR")
        ) {
          return true;
        }
        if (
          params.action === "read" ||
          params.action === "send-ephemeral-update"
        ) {
          return true;
        }

        return false;
      },
      additionalAuthenticationDataValidations: {
        // @ts-ignore works on the ci, but not locally
        snapshot: SerenitySnapshotPublicData,
      },
    })
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
