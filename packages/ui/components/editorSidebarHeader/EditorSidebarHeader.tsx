import React from "react";
import { tw } from "../../tailwind";
import { View, ViewProps } from "../view/View";

export type EditorSidebarHeaderProps = ViewProps & {};

export const EditorSidebarHeader = React.forwardRef(
  (props: EditorSidebarHeaderProps, ref) => {
    return (
      <View
        {...props}
        style={[
          tw`flex-row items-center h-editor-sidebar-header px-4 border-b border-gray-200`,
          props.style,
        ]}
      />
    );
  }
);
