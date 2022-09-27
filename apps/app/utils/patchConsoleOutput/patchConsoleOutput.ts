export const patchConsoleOutput = () => {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    try {
      if (
        (args[0] &&
          typeof args[0] === "string" &&
          args[0].includes(
            "Warning: React has detected a change in the order of Hooks called by %s"
          ) &&
          args[1] &&
          args[1] === "Header") ||
        (args[0] &&
          args[0].includes(
            'Warning: Each child in a list should have a unique "key" prop.'
          ) &&
          args[1] &&
          typeof args[1] === "string" &&
          args[1].includes(
            "Check the render method of `ForwardRef(AvatarGroup)`"
          ))
      ) {
        // ignored
      } else {
        originalConsoleError(...args);
      }
    } catch {
      originalConsoleError(...args);
    }
  };
};
