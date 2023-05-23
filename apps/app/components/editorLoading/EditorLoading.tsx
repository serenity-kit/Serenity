import EditorSidebar from "@serenity-tools/editor/components/editorSidebar/EditorSidebar";
import {
  CenterContent,
  Spinner,
  View,
  tw,
  useHasEditorSidebar,
} from "@serenity-tools/ui";

export const EditorLoading = () => {
  const hasEditorSidebar = useHasEditorSidebar();

  return (
    <View style={tw`flex h-full flex-auto flex-row`}>
      <CenterContent>
        <Spinner fadeIn />
      </CenterContent>
      {/* need to show a mocked editor sidebar since it is loaded only inside the editor
      once all the data is available */}
      {hasEditorSidebar ? (
        <View
          style={tw`w-sidebar grow-0 shrink-0 border-l border-gray-200 bg-gray-100`}
        >
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
        </View>
      ) : null}
    </View>
  );
};
