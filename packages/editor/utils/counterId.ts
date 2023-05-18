let idCounter = 0;

export const counterId = () => {
  const id = ++idCounter;
  return id;
};
