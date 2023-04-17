import { Icon } from "@serenity-tools/ui";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import React from "react";

export const TableWrapperView = (props: any) => {
  const [active, setActive] = React.useState(false);

  props.editor.storage.table.setTableActive = setActive;

  return (
    <NodeViewWrapper>
      <div
        onClick={() => {
          return null;
        }}
      >
        <Icon name="arrow-down-filled" /> {active ? "Active" : "Not Active"}
      </div>

      <NodeViewContent
        className={props.extension.options.HTMLAttributes.class}
      />
    </NodeViewWrapper>
  );
};
