import { Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";

export const moveMouse = async (page: Page) => {
  await page.mouse.move(20, 20, { steps: 1 });
  const viewportSize = page.viewportSize();
  await delayForSeconds(0.5);
  await page.mouse.move(
    viewportSize?.width || 300 - 100,
    viewportSize?.height || 400 - 100,
    { steps: 1 }
  );
};
