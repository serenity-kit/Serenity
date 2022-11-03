import { Node } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import { UpdateImageAttributesParams } from "../types";

const getImagePositionByUploadId = (uploadId: string, view: EditorView) => {
  const positions: Array<{ node: Node; pos: number }> = [];
  view.state.doc.descendants((node, pos) => {
    if (node.type.name === "image" && node.attrs.uploadId === uploadId) {
      positions.push({ node, pos });
    }
  });

  if (positions.length === 0) {
    return null;
  }

  return positions[0];
};

export const updateImageAttributes = ({
  uploadId,
  fileInfo,
  view,
}: UpdateImageAttributesParams & { view: EditorView }) => {
  const imagePosition = getImagePositionByUploadId(uploadId, view);
  if (!imagePosition) {
    return; // was already remove
  }
  const fileInfoTransaction = view.state.tr.setNodeAttribute(
    imagePosition.pos,
    "fileInfo",
    fileInfo
  );
  view.dispatch(fileInfoTransaction);
};
