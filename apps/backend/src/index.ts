require("make-promises-safe"); // installs an 'unhandledRejection' handler
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
