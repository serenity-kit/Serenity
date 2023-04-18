import { SomeZodObject } from "zod";
import { UpdateWithServerData } from "../types";

export const parseEphemeralUpdateWithServerData = (
  ephemeralUpdate: any,
  AdditionalValidation: SomeZodObject
) => {
  const rawEphemeralUpdate = UpdateWithServerData.parse(ephemeralUpdate);
  const additionalData = AdditionalValidation.parse(ephemeralUpdate.publicData);
  return {
    ...rawEphemeralUpdate,
    publicData: {
      ...additionalData,
      ...rawEphemeralUpdate.publicData,
    },
  };
};
