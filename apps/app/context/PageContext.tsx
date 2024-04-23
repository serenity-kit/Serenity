import React, { useContext } from "react";
import { Actor } from "xstate";
import {
  ActiveSnapshot,
  YCommentKeys,
  YCommentReplyKeys,
  commentsMachine,
} from "../machines/commentsMachine";

type PageContext = {
  pageId: string;
  commentsService: Actor<typeof commentsMachine>;
  setActiveSnapshotAndCommentKeys: (params: {
    snapshot: ActiveSnapshot;
    yCommentKeys: YCommentKeys;
    yCommentReplyKeys: YCommentReplyKeys;
  }) => void;
};

const pageContext = React.createContext<PageContext>({
  pageId: "",
  commentsService: {} as Actor<typeof commentsMachine>,
  setActiveSnapshotAndCommentKeys: () => {},
});

export const PageProvider = pageContext.Provider;

export const usePage = () => {
  return useContext(pageContext);
};
