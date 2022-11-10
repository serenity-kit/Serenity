import { formatDistance, isPast, parseJSON } from "date-fns";

export const getExpiredTextFromString = (
  dateString: string,
  isDesktopDevice: boolean
) => {
  const date = parseJSON(dateString);

  if (isPast(date)) {
    return "Expired";
  }

  const prefix = !isDesktopDevice ? "Expires " : "";

  return (
    prefix +
    formatDistance(date, new Date(), {
      addSuffix: true,
    })
  );
};
