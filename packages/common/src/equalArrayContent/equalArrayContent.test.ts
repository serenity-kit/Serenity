import { equalArrayContent } from "./equalArrayContent";

test("equalArrayContent", async () => {
  expect(equalArrayContent(["a", "b", "c"], ["a", "b", "c"])).toBe(true);
  expect(equalArrayContent(["a", "b", "c"], ["a", "b"])).toBe(false);
  expect(equalArrayContent(["a", "b"], ["a", "b", "c"])).toBe(false);
  expect(equalArrayContent(["c", "a", "b"], ["a", "b", "c"])).toBe(true);
});
