import { Icon } from "@serenity-tools/ui";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import React from "react";

export const Table = (props: any) => {
  const [active, setActive] = React.useState(false);

  props.editor.storage.table.setTableActive = setActive;

  return (
    <NodeViewWrapper className={"table-wrapper"}>
      <NodeViewContent
        className={props.extension.options.HTMLAttributes.class}
        as="table"
      />
      <div
        onClick={() => {
          return null;
        }}
      >
        <Icon name="arrow-down-filled" /> {active ? "Active" : "Not Active"}
      </div>
      <div className="add add-column flex-center-center">+</div>
      <div className="add add-row flex-center-center">+</div>
      <div className="row-line hidden" id="row-line"></div>
      <div className="column-line hidden" id="column-line"></div>
      <div className="table-selection hidden" id="table-selection"></div>
    </NodeViewWrapper>
  );
};
