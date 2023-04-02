import { createEphemeralUpdate } from "./ephemeralUpdate";

export const websocketService = (context) => (send, onReceive) => {
  let connected = false;

  // timeout the connection try after 5 seconds
  setTimeout(() => {
    if (!connected) {
      send({ type: "WEBSOCKET_DISCONNECTED" });
    }
  }, 5000);

  const websocketConnection = new WebSocket(
    `${context.websocketHost}/${context.documentId}?sessionKey=${context.websocketSessionKey}`
  );

  const onWebsocketMessage = async (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case "documentNotFound":
        // TODO stop reconnecting
        send({ type: "WEBSOCKET_DOCUMENT_NOT_FOUND" });
        break;
      case "unauthorized":
        // TODO stop reconnecting
        send({ type: "UNAUTHORIZED" });
        break;
      default:
        send({ type: "WEBSOCKET_ADD_TO_QUEUE", data });
    }
  };

  websocketConnection.addEventListener("message", onWebsocketMessage);

  websocketConnection.addEventListener("open", (event) => {
    connected = true;
    send({ type: "WEBSOCKET_CONNECTED", websocket: websocketConnection });
  });

  websocketConnection.addEventListener("error", (event) => {
    console.log("websocket error", event);
    send({ type: "WEBSOCKET_DISCONNECTED" });
  });

  websocketConnection.addEventListener("close", function (event) {
    console.log("websocket closed");
    send({ type: "WEBSOCKET_DISCONNECTED" });
    // remove the awareness states of everyone else
    // removeAwarenessStates(
    //   yAwarenessRef.current,
    //   Array.from(yAwarenessRef.current.getStates().keys()).filter(
    //     (client) => client !== yDocRef.current.clientID
    //   ),
    //   "TODOprovider"
    // );
  });

  onReceive((event) => {
    if (event.type === "SEND") {
      websocketConnection.send(event.message);
    }
    if (event.type === "SEND_EPHEMERAL_UPDATE") {
      const prepareAndSendEphemeralUpdate = async () => {
        const publicData = {
          docId: context.documentId,
          pubKey: context.sodium.to_base64(context.signatureKeyPair.publicKey),
        };
        const ephemeralUpdateKey = await event.getEphemeralUpdateKey();
        const ephemeralUpdate = createEphemeralUpdate(
          event.data,
          publicData,
          ephemeralUpdateKey,
          context.signatureKeyPair
        );
        console.log("send ephemeralUpdate");
        send({ type: "SEND", message: JSON.stringify(ephemeralUpdate) });
      };

      try {
        prepareAndSendEphemeralUpdate();
      } catch (error) {
        // TODO send a error event to the parent
        console.error(error);
      }
    }
  });

  return () => {
    // TODO remove event listeners? is this necessary?
    console.log("CLOSE WEBSOCKET");
    websocketConnection.close();
  };
};
