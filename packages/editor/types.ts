// needed to allow extending the global scope
export {};

type ReactNativeWebView = {
  postMessage: (message: string) => void;
};

declare global {
  interface Window {
    ReactNativeWebView: ReactNativeWebView;
    ydoc: any;
    applyYjsUpdate: (update: any) => void;
  }
}
