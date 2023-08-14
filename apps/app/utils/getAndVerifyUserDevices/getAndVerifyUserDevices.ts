import { constructUserFromSerializedUserChain } from "@serenity-tools/common";
import { runUserChainQuery } from "../../generated/graphql";

export const getAndVerifyUserDevices = async () => {
  const userChainQueryResult = await runUserChainQuery({});

  if (userChainQueryResult.data?.userChain?.nodes) {
    return constructUserFromSerializedUserChain({
      serializedUserChain: userChainQueryResult.data?.userChain?.nodes,
    });
  }
  throw new Error("Failed to fetch the user chain.");
};
