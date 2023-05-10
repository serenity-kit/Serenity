import { CenterContent, Heading, Text, tw } from "@serenity-tools/ui";

type Props = {};

export const PageNoAccessError: React.FC<Props> = ({}) => {
  return (
    <CenterContent style={tw`mx-8 md:mx-34`}>
      <Heading lvl={2}>
        The page does not exist or you lost access to it.
      </Heading>
      <Text variant="md" style={tw`mt-4 mb-4 text-center`}>
        Please contact support in case this you think there is a mistake.
      </Text>
    </CenterContent>
  );
};
