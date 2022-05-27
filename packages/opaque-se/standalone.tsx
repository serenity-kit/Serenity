import "core-js/stable";
import "regenerator-runtime/runtime";

alert("234");

window.registerInitialize = async function (id: string, password: string) {
  alert("registerInitialize called");
  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      id,
      result: "lalalala",
    })
  );
};
