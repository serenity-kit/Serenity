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
          )) ||
        (args[0] &&
          args[0].includes(
            "ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17"
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

  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    try {
      if (
        (args[0] &&
          typeof args[0] === "string" &&
          args[0].includes(
            "Animated: `useNativeDriver` is not supported because the native animated module is missing. Falling back to JS-based animation."
          )) ||
        (args[0] &&
          typeof args[0] === "string" &&
          args[0].includes(
            "setNativeProps is deprecated. Please update props using React state instead."
          ))
      ) {
        // ignored
      } else {
        originalConsoleWarn(...args);
      }
    } catch {
      originalConsoleWarn(...args);
    }
  };
};
