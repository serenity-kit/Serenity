import { LocalDevice } from "@serenity-tools/common";

export interface SerenityElectron {
  setPersistedDatabase: (database: Uint8Array) => Promise<boolean>;
  getPersistedDatabase: () => Promise<Uint8Array>;
  deletePersistedDatabase: () => Promise<boolean>;
  isSafeStorageAvailable: () => Promise<boolean>;
  setSessionKey: (keys: string) => Promise<boolean>;
  getSessionKey: () => Promise<string>;
  deleteSessionKey: () => Promise<boolean>;
  setDevice: (device: string) => Promise<boolean>;
  getDevice: () => Promise<string>;
  deleteDevice: () => Promise<boolean>;
}

declare global {
  interface Window {
    serenityElectron: SerenityElectron;
  }
}

export const setPersistedDatabase = async (database: Uint8Array) => {
  return await window.serenityElectron.setPersistedDatabase(database);
};

export const getPersistedDatabase = async (): Promise<
  Uint8Array | undefined
> => {
  return await window.serenityElectron.getPersistedDatabase();
};

export const deletePersistedDatabase = async () => {
  return await window.serenityElectron.deletePersistedDatabase();
};

export const isSafeStorageAvailable = async () => {
  return await window.serenityElectron.isSafeStorageAvailable();
};

export const setSessionKey = async (keys: string) => {
  return await window.serenityElectron.setSessionKey(keys);
};

export const getSessionKey = async () => {
  return await window.serenityElectron.getSessionKey();
};

export const deleteSessionKey = async () => {
  return await window.serenityElectron.deleteSessionKey();
};

export const setDevice = async (device: LocalDevice) => {
  return await window.serenityElectron.setDevice(JSON.stringify(device));
};

export const getDevice = async () => {
  const deviceString = await window.serenityElectron.getDevice();
  return JSON.parse(deviceString) as LocalDevice;
};

export const deleteDevice = async () => {
  return await window.serenityElectron.deleteDevice();
};
