import { MeDocument, MeQuery, MeQueryVariables } from "../../generated/graphql";
import { urqlRef } from "../../utils/urqlClient/urqlClient";

export const fetchMe = async () => {
  const result = await urqlRef.urqlClient
    .query<MeQuery, MeQueryVariables>(
      MeDocument,
      {},
      {
        // better to be safe here and always refetch
        requestPolicy: "network-only",
      }
    )
    .toPromise();
  return result;
};
