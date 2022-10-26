import { Locator } from "@playwright/test";
import { delayForSeconds } from "../../delayForSeconds";

const maxSecondsWaitForTextChange = 5;

export type Props = {
  element: Locator;
  initialText: string;
};
export const waitForElementTextChange = async ({
  element,
  initialText,
}: Props) => {
  let finalText: string | null = null;
  let numSecondsWait = 0;
  do {
    await delayForSeconds(1);
    finalText = await element.textContent();
    numSecondsWait += 1;
  } while (
    finalText == initialText &&
    numSecondsWait <= maxSecondsWaitForTextChange
  );
  return finalText;
};
