import { RouteProp, useRoute } from "@react-navigation/native";
import {
  Button,
  Checkbox,
  IconButton,
  Input,
  List,
  ListHeader,
  ListItem,
  ListText,
  Text,
  tw,
  useIsDesktopDevice,
} from "@serenity-tools/ui";
import { useState } from "react";
import { useDocumentShareLinksQuery } from "../../generated/graphql";
import { WorkspaceDrawerParamList } from "../../types/navigation";
import { notNull } from "../../utils/notNull/notNull";

export function PageShareModalContent() {
  const [isLinkSharing, setIsLinkSharing] = useState(false);
  const route = useRoute<RouteProp<WorkspaceDrawerParamList, "Page">>();
  const [documentShareLinksResult] = useDocumentShareLinksQuery({
    variables: { documentId: route.params.pageId },
  });
  const isDesktopDevice = useIsDesktopDevice();

  const documentShareLinks =
    documentShareLinksResult.data?.documentShareLinks?.nodes?.filter(notNull) ||
    [];

  return (
    <>
      <List
        data={documentShareLinks}
        emptyString={"No active share links"}
        header={<ListHeader data={["Page Share Links"]} />}
      >
        {documentShareLinks.map((documentShareLink) => {
          return (
            <ListItem
              key={documentShareLink.token}
              // onSelect={() => props.onSelect(documentShareLink.token)}
              mainItem={
                <>
                  <ListText style={[tw`w-1/2 md:w-2/3`]}>
                    https://serenity.re/accept-workspace-invitation
                  </ListText>
                  <ListText>/</ListText>
                  <ListText style={[tw`w-1/2 md:w-1/4`]} bold>
                    {documentShareLink.token}
                  </ListText>
                </>
              }
              actionItem={
                <IconButton
                  name={"delete-bin-line"}
                  color={isDesktopDevice ? "gray-900" : "gray-700"}
                  onPress={() => {
                    // TODO delete documentShareLink
                  }}
                />
              }
            />
          );
        })}
      </List>
      <Checkbox
        value={"linkSharing"}
        isChecked={isLinkSharing}
        onChange={setIsLinkSharing}
      >
        <Text variant="xs" muted>
          Share via Link
        </Text>
      </Checkbox>
      {isLinkSharing ? (
        <>
          <Checkbox value={"canComment"} isChecked={true} isDisabled>
            <Text variant="xs" muted>
              Can comment
            </Text>
          </Checkbox>
          <Checkbox value={"canEdit"} isChecked={true} isDisabled>
            <Text variant="xs" muted>
              Can edit
            </Text>
          </Checkbox>
          <Text></Text>
          <Input
            label={"Link"}
            value={"https://example.com/dummy/link"}
            isDisabled
          />
          <Button size="sm">Copy</Button>
        </>
      ) : null}
    </>
  );
}
