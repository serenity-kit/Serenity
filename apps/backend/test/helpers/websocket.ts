import { WebSocket } from "ws";

export async function waitForInitialConnection(
  client: WebSocket,
  timeoutInMilliseconds = 500
) {
  if (timeoutInMilliseconds < 0) {
    throw new Error("waitForClientState Timeout");
  }
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (client.readyState !== WebSocket.CONNECTING) {
        resolve(undefined);
      } else {
        waitForInitialConnection(client, timeoutInMilliseconds - 10).then(
          resolve
        );
      }
    }, 10);
  });
}

export async function waitForClientState(
  client: WebSocket,
  expectedState: WebSocket["readyState"],
  timeoutInMilliseconds = 500
) {
  if (timeoutInMilliseconds < 0) {
    throw new Error("waitForClientState Timeout");
  }
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      if (client.readyState === expectedState) {
        resolve(undefined);
      } else {
        waitForClientState(client, expectedState, timeoutInMilliseconds - 10)
          .then(resolve)
          .catch(reject);
      }
    }, 10);
  });
}

export async function createSocketClient(
  port: number,
  path: string,
  closeAfter: number
) {
  const client = new WebSocket(`ws://localhost:${port}${path}`);
  const messages: any = [];
  client.addEventListener("message", (event) => {
    const data = JSON.parse(event.data as string);
    messages.push(data);
    if (messages.length === closeAfter) {
      client.close();
    }
  });
  await waitForInitialConnection(client);
  return { client, messages };
}
