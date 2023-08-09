import { addHours } from "./addHours";

test("add the specified number of hours to the given date", () => {
  const originalDate = new Date("2023-08-04T10:00:00Z");
  const newDate = addHours(originalDate, 5);
  expect(newDate.toISOString()).toBe("2023-08-04T15:00:00.000Z");
});

test("handle negative numbers by subtracting hours", () => {
  const originalDate = new Date("2023-08-04T10:00:00Z");
  const newDate = addHours(originalDate, -5);
  expect(newDate.toISOString()).toBe("2023-08-04T05:00:00.000Z");
});

test("handle zero by returning the same date", () => {
  const originalDate = new Date("2023-08-04T10:00:00Z");
  const newDate = addHours(originalDate, 0);
  expect(newDate.toISOString()).toBe("2023-08-04T10:00:00.000Z");
});

test("handle large numbers by wrapping around", () => {
  const originalDate = new Date("2023-08-04T10:00:00Z");
  const newDate = addHours(originalDate, 30);
  expect(newDate.toISOString()).toBe("2023-08-05T16:00:00.000Z");
});

test("handle subtraction large enough to change the date", () => {
  const originalDate = new Date("2023-08-04T10:00:00Z");
  const newDate = addHours(originalDate, -15);
  expect(newDate.toISOString()).toBe("2023-08-03T19:00:00.000Z");
});
