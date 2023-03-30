import React from "react";
import { EmptyMessage, TableOfContentButton } from "@serenity-tools/ui";
import { Editor } from "@tiptap/react";

type Props = {
  editor: Editor | null;
};

export default function TableOfContents({ editor }: Props) {
  const content = editor?.getJSON().content || [];

  let isEmpty = true;

  return (
    <>
      {content.map((entry, index) => {
        if (entry.type !== "heading") {
          return null;
        }

        isEmpty = false;

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
      {isEmpty ? (
        <EmptyMessage iconName={"toc-line"}>
          Add Headers to structure your page and easily access certain parts of
          your document.
        </EmptyMessage>
      ) : null}
    </>
  );
}
