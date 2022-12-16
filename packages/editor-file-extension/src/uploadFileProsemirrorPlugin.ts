import { Plugin } from "prosemirror-state";
import { EncryptAndUploadFunctionFile, FileNodeAttributes } from "./types";
import { fileToBase64 } from "./utils/fileToBase64";
import { insertFiles } from "./utils/insertFiles";
import { insertImages } from "./utils/insertImages";
import { updateFileAttributes } from "./utils/updateFileAttributes";

export const uploadFileProsemirrorPlugin = (
  encryptAndUploadFile: EncryptAndUploadFunctionFile
) => {
  return new Plugin({
    props: {
      handleDOMEvents: {
        drop(view, event) {
          const handleDrop = async () => {
            const hasFiles = event.dataTransfer?.files?.length;
            if (!hasFiles) {
              return false;
            }

            // check for if the files are images
            const files = Array.from(event.dataTransfer.files).map((file) => {
              return {
                type: /image/i.test(file.type) ? "image" : "file",
                file,
              };
            });

            if (files.length === 0) {
              return false;
            }

            event.preventDefault();

            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });
            if (!coordinates) {
              console.error("ImageExtension: no coordinates found");
              return false;
            }

            const filesAsBase64 = await Promise.all(
              files.map(async (file) => {
                const fileAsBase64 = await fileToBase64(file.file);
                return {
                  detectedType: file.type,
                  fileAsBase64,
                  fileName: file.file.name,
                  fileSize: file.file.size,
                  mimeType: file.file.type,
                };
              })
            );

            filesAsBase64.forEach((fileAsBase64) => {
              if (fileAsBase64.detectedType === "image") {
                insertImages({
                  filesWithBase64Content: [
                    {
                      content: fileAsBase64.fileAsBase64,
                      mimeType: fileAsBase64.mimeType,
                    },
                  ],
                  encryptAndUploadFile,
                  insertImage: ({ uploadId, width, height, mimeType }) => {
                    const attrs: FileNodeAttributes = {
                      subtype: "image",
                      uploadId,
                      subtypeAttributes: {
                        width,
                        height,
                      },
                      mimeType,
                    };
                    const node = view.state.schema.nodes.file.create(attrs);
                    const transaction = view.state.tr.insert(
                      coordinates.pos,
                      node
                    );
                    view.dispatch(transaction);
                  },
                  updateFileAttributes: (params) => {
                    updateFileAttributes({ ...params, view });
                  },
                });
              } else {
                insertFiles({
                  filesWithBase64Content: [
                    {
                      content: fileAsBase64.fileAsBase64,
                      name: fileAsBase64.fileName,
                      size: fileAsBase64.fileSize,
                      mimeType: fileAsBase64.mimeType,
                    },
                  ],
                  encryptAndUploadFile,
                  insertFile: ({ uploadId, fileName, fileSize, mimeType }) => {
                    const attrs: FileNodeAttributes = {
                      subtype: "file",
                      uploadId,
                      subtypeAttributes: {
                        fileName,
                        fileSize,
                      },
                      mimeType,
                    };
                    const node = view.state.schema.nodes.file.create(attrs);
                    const transaction = view.state.tr.insert(
                      coordinates.pos,
                      node
                    );
                    view.dispatch(transaction);
                  },
                  updateFileAttributes: (params) => {
                    updateFileAttributes({ ...params, view });
                  },
                });
              }
            });
          };

          handleDrop();

          return false;
        },
      },
    },
  });
};
