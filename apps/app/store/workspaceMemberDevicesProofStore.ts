import * as workspaceMemberDevicesProofUtil from "@serenity-kit/workspace-member-devices-proof";
import canonicalize from "canonicalize";
import { runWorkspaceMemberDevicesProofQuery } from "../generated/graphql";
import { showToast } from "../utils/toast/showToast";
import * as sql from "./sql/sql";
import * as workspaceStore from "./workspaceStore";

export const table = "workspace_member_devices_proof_v1";

export const initialize = async () => {
  await sql.ready();

  sql.execute(
    `CREATE TABLE IF NOT EXISTS "${table}" (
      "clock"	INTEGER NOT NULL,
      "proof"	TEXT NOT NULL,
      "data"	TEXT NOT NULL,
      "hash"	TEXT NOT NULL,
      "authorMainDeviceSigningPublicKey"	TEXT NOT NULL,
      "workspaceId"	TEXT NOT NULL,
      PRIMARY KEY("clock","workspaceId")
      FOREIGN KEY("workspaceId") REFERENCES "${workspaceStore.table}" ON DELETE CASCADE
    );`
  );
};

export const createWorkspaceMemberDevicesProof = ({
  workspaceId,
  proof,
  data,
  clock,
  authorMainDeviceSigningPublicKey,
  triggerRerender,
}: {
  workspaceId: string;
  proof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
  data: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData;
  clock: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofClock;
  authorMainDeviceSigningPublicKey: string;
  triggerRerender?: boolean;
}) => {
  sql.execute(`INSERT INTO ${table} VALUES (?, ?, ?, ?, ?, ?);`, [
    clock,
    JSON.stringify(proof),
    JSON.stringify(data),
    proof.hash,
    authorMainDeviceSigningPublicKey,
    workspaceId,
  ]);
  // if (triggerRerender !== false) {
  //   triggerGetLastWorkspaceChain();
  // }
};

export const loadRemoteWorkspaceMemberDevicesProofQuery = async ({
  workspaceId,
  invitationId,
}: {
  workspaceId: string;
  invitationId?: string;
}) => {
  // const lastEvent = getLastWorkspaceMemberDevicesProof({ workspaceId });

  const workspaceMemberDevicesProofQueryResult =
    await runWorkspaceMemberDevicesProofQuery({ workspaceId, invitationId });

  if (workspaceMemberDevicesProofQueryResult.error) {
    showToast("Failed to load the workspace data.", "error");
  }

  if (
    workspaceMemberDevicesProofQueryResult.data?.workspaceMemberDevicesProof
  ) {
    const entry =
      workspaceMemberDevicesProofQueryResult.data.workspaceMemberDevicesProof;
    const workspaceMemberDevicesProofData =
      workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData.parse(
        JSON.parse(entry.serializedData)
      );

    // TODO check that workspaceMemberDevicesProofData.workspaceChainHash is part ot the workspace chain

    if (
      !workspaceMemberDevicesProofUtil.isValidWorkspaceMemberDevicesProof({
        workspaceMemberDevicesProof: entry.proof,
        // TODO verify the author was part of the chain at entry - workspaceMemberDevicesProofData.workspaceChainHash
        authorPublicKey: entry.authorMainDeviceSigningPublicKey,
        workspaceMemberDevicesProofData,
        // pastKnownWorkspaceMemberDevicesProof - TODO add this to check the clock
      })
    ) {
      throw new Error(
        "Invalid workspaceMemberDevicesProof in updateWorkspaceMemberDevicesProof"
      );
    }
    createWorkspaceMemberDevicesProof({
      authorMainDeviceSigningPublicKey: entry.authorMainDeviceSigningPublicKey,
      clock: entry.proof.clock,
      data: workspaceMemberDevicesProofData,
      proof: entry.proof,
      workspaceId,
    });
  }
  return getLastWorkspaceMemberDevicesProof({ workspaceId });
};

let getLastWorkspaceMemberDevicesProofCache: {
  [workspaceId: string]: {
    proof: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProof;
    data: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofData;
    clock: workspaceMemberDevicesProofUtil.WorkspaceMemberDevicesProofClock;
  };
} = {};
export const getLastWorkspaceMemberDevicesProof = ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  // TODO create helper to get one
  const lastWorkspaceMemberDevicesProofResult = sql.execute(
    `SELECT * FROM ${table} WHERE workspaceId = ? ORDER BY clock DESC LIMIT 1`,
    [workspaceId]
  ) as any;
  const lastWorkspaceMemberDevicesProof =
    lastWorkspaceMemberDevicesProofResult.length > 0
      ? {
          clock: lastWorkspaceMemberDevicesProofResult[0].clock,
          proof: JSON.parse(lastWorkspaceMemberDevicesProofResult[0].proof),
          data: JSON.parse(lastWorkspaceMemberDevicesProofResult[0].data),
        }
      : undefined;

  // write a helper to canonicalize the input params and create a cache based on them
  if (
    lastWorkspaceMemberDevicesProof &&
    canonicalize(lastWorkspaceMemberDevicesProof) !==
      canonicalize(getLastWorkspaceMemberDevicesProofCache[workspaceId])
  ) {
    getLastWorkspaceMemberDevicesProofCache[workspaceId] =
      lastWorkspaceMemberDevicesProof;
  }
  return getLastWorkspaceMemberDevicesProofCache[workspaceId];
};
