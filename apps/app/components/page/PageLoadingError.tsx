import { Button, CenterContent, Heading, Text, tw } from "@serenity-tools/ui";

type Props = {
  reloadPage: () => void;
};

export const PageLoadingError: React.FC<Props> = ({ reloadPage }) => {
  return (
    <CenterContent style={tw`mx-8 md:mx-34`}>
      <Heading lvl={2}>Couldn't load the page.</Heading>
      <Text variant="md" style={tw`mt-4 mb-4 text-center`}>
        Please check your network connection and try again. If the problem
        persists, please contact support.
      </Text>
      <Button onPress={reloadPage}>Reload Page</Button>
    </CenterContent>
  );
};
