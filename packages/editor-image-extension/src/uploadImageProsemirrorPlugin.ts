import { Plugin } from "prosemirror-state";
import { EncryptAndUploadFunctionFile } from "./types";
import { fileToBase64 } from "./utils/fileToBase64";
import { insertImages } from "./utils/insertImages";
import { updateImageAttributes } from "./utils/updateImageAttributes";

export const uploadImageProsemirrorPlugin = (
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
            const images = Array.from(event.dataTransfer.files).filter((file) =>
              /image/i.test(file.type)
            );
            if (images.length === 0) {
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
              images.map(async (image) => {
                return await fileToBase64(image);
              })
            );

            insertImages({
              filesAsBase64,
              encryptAndUploadFile,
              insertImage: ({ uploadId, width, height }) => {
                const node = view.state.schema.nodes.image.create({
                  uploadId,
                  width,
                  height,
                });
                const transaction = view.state.tr.insert(coordinates.pos, node);
                view.dispatch(transaction);
              },
              updateImageAttributes: (params) => {
                updateImageAttributes({ ...params, view });
              },
            });
          };

          handleDrop();

          return false;
        },
      },
    },
  });
};
