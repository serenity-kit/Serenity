import { MeDocument, MeQuery, MeQueryVariables } from "../../generated/graphql";
import { getUrqlClient } from "../../utils/urqlClient/urqlClient";

export const fetchMe = async () => {
  const result = await getUrqlClient()
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
