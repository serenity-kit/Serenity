import { Platform } from "react-native";
import { isElectron } from "../setupElectronInterface/electronInterface";

let os: "electron" | "web" | "ios" | "android" | "unknown" = "unknown";
if (Platform.OS === "web") {
  if (isElectron()) {
    os = "electron";
  } else {
    os = "web";
  }
}
if (Platform.OS === "ios") {
  os = "ios";
}
if (Platform.OS === "android") {
  os = "android";
}

export const OS = os;
