import { addDays } from "./addDays";

test("Add years", async () => {
  expect(addDays("05 October 2011 14:48 UTC", 1)).toEqual(
    new Date("2011-10-06T14:48:00.000Z")
  );
  expect(addDays("2010-10-05T14:48:00.000Z", 15)).toEqual(
    new Date("2010-10-20T14:48:00.000Z")
  );
  expect(addDays("2010-01-05T14:48:00.000Z", 31)).toEqual(
    new Date("2010-02-05T14:48:00.000Z")
  );
});
