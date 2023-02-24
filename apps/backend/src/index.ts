require("make-promises-safe"); // installs an 'unhandledRejection' handler
import sodium from "libsodium-wrappers";
import createServer from "./createServer";

console.log(`SERENITY_ENV: ${process.env.SERENITY_ENV}`);

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
