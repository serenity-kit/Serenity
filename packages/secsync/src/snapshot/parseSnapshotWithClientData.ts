import { SomeZodObject } from "zod";
import { SnapshotWithClientData } from "../types";

export const parseSnapshotWithClientData = (
  snapshot: any,
  AdditionalValidation?: SomeZodObject
) => {
  const rawSnapshot = SnapshotWithClientData.parse(snapshot);
  if (AdditionalValidation === undefined) return rawSnapshot;
  const additionalData = AdditionalValidation.parse(snapshot.publicData);
  return {
    ...rawSnapshot,
    publicData: {
      ...additionalData,
      ...rawSnapshot.publicData,
    },
  };
};
