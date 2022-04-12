import "./editor-output.css";
import "./awareness.css";
import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { EditorWrapperView, View } from "@serenity-tools/ui";
import StarterKit from "@tiptap/starter-kit";
import { Level } from "@tiptap/extension-heading";
import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import { AwarnessExtension } from "./naisho-awareness-extension";
import EditorButton from "./components/editorButton/EditorButton";

type EditorProps = {
  yDocRef: React.MutableRefObject<Y.Doc>;
  yAwarenessRef?: React.MutableRefObject<Awareness>;
};

const headingLevels: Level[] = [1, 2, 3];

export const Editor = (props: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // the Collaboration extension comes with its own history handling
        history: false,
        heading: {
          levels: headingLevels,
        },
      }),
      // register the ydoc with Tiptap
      Collaboration.configure({
        document: props.yDocRef.current,
        field: "page",
      }),
      AwarnessExtension.configure({ awareness: props.yAwarenessRef?.current }),
    ],
  });

  return (
    <EditorWrapperView>
      <View>
        <div>
          {headingLevels.map((lvl) => {
            return (
              <EditorButton
                key={lvl}
                onClick={() =>
                  editor?.chain().focus().toggleHeading({ level: lvl }).run()
                }
                isActive={editor?.isActive("heading", { level: lvl }) || false}
              >
                H{lvl}
              </EditorButton>
            );
          })}

          <EditorButton
            onClick={() => editor?.chain().focus().toggleCode().run()}
            isActive={editor?.isActive("code") || false}
          >
            C
          </EditorButton>
          <EditorButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            isActive={editor?.isActive("bold") || false}
          >
            B
          </EditorButton>
        </div>
      </View>
      <div className="">
        <EditorContent editor={editor} />
      </div>
    </EditorWrapperView>
  );
};
