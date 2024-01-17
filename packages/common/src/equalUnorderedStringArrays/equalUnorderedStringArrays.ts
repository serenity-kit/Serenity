export const equalUnorderedStringArrays = (
  a: string[],
  b: string[]
): boolean => {
  // sort both arrays
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();

  // compare lengths first, then compare each element
  return (
    sortedA.length === sortedB.length &&
    sortedA.every((value, index) => value === sortedB[index])
  );
};
