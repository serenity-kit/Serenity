import { Extension } from "@tiptap/core";
import { yCursorPlugin } from "y-prosemirror";
import { Awareness } from "y-protocols/awareness";

export interface AwarnessExtensionOptions {
  awareness?: Awareness;
  // user: Record<string, any>;
  render(user: Record<string, any>): HTMLElement;
}

type AwarnessExtensionStorage = {
  users: { clientId: number; [key: string]: any }[];
};

export const AwarnessExtension = Extension.create<
  AwarnessExtensionOptions,
  AwarnessExtensionStorage
>({
  name: "awarnessExtension",

  addOptions() {
    return {
      awareness: undefined,
      render: (user) => {
        const cursor = document.createElement("span");

        cursor.classList.add("collaboration-cursor__caret");
        cursor.setAttribute("style", `border-color: ${user.color}`);

        const label = document.createElement("div");

        label.classList.add("collaboration-cursor__label");
        label.setAttribute("style", `background-color: ${user.color}`);
        label.insertBefore(document.createTextNode(user.name), null);
        cursor.insertBefore(label, null);

        return cursor;
      },
    };
  },

  addStorage() {
    return {
      users: [],
    };
  },

  addProseMirrorPlugins() {
    if (!this.options.awareness) return [];
    return [
      yCursorPlugin(
        this.options.awareness,
        // @ts-ignore
        {
          cursorBuilder: this.options.render,
        }
      ),
    ];
  },
});
