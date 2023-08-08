export function deductHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() - hours);
  return result;
}
