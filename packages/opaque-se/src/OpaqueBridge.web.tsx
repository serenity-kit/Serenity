// We weren't able to get wasm working in Expo web.
// This is a workaround where we compile a lib exposing
// the necessary functions to a script an then re-using them.
const opaqueScript = document.createElement("script");
opaqueScript.setAttribute("src", "/opaque-web-script.js");
document.head.appendChild(opaqueScript);

export default function OpaqueBridge() {
  return null;
}
