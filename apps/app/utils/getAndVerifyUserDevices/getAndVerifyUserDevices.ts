import { constructUserFromSerializedUserChain } from "@serenity-tools/common";
import { runUserChainQuery } from "../../generated/graphql";

type Params = {
  mainDeviceSigningPublicKey: string;
};

export const getAndVerifyUserDevices = async ({
  mainDeviceSigningPublicKey,
}: Params) => {
  const userChainQueryResult = await runUserChainQuery({});

  if (userChainQueryResult.data?.userChain?.nodes) {
    return constructUserFromSerializedUserChain({
      serializedUserChain: userChainQueryResult.data?.userChain?.nodes,
      validMainDeviceSigningPublicKeys: [mainDeviceSigningPublicKey],
    });
  }
  throw new Error("Failed to fetch the user chain.");
};
