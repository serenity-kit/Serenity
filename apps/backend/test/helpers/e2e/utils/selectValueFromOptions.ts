import { expect, Page } from "@playwright/test";
import { delayForSeconds } from "../../delayForSeconds";

export type Props = {
  page: Page;
  testID: string;
  value: string;
};
export const selectValueFromOptions = async ({
  page,
  testID,
  value,
}: Props) => {
  // delaying for one second seems to help the page locate the element
  await delayForSeconds(1);
  const selectElement = page.locator(
    `//input[@data-testid="${testID}"]/../../select`
  );
  const isSelectElementVisible = await selectElement.isVisible();
  expect(isSelectElementVisible).toBe(true);
  await selectElement.selectOption({ value });
  await delayForSeconds(1);
};
