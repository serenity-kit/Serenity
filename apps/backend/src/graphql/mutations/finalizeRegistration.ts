import { arg, inputObjectType, mutationField, objectType } from "nexus";
import { prisma } from "../../database/prisma";

export const ClientOprfRegistrationFinalizeInput = inputObjectType({
  name: "ClientOprfRegistrationFinalizeInput",
  definition(t) {
    t.nonNull.string("username");
    t.nonNull.string("secret");
    t.nonNull.string("nonce");
    t.nonNull.string("clientPublicKey");
  },
});

export const ClientOprfRegistrationFinalizeResult = objectType({
  name: "ClientOprfRegistrationFinalizeResult",
  definition(t) {
    t.nonNull.string("status");
  },
});

export const finalizeRegistration = mutationField("finalizeRegistration", {
  type: ClientOprfRegistrationFinalizeResult,
  args: {
    input: arg({
      type: ClientOprfRegistrationFinalizeInput,
    }),
  },
  async resolve(root, args, context) {
    const username = args?.input?.username;
    const secret = args?.input?.secret;
    const nonce = args?.input?.nonce;
    const clientPublicKey = args?.input?.clientPublicKey;
    if (!username) {
      throw Error('Missing parameter: "secret" must be a string');
    }
    if (!secret) {
      throw Error(
        'Missing parameter: "username" must be a base64-encoded string'
      );
    }
    if (!nonce) {
      throw Error('Missing parameter: "nonce" must be a base64-encoded string');
    }
    if (!clientPublicKey) {
      throw Error(
        'Missing parameter: "clientPublicKey" must be a base64-encoded string'
      );
    }

    // if this user has already completed registration, throw an error
    const existingUserData = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (existingUserData) {
      throw Error("This username has already been registered");
    }
    // try to get the existing registration
    const registrationData = await prisma.registration.findUnique({
      where: {
        username: username,
      },
    });
    if (!registrationData) {
      throw Error("This username has not yet been initialized");
    }
    try {
      await prisma.user.create({
        data: {
          username,
          serverPrivateKey: registrationData.serverPrivateKey,
          serverPublicKey: registrationData.serverPublicKey,
          oprfPrivateKey: registrationData.oprfPrivateKey,
          oprfPublicKey: registrationData.oprfPublicKey,
          oprfCipherText: secret,
          oprfNonce: nonce,
          clientPublicKey,
        },
      });
    } catch (error) {
      console.error("Error saving user");
      console.log(error);
      throw Error("Internal server error");
    }
    const result = {
      status: "success",
    };
    return result;
  },
});
