import React, { useContext } from "react";

type PageContext = {
  pageId: string;
};

const pageContext = React.createContext<PageContext>({
  pageId: "",
});

export const PageProvider = pageContext.Provider;

export const usePage = () => {
  return useContext(pageContext);
};
