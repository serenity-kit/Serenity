import {
  Snapshot as SecsyncSnapshot,
  Update as SecsyncUpdate,
} from "@serenity-tools/secsync";
import { Snapshot, Update } from "../../prisma/generated/output";

export function serializeSnapshot(snapshot: Snapshot): SecsyncSnapshot {
  return { ...JSON.parse(snapshot.data) };
}

export function serializeUpdate(update: Update): SecsyncUpdate {
  return { ...JSON.parse(update.data) };
}

export function serializeUpdates(updates: Update[]): SecsyncUpdate[] {
  return updates.map((update) => {
    return serializeUpdate(update);
  });
}
