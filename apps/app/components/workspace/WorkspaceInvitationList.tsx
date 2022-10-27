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
import { formatDistance, parseJSON } from "date-fns";
import { isPast } from "date-fns/esm";
import { StyleSheet } from "react-native";

type Props = {
  workspaceInvitations: any[];
  nativeID?: string;
  onDeletePress: (id: string) => void;
  onSelect: (id: string) => void;
};

export function WorkspaceInvitationList(props: Props) {
  const isDesktopDevice = useIsDesktopDevice();

  const isInvitationExpired = (date: string) => {
    return isPast(parseJSON(date));
  };

  const getExpiredTextFromString = (date: string) => {
    if (isInvitationExpired(date)) {
      return "Expired";
    }

    const prefix = isDesktopDevice ? "Expires " : "";

    return (
      prefix +
      formatDistance(parseJSON(date), new Date(), {
        addSuffix: true,
      })
    );
  };

  const styles = StyleSheet.create({});

  return (
    <View>
      <List
        data={props.workspaceInvitations}
        emptyString={"No active invitations"}
        header={<ListHeader data={["Active Links"]} />}
      >
        {props.workspaceInvitations.map((invitation) => {
          const expired = isInvitationExpired(invitation.expiresAt);
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
                <ListText muted={expired} secondary>
                  {getExpiredTextFromString(invitation.expiresAt)}
                </ListText>
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
