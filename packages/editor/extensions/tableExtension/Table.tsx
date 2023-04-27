import { Icon } from "@serenity-tools/ui";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import React from "react";

export const Table = (props: any) => {
  const [active, setActive] = React.useState(false);

  props.editor.storage.table.setTableActive = setActive;

  return (
    <NodeViewWrapper>
      <NodeViewContent
        className={props.extension.options.HTMLAttributes.class}
        as="table"
      />
      {/* <div
        onClick={() => {
          return null;
        }}
      >
        <Icon name="arrow-down-filled" /> {active ? "Active" : "Not Active"}
      </div> */}
      <div className="add add-column">
        <Icon name="add-line" color="gray-600" />
      </div>
      <div className="add add-row">
        <Icon name="add-line" color="gray-600" />
      </div>
      <div className="row-line hidden"></div>
      <div className="column-line hidden"></div>
      <div className="table-selection hidden"></div>
      <div className="mark-table"></div>
    </NodeViewWrapper>
  );
};
