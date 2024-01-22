import Constants from "expo-constants";
import { Platform } from "react-native";

export const getEnvironmentUrls = () => {
  const env = Constants.expoConfig?.extra?.serenityEnvironment;

  let websocketOrigin = "ws://localhost:4000";
  let graphqlEndpoint = "http://localhost:4000/graphql";
  let frontendOrigin =
    Platform.OS === "web"
      ? `http://${window.location.host}`
      : `http://localhost:19006`; // on iOS window.location.host is not available

  if (env === "e2e") {
    websocketOrigin = "ws://localhost:4001";
    graphqlEndpoint = "http://localhost:4001/graphql";
  }
  if (env === "staging") {
    websocketOrigin = "wss://serenity-api-staging.fly.dev";
    graphqlEndpoint = "https://serenity-api-staging.fly.dev/graphql";
    frontendOrigin = "https://www.serenity.li";
  }
  if (env === "production") {
    websocketOrigin = "wss://serenityapi.app";
    graphqlEndpoint = "https://serenityapi.app/graphql";
    frontendOrigin = "https://www.serenityapp.page";
  }

  return { websocketOrigin, frontendOrigin, graphqlEndpoint };
};
