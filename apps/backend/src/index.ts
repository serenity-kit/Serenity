require("make-promises-safe"); // installs an 'unhandledRejection' handler
import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from "apollo-server-core";
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { schema } from "./schema";
import { addUpdate, addConnection, removeConnection } from "./store";
import { getDocument } from "./database/getDocument";
import { createDocument } from "./database/createDocument";
import { createSnapshot } from "./database/createSnapshot";
import { createUpdate } from "./database/createUpdate";
import { getUpdatesForDocument } from "./database/getUpdatesForDocument";
import { retryAsyncFunction } from "./retryAsyncFunction";
import {
  NaishoSnapshotMissesUpdatesError,
  NaishoSnapshotBasedOnOutdatedSnapshotError,
  UpdateWithServerData,
} from "@naisho/core";
import sodium from "libsodium-wrappers-sumo";
import createServer from "./createServer";

async function main() {
  const server = await createServer();

  const port = process.env.PORT ? parseInt(process.env.PORT) : 4000;
  server.listen(port, () => {
    console.log(`🚀 App ready at http://localhost:${port}/`);
    console.log(`🚀 GraphQL service ready at http://localhost:${port}/graphql`);
    console.log(`🚀 Websocket service ready at ws://localhost:${port}`);
  });
}

sodium.ready.then(() => {
  main();
});
