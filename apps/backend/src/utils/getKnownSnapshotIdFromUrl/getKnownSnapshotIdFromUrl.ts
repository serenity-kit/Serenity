export const getKnownSnapshotIdFromUrl = (url: string = "") => {
  const queryStartPos = url.indexOf("?");
  if (queryStartPos !== -1) {
    const queryString = url.slice(queryStartPos + 1);
    const queryParameters = new URLSearchParams(queryString);
    return queryParameters.get("knownSnapshotId") ?? undefined;
  } else {
    return undefined;
  }
};
