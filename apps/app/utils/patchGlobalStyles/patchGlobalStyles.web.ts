export const patchGlobalStyles = () => {
  // this fixes a bug in react navigation that prevented users to select
  // text in the web version and even editing in Safari (desktop & iOS).
  //
  // Once this issue is resolved we can remove this patch
  // https://github.com/react-navigation/react-navigation/issues/10922
  const style = document.createElement("style");
  style.textContent = `
  * {
    user-select: auto !important;
    -webkit-user-select: auto !important;
  }
`;
  document.head.appendChild(style);
};
