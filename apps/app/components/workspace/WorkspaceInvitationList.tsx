import { getExpiredTextFromString } from "@serenity-tools/common";
import {
  IconButton,
  List,
  ListHeader,
  ListItem,
  ListText,
  tw,
  useIsDesktopDevice,
  View,
} from "@serenity-tools/ui";
import { isPast, parseJSON } from "date-fns";
import { useWorkspace } from "../../context/WorkspaceContext";

type Props = {
  testID?: string;
  onDeletePress: (id: string) => void;
  onSelect: (id: string) => void;
};

export function WorkspaceInvitationList(props: Props) {
  const isDesktopDevice = useIsDesktopDevice();
  const { workspaceChainData } = useWorkspace();

  return (
    <View testID={props.testID}>
      <List
        data={
          workspaceChainData
            ? Object.entries(workspaceChainData.state.invitations)
            : []
        }
        emptyString={"No active invitations"}
        header={<ListHeader data={["Active Links"]} />}
      >
        {workspaceChainData &&
          Object.entries(workspaceChainData.state.invitations).map(
            ([invitationId, invitationDetails]) => {
              const expired = isPast(parseJSON(invitationDetails.expiresAt));
              return (
                <ListItem
                  key={invitationId}
                  onSelect={() => props.onSelect(invitationId)}
                  mainItem={
                    <>
                      <ListText style={[tw`w-1/2 md:w-2/3`]}>
                        https://serenity.re/accept-workspace-invitation
                      </ListText>
                      <ListText>/</ListText>
                      <ListText style={[tw`w-1/2 md:w-1/4`]} bold>
                        {invitationId}
                      </ListText>
                    </>
                  }
                  secondaryItem={
                    <View
                      style={tw`flex-row items-center justify-between w-full`}
                    >
                      <ListText muted={expired} secondary style={[tw`mr-4`]}>
                        {invitationDetails.role.charAt(0).toUpperCase() +
                          invitationDetails.role.slice(1).toLowerCase()}
                      </ListText>
                      <ListText muted={expired} secondary>
                        {getExpiredTextFromString(
                          invitationDetails.expiresAt,
                          isDesktopDevice
                        )}
                      </ListText>
                    </View>
                  }
                  actionItem={
                    !expired ? (
                      <IconButton
                        name={"delete-bin-line"}
                        color={isDesktopDevice ? "gray-900" : "gray-700"}
                        onPress={() => props.onDeletePress(invitationId)}
                      />
                    ) : null
                  }
                />
              );
            }
          )}
      </List>
    </View>
  );
}
