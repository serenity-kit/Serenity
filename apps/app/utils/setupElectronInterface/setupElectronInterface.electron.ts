export interface SerenityElectron {
  setDatabase: (database: Uint8Array) => Promise<boolean>;
  getDatabase: () => Promise<Uint8Array>;
}

declare global {
  interface Window {
    serenityElectron: SerenityElectron;
  }
}

export const setPersistedDatabase = async (database: Uint8Array) => {
  return await window.serenityElectron.setDatabase(database);
};

export const getPersistedDatabase = async (): Promise<
  Uint8Array | undefined
> => {
  return await window.serenityElectron.getDatabase();
};
