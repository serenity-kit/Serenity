import React from "react";
import { TableOfContentButton } from "@serenity-tools/ui";
import { Editor } from "@tiptap/react";

type Props = {
  editor: Editor | null;
};

export default function TableOfContents({ editor }: Props) {
  const content = editor?.getJSON().content || [];

  return (
    <>
      {content.map((entry, index) => {
        if (entry.type !== "heading") {
          return null;
        }
        return (
          <TableOfContentButton lvl={entry.attrs?.level}>
            {entry.content?.map((subEntry, index) => {
              if (subEntry.type !== "text") {
                return null;
              }
              return <>{subEntry.text}</>;
            })}
          </TableOfContentButton>
        );
      })}
    </>
  );
}
