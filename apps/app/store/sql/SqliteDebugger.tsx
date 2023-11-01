import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Text, View, tw } from "@serenity-tools/ui";
import { useCallback, useEffect, useState } from "react";
import * as workspaceStore from "../../store/workspaceStore";
import * as sql from "./sql";

type RowParams = {
  entry: { [k: string]: string | number };
};

const Row: React.FC<RowParams> = ({ entry }) => {
  return (
    <View style={tw`flex-row border-t border-gray-700	`}>
      {Object.keys(entry).map((key) => {
        return (
          <View key={key} style={tw`flex-1 border-r p-2`}>
            <Text>{entry[key]}</Text>
          </View>
        );
      })}
    </View>
  );
};

export const WorkspacesTable = () => {
  const { workspaces } = workspaceStore.useLocalWorkspaces();

  return (
    <View>
      {workspaces.map((workspace) => {
        return <Row key={workspace.id} entry={workspace} />;
      })}
    </View>
  );
};

export const SqliteDebugger = () => {
  const [, updateState] = useState<any>();
  const [isReady, setIsReady] = useState(false);

  const forceUpdate = useCallback(() => updateState({}), []);

  useEffect(() => {
    // wait until sql is ready and then a bit longer till all the local migrations did run
    const wait = async () => {
      await sql.ready();
      const sqliteDebugger = await AsyncStorage.getItem("sqlite_debugger");
      if (sqliteDebugger !== "active") return;
      setTimeout(async () => {
        setIsReady(true);
      }, 100);
    };
    wait();
  }, [forceUpdate]);

  if (!isReady) return null;

  return (
    <View style={tw`bg-gray-200`}>
      <View style={tw`flex-row`}>
        <Text>Workspaces</Text>
        <Button
          onPress={() => {
            forceUpdate();
          }}
        >
          ↺
        </Button>
      </View>
      <WorkspacesTable />
    </View>
  );
};
