import { EditorBottombarState } from "@serenity-tools/editor";
import { assign, createMachine, interpret } from "xstate";
import { initialEditorBottombarState } from "../components/editor/initialEditorBottombarState";

type Context = {
  toolbarState: EditorBottombarState;
};

export const editorToolbarMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5SQJYBcD2AnAKhjANgEYCGWAdChAWAMQCuAdhBgNoAMAuoqAA4ax0KDIx4gAHogCMUgJzl2ANgDMUlQHYArOuUAmACy7dAGhABPaYvLrFi2Qd0AOKfpWblAXw+nUmXPmIySmo6LEg2LjF+QTRhUSQJaV12cllNGUd1KWVldUdZJVMLBClNXXJHXUU1R31c5X0dXS8fCHRsPEJSCioaBl4IEjQwTsCsAGU0IbAObgTooRExSQQAWkV1VOVZfXcpXU0ixHXN9kccpwN1dmvVL28QRgwIODFfDoDuqIFF+NAV1YyTRbHZ7A5HNalKw3XSyKTsZRnc7qWQtcBtPyjbrBGjfGJxZbHZTA2Rw9LVbJOfaHcyISrkIx5MoGRrJXL3DxAA */
  createMachine(
    {
      context: { toolbarState: initialEditorBottombarState } as Context,
      tsTypes: {} as import("./editorToolbarMachine.typegen").Typegen0,
      predictableActionArguments: true,
      initial: "idle",
      states: {
        idle: {
          on: {
            undo: {},
            redo: {},
            updateToolbarState: {
              actions: assign({
                toolbarState: (context, event) => {
                  // @ts-expect-error
                  return event.toolbarState;
                },
              }),
            },
          },
        },
      },
      id: "editorToolbar",
    },
    {}
  );

export const editorToolbarService = interpret(editorToolbarMachine).start();
