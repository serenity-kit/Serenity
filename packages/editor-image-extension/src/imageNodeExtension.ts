import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Image } from "./Image";
import {
  DownloadAndDecryptFileFunction,
  EncryptAndUploadFunction,
  FileInfo,
} from "./types";
import { uploadImageProsemirrorPlugin } from "./uploadImageProsemirrorPlugin";

export interface ImageOptions {
  inline: boolean;
  HTMLAttributes: Record<string, any>;
  encryptAndUpload: EncryptAndUploadFunction;
  downloadAndDecryptFile: DownloadAndDecryptFileFunction;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    image: {
      /**
       * Add an image
       */
      setImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        width?: number;
        height?: number;
        fileInfo?: FileInfo;
        uploadId?: string;
      }) => ReturnType;
    };
  }
}

// we can add markdown support later
// export const inputRegex = /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/;

export const ImageNodeExtension = Node.create<ImageOptions>({
  name: "image",

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
      encryptAndUpload: async () => {
        return { key: "", nonce: "", fileId: "" };
      },
      downloadAndDecryptFile: async () => "",
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? "inline" : "block";
  },

  addStorage() {
    return {
      downloadAndDecryptFile: this.options.downloadAndDecryptFile,
    };
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
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
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(Image);
  },

  addProseMirrorPlugins() {
    return [uploadImageProsemirrorPlugin(this.options.encryptAndUpload)];
  },
});
