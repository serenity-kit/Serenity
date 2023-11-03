import Constants from "expo-constants";

// Public keys are generated using opaque.server.getPublicKey
export const getOpaqueServerPublicKey = () => {
  const env = Constants.manifest?.extra?.serenityEnvironment;

  if (env === "e2e") {
    // dev env based on .e2e-tests.env OPAQUE_SERVER_SETUP
    return "-DO080qIlXaaF3rMNlCfu7DJ3yFdeYUkV328WjK2eU0";
  }
  if (env === "staging") {
    return "5MdfeeNFDqw1pHECGKb27eFAB5cQArrKm7piwFDw0x8";
  }
  if (env === "production") {
    return "fESSqCVcW_9ldqfXuToGRGMXLazg8EeiBm-GXROu53I";
  }

  // dev env based on .env.example OPAQUE_SERVER_SETUP
  return "-DO080qIlXaaF3rMNlCfu7DJ3yFdeYUkV328WjK2eU0";
};
