export function debounce<
  Func extends (...args: Parameters<Func>) => ReturnType<Func>
>(func: Func, waitFor: number): (...args: Parameters<Func>) => void {
  let timeout: any;
  return (...args: Parameters<Func>): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
}
