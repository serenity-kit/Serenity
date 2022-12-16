import { Node } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import { UpdateFileAttributesParams } from "../types";

const getFilePositionByUploadId = (uploadId: string, view: EditorView) => {
  const positions: Array<{ node: Node; pos: number }> = [];
  view.state.doc.descendants((node, pos) => {
    if (node.type.name === "file" && node.attrs.uploadId === uploadId) {
      positions.push({ node, pos });
    }
  });

  if (positions.length === 0) {
    return null;
  }

  return positions[0];
};

export const updateFileAttributes = ({
  uploadId,
  fileInfo,
  view,
}: UpdateFileAttributesParams & { view: EditorView }) => {
  const filePosition = getFilePositionByUploadId(uploadId, view);
  if (!filePosition) {
    return; // was already remove
  }
  const fileInfoTransaction = view.state.tr.setNodeAttribute(
    filePosition.pos,
    "fileInfo",
    fileInfo
  );
  view.dispatch(fileInfoTransaction);
};
