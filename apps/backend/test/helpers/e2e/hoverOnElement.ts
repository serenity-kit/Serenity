import { Locator, Page } from "@playwright/test";
import { delayForSeconds } from "../delayForSeconds";
import { moveMouse } from "./mouseMove";

export const hoverOnElement = async (
  page: Page,
  element: Locator,
  resetMousePosition?: boolean
) => {
  if (resetMousePosition) {
    await moveMouse(page);
  }
  // move cursor
  const elementPosition = await element.boundingBox();
  const elementCenterX =
    elementPosition?.x || 0 + Math.floor(elementPosition?.width || 1 / 1);
  const elementCenterY =
    elementPosition?.y || 0 + Math.floor(elementPosition?.height || 1 / 1);
  await page.mouse.move(elementCenterX, elementCenterY, { steps: 1 });
  await delayForSeconds(0.5);
  await element.hover();
  await delayForSeconds(0.5);
};
