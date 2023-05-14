import EditorSidebar from "@serenity-tools/editor/components/editorSidebar/EditorSidebar";
import {
  CenterContent,
  Spinner,
  View,
  useHasEditorSidebar,
} from "@serenity-tools/ui";

export const EditorLoading = () => {
  const hasEditorSidebar = useHasEditorSidebar();

  return (
    <View>
      <CenterContent>
        <Spinner fadeIn />
      </CenterContent>
      {/* need to show a mocked editor sidebar since it is loaded only inside the editor
      once all the data is available */}
      {hasEditorSidebar ? (
        <EditorSidebar
          // @ts-expect-error fake editor
          editor={{ isActive: () => false }}
          documentState="loading"
          encryptAndUploadFile={() =>
            Promise.resolve({
              key: "",
              nonce: "",
              fileId: "",
            })
          }
          headingLevels={[1, 2, 3]}
        />
      ) : null}
    </View>
  );
};
