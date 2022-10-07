import { Text, View } from "@serenity-tools/ui";
import { FlatList, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { WorkspaceInvitationListItem } from "./WorkspaceInvitationListItem";

type Props = {
  workspaceInvitations: any[];
  nativeID?: string;
  onDeletePress: (id: string) => void;
  onSelect: (id: string) => void;
};

export function WorkspaceInvitationList(props: Props) {
  return (
    <View>
      <View>
        <View style={styles.listItem}>
          <Text style={styles.headerText}>ID</Text>
          <Text style={styles.headerText}>Inviter</Text>
          <Text style={styles.headerText}>Expires At</Text>
        </View>
      </View>
      <FlatList
        nativeID={props.nativeID}
        data={props.workspaceInvitations}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => props.onSelect(item.id)}>
            <WorkspaceInvitationListItem
              key={item.id}
              id={item.id}
              workspaceId={item.workspaceId}
              username={item.inviterUsername}
              inviterUserId={item.inviterUserId}
              expiresAt={item.expiresAt}
              onDeletePress={() => props.onDeletePress(item.id)}
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.listItem}>
            <Text>No invitations</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerText: {
    fontWeight: "bold",
  },
});
