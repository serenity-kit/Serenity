import { CenterContent, Heading, Text, tw } from "@serenity-tools/ui";

export const EditorPageLoadingError = () => {
  return (
    <CenterContent style={tw`mx-8 md:mx-34`}>
      <Heading lvl={2}>Couldn't load the page.</Heading>
      <Text variant="md" style={tw`mt-4 text-center`}>
        Please check your network connection and try again. If the problem
        persists, please contact support.
      </Text>
    </CenterContent>
  );
};
