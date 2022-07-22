import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {

  // Go to http://localhost:19006/
  await page.goto('http://localhost:19006/');

  // Go to http://localhost:19006/register
  await page.goto('http://localhost:19006/register');

  // Click [placeholder="Enter your email …"]
  await page.locator('[placeholder="Enter your email …"]').click();

  // Fill [placeholder="Enter your email …"]
  await page.locator('[placeholder="Enter your email …"]').fill('a@a.com');

  // Press Tab
  await page.locator('[placeholder="Enter your email …"]').press('Tab');

  // Fill [placeholder="Enter your password …"]
  await page.locator('[placeholder="Enter your password …"]').fill('pass');

  // Click div > div:nth-child(2) > .css-view-1dbjc4n
  await page.locator('div > div:nth-child(2) > .css-view-1dbjc4n').click();

  // Click div[role="button"]:has-text("Register")
  await page.locator('div[role="button"]:has-text("Register")').click();
  await expect(page).toHaveURL('http://localhost:19006/registration-verification?username=a%40a.com&verification=61119831');

  // Click text=Verify your EmailPlease enter the verification code sent to you via Email.Verifi >> div[role="button"]
  await page.locator('text=Verify your EmailPlease enter the verification code sent to you via Email.Verifi >> div[role="button"]').click();
  await expect(page).toHaveURL('http://localhost:19006/onboarding');

  // Fill text=Workspace NameThis is the name of your organization, team or private notes. You  >> input[type="text"]
  await page.locator('text=Workspace NameThis is the name of your organization, team or private notes. You  >> input[type="text"]').fill('sharing workspace');

  // Click div[role="button"]:has-text("Create")
  await page.locator('div[role="button"]:has-text("Create")').click();
  await expect(page).toHaveURL('http://localhost:19006/workspace/fcc68017-e7bf-4000-a6b5-0038ab703501/page/eab2bbb0-e771-4cf9-b4b6-8d24cbff23b7');

  // Click text=Settings
  await page.locator('text=Settings').click();
  await expect(page).toHaveURL('http://localhost:19006/workspace/fcc68017-e7bf-4000-a6b5-0038ab703501/settings');

  // Click div[role="button"]:has-text("Create Invitation")
  await page.locator('div[role="button"]:has-text("Create Invitation")').click();

  // Click text=Create InvitationInvitation textCopyIDInviterExpires At34777d05-1104-4364-9b43-a >> input[type="text"]
  await page.locator('text=Create InvitationInvitation textCopyIDInviterExpires At34777d05-1104-4364-9b43-a >> input[type="text"]').click();

  // Press a with modifiers
  await page.locator('text=Create InvitationInvitation textCopyIDInviterExpires At34777d05-1104-4364-9b43-a >> input[type="text"]').press('Meta+a');

  // Press c with modifiers
  await page.locator('text=Create InvitationInvitation textCopyIDInviterExpires At34777d05-1104-4364-9b43-a >> input[type="text"]').press('Meta+c');

});