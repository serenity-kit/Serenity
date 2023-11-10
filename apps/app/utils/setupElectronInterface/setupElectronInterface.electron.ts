export interface SerenityElectron {
  setPersistedDatabase: (database: Uint8Array) => Promise<boolean>;
  getPersistedDatabase: () => Promise<Uint8Array>;
  deletePersistedDatabase: () => Promise<boolean>;
  isSafeStorageAvailable: () => Promise<boolean>;
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
