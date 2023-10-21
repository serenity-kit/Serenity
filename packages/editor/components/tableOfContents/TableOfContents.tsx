import { EmptyMessage, TableOfContentButton, tw } from "@serenity-tools/ui";
import { Editor } from "@tiptap/react";
import canonicalize from "canonicalize";
import React, { Fragment } from "react";

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
          <TableOfContentButton
            lvl={entry.attrs?.level}
            // canonicalize creates stable results compared to JSON.stringify
            key={`${canonicalize(entry.attrs)}-${index}`}
          >
            {entry.content?.map((subEntry, index) => {
              if (subEntry.type !== "text") {
                return null;
              }
              return (
                <Fragment key={`${subEntry}-${index}`}>
                  {subEntry.text}
                </Fragment>
              );
            })}
          </TableOfContentButton>
        );
      })}
      {isEmpty ? (
        <EmptyMessage iconName={"toc-line"} style={tw`pt-0`}>
          Add Headers to structure your page and easily access certain parts of
          your document.
        </EmptyMessage>
      ) : null}
    </>
  );
}
