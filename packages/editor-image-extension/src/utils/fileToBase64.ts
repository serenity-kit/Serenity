export const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (event) {
      if (!event.target?.result || typeof event.target.result !== "string") {
        reject(new Error("Failed to read file"));
        return;
      }

      // strip away e.g. data:image/png;base64,
      resolve(event.target.result.split(",")[1]);
    };
    reader.onerror = function (error) {
      reject(error);
    };
  });
};
