import { WebViewSource } from "react-native-webview/lib/WebViewTypes";

// We weren't able to get wasm working in Expo web.
// This is a workaround where we compile a lib exposing
// the necessary functions to a script an then re-using them.
const opaqueScript = document.createElement("script");
// a ./ prefix is required to make it work with Electron where the scripts are served locally
opaqueScript.setAttribute("src", "./opaque-web-script.js");
document.head.appendChild(opaqueScript);

export default function OpaqueBridge({ source }: { source: WebViewSource }) {
  return null;
}
