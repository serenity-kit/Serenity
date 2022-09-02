import { addYears } from "./addYears";

test("Add years", async () => {
  expect(addYears("05 October 2011 14:48 UTC", 1)).toEqual(
    new Date("2012-10-05T14:48:00.000Z")
  );
  expect(addYears("2010-10-05T14:48:00.000Z", 15)).toEqual(
    new Date("2025-10-05T14:48:00.000Z")
  );
});
