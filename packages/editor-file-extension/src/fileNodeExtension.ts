import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { File } from "./components/File";
import {
  DownloadAndDecryptFileFunction,
  EncryptAndUploadFunctionFile,
} from "./types";
import { uploadImageProsemirrorPlugin } from "./uploadImageProsemirrorPlugin";

export interface ImageOptions {
  inline: boolean;
  HTMLAttributes: Record<string, any>;
  encryptAndUploadFile: EncryptAndUploadFunctionFile;
  downloadAndDecryptFile: DownloadAndDecryptFileFunction;
}

// declare module "@tiptap/core" {
//   interface Commands<ReturnType> {
//     image: {
//       /**
//        * Add an image
//        */
//       setImage: (options: {
//         src: string;
//         alt?: string;
//         title?: string;
//         width?: number;
//         height?: number;
//         fileInfo?: FileInfo;
//         uploadId?: string;
//       }) => ReturnType;
//     };
//   }
// }

// we can add markdown support later
// export const inputRegex = /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/;

export const FileNodeExtension = Node.create<ImageOptions>({
  name: "file",

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
      encryptAndUploadFile: async () => {
        return { key: "", nonce: "", fileId: "" };
      },
      downloadAndDecryptFile: async () => "",
    };
  },

  inline() {
    // return this.options.inline;
    return false;
  },

  group() {
    // return this.options.inline ? "inline" : "block";
    return "block";
  },

  addStorage() {
    return {
      downloadAndDecryptFile: this.options.downloadAndDecryptFile,
    };
  },

  draggable: true,

  addAttributes() {
    return {
      subtype: {
        default: "file",
      },
      subtypeAttributes: {
        // { src: null, alt: null, title: null, width: null, height: null }
        default: {},
      },
      fileInfo: {
        default: null,
      },
      uploadId: {
        default: null,
      },
    };
  },

  // parseHTML() {
  //   return [{ tag: "img[src]" }];
  // },

  renderHTML({ HTMLAttributes }) {
    // TODO render based on subtype
    // return [
    //   "img",
    //   mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    // ];
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  // addCommands() {
  //   return {
  //     setImage:
  //       (options) =>
  //       ({ commands }) => {
  //         return commands.insertContent({
  //           type: this.name,
  //           attrs: options,
  //         });
  //       },
  //   };
  // },

  addNodeView() {
    return ReactNodeViewRenderer(File);
  },

  addProseMirrorPlugins() {
    return [uploadImageProsemirrorPlugin(this.options.encryptAndUploadFile)];
  },
});
