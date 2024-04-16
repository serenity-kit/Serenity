import { EditorBottombarState } from "@serenity-tools/editor";
import { assign, createActor, setup } from "xstate";
import { initialEditorBottombarState } from "../components/editor/initialEditorBottombarState";

type Context = {
  toolbarState: EditorBottombarState;
};

export const editorToolbarMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5SQJYBcD2AnAKhjANgEYCGWAdChAWAMQCuAdhBgNoAMAuoqAA4ax0KDIx4gAHogCMUgJzl2ANgDMUlQHYArOuUAmACy7dAGhABPaYvLrFi2Qd0AOKfpWblAXw+nUmXPmIySmo6LEg2LjF+QTRhUSQJaV12cllNGUd1KWVldUdZJVMLBClNXXJHXUU1R31c5X0dXS8fCHRsPEJSCioaBl4IEjQwTsCsAGU0IbAObgTooRExSQQAWkV1VOVZfXcpXU0ixHXN9kccpwN1dmvVL28QRgwIODFfDoDuqIFF+NAV1YyTRbHZ7A5HNalKw3XSyKTsZRnc7qWQtcBtPyjbrBGjfGJxZbHZTA2Rw9LVbJOfaHcyISrkIx5MoGRrJXL3DxAA */
  setup({
    types: {} as { context: Context },
  }).createMachine({
    context: { toolbarState: initialEditorBottombarState },
    initial: "idle",
    states: {
      idle: {
        on: {
          undo: {},
          redo: {},
          updateToolbarState: {
            actions: assign({
              toolbarState: ({ event }) => {
                return event.toolbarState;
              },
            }),
          },
        },
      },
    },
    id: "editorToolbar",
  });

export const editorToolbarService = createActor(editorToolbarMachine).start();
