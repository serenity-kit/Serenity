import { deductHours } from "./deductHours";

test("deduct the specified number of hours from the given date", () => {
  const originalDate = new Date("2023-08-04T10:00:00Z");
  const newDate = deductHours(originalDate, 5);
  expect(newDate.toISOString()).toBe("2023-08-04T05:00:00.000Z");
});

test("handle negative numbers by adding hours", () => {
  const originalDate = new Date("2023-08-04T10:00:00Z");
  const newDate = deductHours(originalDate, -5);
  expect(newDate.toISOString()).toBe("2023-08-04T15:00:00.000Z");
});

test("handle zero by returning the same date", () => {
  const originalDate = new Date("2023-08-04T10:00:00Z");
  const newDate = deductHours(originalDate, 0);
  expect(newDate.toISOString()).toBe("2023-08-04T10:00:00.000Z");
});

test("handle large numbers by wrapping around", () => {
  const originalDate = new Date("2023-08-04T10:00:00Z");
  const newDate = deductHours(originalDate, 30);
  expect(newDate.toISOString()).toBe("2023-08-03T04:00:00.000Z");
});
