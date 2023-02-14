import React, { useContext } from "react";
import { InterpreterFrom } from "xstate";
import { commentsMachine } from "../machines/commentsMachine";

type PageContext = {
  pageId: string;
  commentsService: InterpreterFrom<typeof commentsMachine>;
};

const pageContext = React.createContext<PageContext>({
  pageId: "",
  commentsService: {} as InterpreterFrom<typeof commentsMachine>,
});

export const PageProvider = pageContext.Provider;

export const usePage = () => {
  return useContext(pageContext);
};
