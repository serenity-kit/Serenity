import { debounce } from "@serenity-tools/common";
import * as electronInterface from "../../utils/setupElectronInterface/setupElectronInterface.electron";
import * as sqlWeb from "./sql.web";

export const ready = async () => {
  await sqlWeb.ready();
  const { db, SQL } = sqlWeb.getInstances();

  const isSafeStorageAvailable =
    await electronInterface.isSafeStorageAvailable();
  console.log("isSafeStorageAvailable", isSafeStorageAvailable);
  if (!isSafeStorageAvailable) {
    return;
  }
  const data = await electronInterface.getPersistedDatabase();
  if (data) {
    console.log("Loaded persisted database");
    db.close();
    const newDb = new SQL.Database(data);
    sqlWeb.setDatabase(newDb);
  } else {
    console.log("Didn't load persisted database");
  }
};

export const resetInMemoryDatabase = sqlWeb.resetInMemoryDatabase;
export const execute = sqlWeb.execute;

const debouncedDatabasePersisting = debounce(() => {
  const { db } = sqlWeb.getInstances();
  const data = db.export();
  electronInterface.setPersistedDatabase(data);
  console.log("Persisted database");
}, 3000);

export const triggerDebouncedDatabasePersisting = () => {
  if (!electronInterface.isSafeStorageAvailable()) return;
  debouncedDatabasePersisting();
};

export const destroyPersistedDatabase = async () => {
  return electronInterface.deletePersistedDatabase();
};
