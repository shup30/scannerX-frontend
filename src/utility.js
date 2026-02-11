export const formatEpochToLocal = (epoch) => {
  if (!epoch) return "N/A";
  // Convert to milliseconds if necessary (10 digits = seconds, 13 = ms)
  const timestamp = epoch.toString().length === 10 ? epoch * 1000 : epoch;
  return new Date(timestamp).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};
