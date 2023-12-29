import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable, ScrollView, Text, View, tw } from "@serenity-tools/ui";
import canonicalize from "canonicalize";
import { useCallback, useEffect, useState } from "react";
import { useInterval } from "../../hooks/useInterval";
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
            <Text variant="xs">{entry[key]}</Text>
          </View>
        );
      })}
    </View>
  );
};

export const Table = ({ tableName }: { tableName: string }) => {
  const results = sql.execute(`SELECT * FROM ${tableName}`);

  return (
    <View>
      <View>
        <Text variant="xs" bold>
          {tableName}
        </Text>
      </View>
      {results[0] && (
        <View style={tw`flex-row border-t border-gray-700	`}>
          {Object.keys(results[0]).map((key) => {
            return (
              <View key={key} style={tw`flex-1 border-r p-2`}>
                <Text variant="xs">{key}</Text>
              </View>
            );
          })}
        </View>
      )}
      <View>
        {results.map((entry) => {
          return <Row key={canonicalize(entry)} entry={entry} />;
        })}
      </View>
    </View>
  );
};

export const SqliteDebugger = () => {
  const [, updateState] = useState<any>();
  const [isReady, setIsReady] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const forceUpdate = useCallback(() => updateState({}), []);

  useInterval(() => {
    forceUpdate();
  }, 3000);

  const tables = sql.execute(
    "SELECT name FROM sqlite_master WHERE type='table'"
  );

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
    <ScrollView style={tw`bg-gray-200 ${collapsed ? `max-h-8` : `max-h-96`}`}>
      <View style={tw`m-auto`}>
        <Pressable onPress={() => setCollapsed(!collapsed)}>
          <Text>{!collapsed ? "⬇" : "⬆"}</Text>
        </Pressable>
      </View>
      {tables.map((table) => {
        return <Table key={table.name} tableName={table.name} />;
      })}
    </ScrollView>
  );
};
