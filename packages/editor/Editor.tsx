import "./editor-output.css";
import "./awareness.css";
import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { EditorWrapperView, View } from "@serenity-tools/ui";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
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

// dummy element - remove when using sidesheet
const Divider = () => {
  return <div className="w-0 border-solid border-gray-600 border-l"></div>;
};

export const Editor = (props: EditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // the Collaboration extension comes with its own history handling
        history: false,
        code: {
          HTMLAttributes: {
            // using py-0.5 so that code elements in adjacent lines don't overlap
            class: "py-0.5 px-1.5 bg-gray-200 rounded",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: "p-4 bg-gray-100 rounded",
          },
        },
        heading: {
          levels: headingLevels,
        },
      }),
      Link.configure({
        openOnClick: false,
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
        <div className="flex space-x-1 p-1">
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
            onClick={() => editor?.chain().focus().toggleBold().run()}
            isActive={editor?.isActive("bold") || false}
          >
            B
          </EditorButton>
          <EditorButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            isActive={editor?.isActive("italic") || false}
          >
            I
          </EditorButton>
          <EditorButton
            onClick={() => editor?.chain().focus().toggleCode().run()}
            isActive={editor?.isActive("code") || false}
          >
            C
          </EditorButton>
          <EditorButton
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            isActive={editor?.isActive("codeBlock") || false}
          >
            K
          </EditorButton>
          <EditorButton
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            isActive={editor?.isActive("blockquote") || false}
          >
            Q
          </EditorButton>
          {/* styling dummy */}
          <EditorButton
            onClick={() =>
              editor?.chain().focus().toggleLink({ href: "#" }).run()
            }
            isActive={editor?.isActive("link") || false}
          >
            L
          </EditorButton>
        </div>
      </View>
      <div className="py-10 md:py-14 px-4 xs:px-6 sm:px-10 lg:px-16">
        <EditorContent editor={editor} />
      </div>
    </EditorWrapperView>
  );
};
