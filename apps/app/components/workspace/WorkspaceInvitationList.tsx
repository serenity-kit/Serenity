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
import { StyleSheet } from "react-native";
import { getDisplayRole } from "../../utils/workspace/getDisplayRole";

type Props = {
  workspaceInvitations: any[];
  testID?: string;
  onDeletePress: (id: string) => void;
  onSelect: (id: string) => void;
};

export function WorkspaceInvitationList(props: Props) {
  const isDesktopDevice = useIsDesktopDevice();
  const styles = StyleSheet.create({});

  return (
    <View testID={props.testID}>
      <List
        data={props.workspaceInvitations}
        emptyString={"No active invitations"}
        header={<ListHeader data={["Active Links"]} />}
      >
        {props.workspaceInvitations.map((invitation) => {
          const expired = isPast(parseJSON(invitation.expiresAt));
          return (
            <ListItem
              key={invitation.id}
              onSelect={() => props.onSelect(invitation.id)}
              mainItem={
                <>
                  <ListText style={[tw`w-1/2 md:w-2/3`]}>
                    https://serenity.re/accept-workspace-invitation
                  </ListText>
                  <ListText>/</ListText>
                  <ListText style={[tw`w-1/2 md:w-1/4`]} bold>
                    {invitation.id}
                  </ListText>
                </>
              }
              secondaryItem={
                <View style={tw`flex-row items-center justify-between w-full`}>
                  <ListText muted={expired} secondary style={[tw`mr-4`]}>
                    {getDisplayRole(invitation.role)}
                  </ListText>
                  <ListText muted={expired} secondary>
                    {getExpiredTextFromString(
                      invitation.expiresAt,
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
                    onPress={() => props.onDeletePress(invitation.id)}
                  />
                ) : null
              }
            />
          );
        })}
      </List>
    </View>
  );
}
