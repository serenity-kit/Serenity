import { FullConfig } from "@playwright/test";
import deleteAllRecords from "../helpers/deleteAllRecords";

async function playwrightGlobalSetup(config: FullConfig) {
  await deleteAllRecords();
}

export default playwrightGlobalSetup;
