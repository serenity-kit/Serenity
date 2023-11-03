import Constants from "expo-constants";

// Public keys are generated using opaque.server.getPublicKey
export const getOpaqueServerPublicKey = () => {
  const env = Constants.manifest?.extra?.serenityEnvironment;

  if (env === "e2e") {
    // dev env based on .e2e-tests.env OPAQUE_SERVER_SETUP
    return "-DO080qIlXaaF3rMNlCfu7DJ3yFdeYUkV328WjK2eU0";
  }
  if (env === "staging") {
    return "UtLfNRuDs2yLQF7bY1P2DYTO_B6F7M5igAnyOhG0sUA";
  }
  if (env === "production") {
    return "fESSqCVcW_9ldqfXuToGRGMXLazg8EeiBm-GXROu53I";
  }

  // dev env based on .env.example OPAQUE_SERVER_SETUP
  return "-DO080qIlXaaF3rMNlCfu7DJ3yFdeYUkV328WjK2eU0";
};
