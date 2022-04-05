import "./editor-output.css";
import "./awareness.css";
import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { EditorWrapperView, tw, View } from "@serenity-tools/ui";
import StarterKit from "@tiptap/starter-kit";
import { Level } from "@tiptap/extension-heading"
import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import { AwarnessExtension } from "./naisho-awareness-extension";

type EditorProps = {
  yDocRef: React.MutableRefObject<Y.Doc>;
  yAwarenessRef?: React.MutableRefObject<Awareness>;
};

const headingLevels: Level[] = [1, 2, 3];
const editorButtonClasses = 'flex-none items-center justify-center w-6 h-6 text-[12px] border-solid border-2 border-gray-200 rounded bg-gray-100 font-bold';
const editorButtonClassesActive = 'bg-primary-400';

export const Editor = (props: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // the Collaboration extension comes with its own history handling
        history: false,
        heading: {
          levels: headingLevels
        }
      }),
      // register the ydoc with Tiptap
      Collaboration.configure({
        document: props.yDocRef.current,
        field: "page",
      }),
      AwarnessExtension.configure({ awareness: props.yAwarenessRef?.current }),
    ],
  });
  
  function buttonFoo(click: Function, isActive: Boolean, name: String) {
    return (
      <button
         onClick={() => click()}
         style={tw.style(editorButtonClasses, (isActive ? editorButtonClassesActive : ''))}
         key={`${name}`}
       >
        {name}
       </button>
     )
  }

  const headingButtons = headingLevels.map( lvl => {
    return (
      buttonFoo(
        () => editor?.chain().focus().toggleHeading({ level: lvl }).run(),
        editor?.isActive('heading', { level: lvl }) || false,
        `H${lvl}`
      )
    )
  })

  return (
    <EditorWrapperView>
      <View>
        <div>
          { headingButtons }
          { buttonFoo(
              () => editor?.chain().focus().toggleCode().run(),
              editor?.isActive('code') || false,
              'C'
          )}
          { buttonFoo(
              () => editor?.chain().focus().toggleBold().run(),
              editor?.isActive('bold') || false,
              'B'
          )}
        </div>
      </View>
      <div className="prose">
        <EditorContent editor={editor} />
      </div>
    </EditorWrapperView>
  );
};
