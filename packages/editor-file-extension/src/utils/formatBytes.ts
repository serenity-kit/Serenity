const sizes = ["Bytes", "kb", "mb", "gb", "tb"];
const decimals = 1;
const base = 1024;

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";

  const result = Math.floor(Math.log(bytes) / Math.log(base));
  return `${parseFloat((bytes / Math.pow(base, result)).toFixed(decimals))}${
    sizes[result]
  }`;
};
