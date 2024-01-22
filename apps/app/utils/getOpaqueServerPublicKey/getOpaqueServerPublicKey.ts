import Constants from "expo-constants";

// Public keys are generated using opaque.server.getPublicKey
export const getOpaqueServerPublicKey = () => {
  const env = Constants.expoConfig?.extra?.serenityEnvironment;

  if (env === "e2e") {
    // dev env based on .e2e-tests.env OPAQUE_SERVER_SETUP
    return "-DO080qIlXaaF3rMNlCfu7DJ3yFdeYUkV328WjK2eU0";
  }
  if (env === "staging") {
    return "GsBeXyb9J1IASavu2mxERltbjNhWWeot_CTUzYzdUWU";
  }
  if (env === "production") {
    return "_DfYX5XE4QhZ-YB5Hw6CdXelZiR7g4gTK-hr1Vcz_EI";
  }

  // dev env based on .env.example OPAQUE_SERVER_SETUP
  return "-DO080qIlXaaF3rMNlCfu7DJ3yFdeYUkV328WjK2eU0";
};
