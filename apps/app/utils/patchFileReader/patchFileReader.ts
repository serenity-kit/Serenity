import { decode } from "base-64"; // libsodium also provides the functionality and we could switch over to it in this case
import { Platform } from "react-native";

// needed to do response.arrayBuffer in
//
// const response = await fetch(result.data?.fileUrl.downloadUrl);
// const arrayBuffer = await response.arrayBuffer();
//
// see https://github.com/facebook/react-native/issues/21209#issuecomment-495294672
export const patchFileReader = () => {
  if (Platform.OS !== "web") {
    FileReader.prototype.readAsArrayBuffer = function (blob) {
      if (this.readyState === this.LOADING)
        throw new Error("InvalidStateError");
      this._setReadyState(this.LOADING);
      this._result = null;
      this._error = null;
      const fr = new FileReader();
      fr.onloadend = () => {
        const content = decode(
          // @ts-ignore
          fr.result.substr("data:application/octet-stream;base64,".length)
        );
        const buffer = new ArrayBuffer(content.length);
        const view = new Uint8Array(buffer);
        view.set(Array.from(content).map((c) => c.charCodeAt(0)));
        this._result = buffer;
        this._setReadyState(this.DONE);
      };
      fr.readAsDataURL(blob);
    };
  }
};
