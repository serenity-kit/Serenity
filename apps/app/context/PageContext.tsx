import React, { useContext } from "react";
import { InterpreterFrom } from "xstate";
import { commentsSidebarMachine } from "../machines/commentsMachine";

type PageContext = {
  pageId: string;
  commentsService: InterpreterFrom<typeof commentsSidebarMachine>;
};

const pageContext = React.createContext<PageContext>({
  pageId: "",
  commentsService: {} as InterpreterFrom<typeof commentsSidebarMachine>,
});

export const PageProvider = pageContext.Provider;

export const usePage = () => {
  return useContext(pageContext);
};
