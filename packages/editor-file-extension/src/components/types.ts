export type State =
  | {
      step: "uploading" | "downloading" | "failedToDecrypt";
      contentAsBase64: null;
    }
  | {
      step: "done";
      contentAsBase64: string;
    };
