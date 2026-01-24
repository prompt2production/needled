import { test, expect } from '@playwright/test'

// Shared setup - complete onboarding to get authenticated session
// Sets injection day to today so Log Injection button is visible
async function completeOnboardingFlow(page: any) {
  const testEmail = `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`
  const testPassword = 'testpassword123'

  await page.goto('/onboarding')

  // Step 1: Welcome screen
  await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible({
    timeout: 10000,
  })
  await page.getByRole('button', { name: 'Get Started' }).click()

  // Step 2: Name input
  await expect(page.getByPlaceholder('Enter your name')).toBeVisible()
  await page.getByPlaceholder('Enter your name').fill('Flex Test User')
  await page.getByRole('button', { name: 'Continue' }).click()

  // Step 3: Email and password (Account step)
  await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
  await page.getByPlaceholder('you@example.com').fill(testEmail)
  await page.getByPlaceholder('Create a password').fill(testPassword)
  await page.getByPlaceholder('Confirm your password').fill(testPassword)
  await page.getByRole('button', { name: 'Continue' }).click()

  // Step 4: Starting weight
  await expect(page.getByPlaceholder('0.0')).toBeVisible()
  await page.getByPlaceholder('0.0').fill('90')
  await page.getByRole('button', { name: 'Continue' }).click()

  // Step 5: Goal weight
  await expect(page.getByPlaceholder('0.0')).toBeVisible()
  await page.getByPlaceholder('0.0').fill('80')
  await page.getByRole('button', { name: 'Continue' }).click()

  // Step 6: Medication and injection day
  await expect(page.getByRole('button', { name: 'Ozempic' })).toBeVisible()
  await page.getByRole('button', { name: 'Ozempic' }).click()

  // Select today's day of week (0=Monday, 6=Sunday) so injection button shows
  const today = new Date()
  const dayIndex = (today.getDay() + 6) % 7 // Convert JS day (0=Sun) to 0=Mon
  const dayButtons = page.locator('button.rounded-full.w-10.h-10')
  await dayButtons.nth(dayIndex).click()

  // Complete setup
  await expect(
    page.getByRole('button', { name: 'Complete Setup' })
  ).toBeEnabled({ timeout: 5000 })
  await page.getByRole('button', { name: 'Complete Setup' }).click()

  // Wait for success screen and redirect
  await expect(page.getByText("You're all set")).toBeVisible({ timeout: 10000 })
  await expect(page).toHaveURL('/dashboard', { timeout: 5000 })

  return { email: testEmail, password: testPassword }
}

test.describe('Flexible Logging', () => {
  test.describe('Weigh-in date selection (FLEX-017)', () => {
    test('should log weigh-in with date picker visible', async ({ page }) => {
      await completeOnboardingFlow(page)
      await page.goto('/weigh-in')

      // Wait for page to load
      await expect(page.getByRole('heading', { name: 'Weight' })).toBeVisible()

      // Click Log Weight button
      await expect(page.getByRole('button', { name: 'Log Weight' })).toBeVisible({ timeout: 10000 })
      await page.getByRole('button', { name: 'Log Weight' }).click()

      // The dialog should open with date picker visible
      await expect(page.getByText('Log your weight')).toBeVisible()

      // Date picker should be visible (shows current date)
      const dateButton = page.getByRole('dialog').getByRole('button').filter({ hasText: /January|February|March|April|May|June|July|August|September|October|November|December/ })
      await expect(dateButton).toBeVisible()

      // Enter weight
      await page.getByPlaceholder('0.0').fill('88.5')

      // Submit
      await page.getByRole('dialog').getByRole('button', { name: 'Log Weight' }).click()

      // Wait for success toast
      await expect(page.getByText('Weight logged')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Weigh-in edit and delete (FLEX-018)', () => {
    test('should edit weigh-in entry', async ({ page }) => {
      await completeOnboardingFlow(page)

      // First log a weigh-in
      await page.goto('/weigh-in')
      await expect(page.getByRole('button', { name: 'Log Weight' })).toBeVisible({ timeout: 10000 })
      await page.getByRole('button', { name: 'Log Weight' }).click()
      await page.getByPlaceholder('0.0').fill('85')
      await page.getByRole('dialog').getByRole('button', { name: 'Log Weight' }).click()
      await expect(page.getByText('Weight logged')).toBeVisible({ timeout: 5000 })

      // Reload page to refresh history
      await page.reload()
      await expect(page.getByRole('heading', { name: 'Weight', exact: true })).toBeVisible()

      // Look for the weigh-in in history section
      await expect(page.getByText('85.0 kg')).toBeVisible({ timeout: 10000 })

      // Hover to reveal edit button
      const historyItem = page.locator('.group').filter({ hasText: '85.0' }).first()
      await historyItem.hover()

      // Click edit button
      await historyItem.getByRole('button', { name: 'Edit weigh-in' }).click()

      // Edit dialog should open
      await expect(page.getByText('Edit weigh-in')).toBeVisible()

      // Change weight
      const weightInput = page.getByRole('dialog').getByPlaceholder('0.0')
      await weightInput.clear()
      await weightInput.fill('84')

      // Submit
      await page.getByRole('button', { name: 'Save Changes' }).click()

      // Success toast
      await expect(page.getByText('Weigh-in updated')).toBeVisible({ timeout: 5000 })
    })

    test('should delete weigh-in entry', async ({ page }) => {
      await completeOnboardingFlow(page)

      // First log a weigh-in
      await page.goto('/weigh-in')
      await expect(page.getByRole('button', { name: 'Log Weight' })).toBeVisible({ timeout: 10000 })
      await page.getByRole('button', { name: 'Log Weight' }).click()
      await page.getByPlaceholder('0.0').fill('86')
      await page.getByRole('dialog').getByRole('button', { name: 'Log Weight' }).click()
      await expect(page.getByText('Weight logged')).toBeVisible({ timeout: 5000 })

      // Reload page to refresh history
      await page.reload()
      await expect(page.getByRole('heading', { name: 'Weight', exact: true })).toBeVisible()
      await expect(page.getByText('86.0 kg')).toBeVisible({ timeout: 10000 })

      // Hover to reveal delete button
      const historyItem = page.locator('.group').filter({ hasText: '86.0' }).first()
      await historyItem.hover()

      // Click delete button
      await historyItem.getByRole('button', { name: 'Delete weigh-in' }).click()

      // Confirmation dialog should open
      await expect(page.getByText('Delete weigh-in?')).toBeVisible()

      // Confirm deletion
      await page.getByRole('button', { name: 'Delete' }).click()

      // Success toast
      await expect(page.getByText('Weigh-in deleted')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Injection date selection (FLEX-019)', () => {
    test('should show date picker in injection dialog', async ({ page }) => {
      await completeOnboardingFlow(page)
      await page.goto('/injection')

      // Wait for page to load (heading is "Injection" not "Injections")
      await expect(page.getByRole('heading', { name: 'Injection', exact: true })).toBeVisible()

      // Look for Log Injection button (only visible on injection day - we set it to today)
      const logButton = page.getByRole('button', { name: 'Log Injection' })
      await expect(logButton).toBeVisible({ timeout: 10000 })
      await logButton.click()

      // The dialog should open with date picker visible
      await expect(page.getByRole('dialog')).toBeVisible()

      // Date picker should be visible
      const dateButton = page.getByRole('dialog').getByRole('button').filter({ hasText: /January|February|March|April|May|June|July|August|September|October|November|December/ })
      await expect(dateButton).toBeVisible()

      // Select injection site
      await page.getByRole('button', { name: 'Left Abdomen' }).click()

      // Submit
      await page.getByRole('dialog').getByRole('button', { name: 'Log Injection' }).click()

      // Wait for success toast
      await expect(page.getByText('Injection logged')).toBeVisible({ timeout: 5000 })

      // Reload page to refresh history
      await page.reload()
      await expect(page.getByRole('heading', { name: 'Injection', exact: true })).toBeVisible()

      // Entry should appear in history section (not in Site Rotation summary)
      const historySection = page.locator('text=History').locator('..')
      await expect(historySection.getByText('Left Abdomen')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Injection edit and delete (FLEX-020)', () => {
    test('should edit injection entry', async ({ page }) => {
      await completeOnboardingFlow(page)

      // First log an injection
      await page.goto('/injection')
      await expect(page.getByRole('button', { name: 'Log Injection' })).toBeVisible({ timeout: 10000 })
      await page.getByRole('button', { name: 'Log Injection' }).click()
      await page.getByRole('button', { name: 'Left Abdomen' }).click()
      await page.getByRole('dialog').getByRole('button', { name: 'Log Injection' }).click()
      await expect(page.getByText('Injection logged')).toBeVisible({ timeout: 5000 })

      // Reload page to refresh history
      await page.reload()
      await expect(page.getByRole('heading', { name: 'Injection', exact: true })).toBeVisible()

      // Wait for history to load - look for entry in history section
      const historySection = page.locator('text=History').locator('..').locator('.group')
      await expect(historySection.first()).toBeVisible({ timeout: 10000 })

      // Hover to reveal edit button
      const historyItem = historySection.first()
      await historyItem.hover()

      // Click edit button
      await historyItem.getByRole('button', { name: 'Edit injection' }).click()

      // Edit dialog should open
      await expect(page.getByText('Edit injection')).toBeVisible()

      // Change site - click on different site button
      await page.getByRole('button', { name: 'Right Abdomen' }).click()

      // Submit
      await page.getByRole('button', { name: 'Save Changes' }).click()

      // Success toast
      await expect(page.getByText('Injection updated')).toBeVisible({ timeout: 5000 })

      // Updated site should appear in history section
      const updatedHistorySection = page.locator('text=History').locator('..')
      await expect(updatedHistorySection.getByText('Right Abdomen')).toBeVisible({ timeout: 5000 })
    })

    test('should delete injection entry', async ({ page }) => {
      await completeOnboardingFlow(page)

      // First log an injection
      await page.goto('/injection')
      await expect(page.getByRole('button', { name: 'Log Injection' })).toBeVisible({ timeout: 10000 })
      await page.getByRole('button', { name: 'Log Injection' }).click()
      await page.getByRole('button', { name: 'Left Thigh' }).click()
      await page.getByRole('dialog').getByRole('button', { name: 'Log Injection' }).click()
      await expect(page.getByText('Injection logged')).toBeVisible({ timeout: 5000 })

      // Reload page to refresh history
      await page.reload()
      await expect(page.getByRole('heading', { name: 'Injection', exact: true })).toBeVisible()

      // Wait for history to load
      const historySection = page.locator('text=History').locator('..').locator('.group')
      await expect(historySection.first()).toBeVisible({ timeout: 10000 })

      // Hover to reveal delete button
      const historyItem = historySection.first()
      await historyItem.hover()

      // Click delete button
      await historyItem.getByRole('button', { name: 'Delete injection' }).click()

      // Confirmation dialog should open
      await expect(page.getByText('Delete injection?')).toBeVisible()

      // Confirm deletion
      await page.getByRole('button', { name: 'Delete' }).click()

      // Success toast
      await expect(page.getByText('Injection deleted')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Multiple entries in same week (FLEX-021)', () => {
    test('should allow multiple weigh-ins in same week', async ({ page }) => {
      await completeOnboardingFlow(page)
      await page.goto('/weigh-in')

      // Log first weigh-in
      await expect(page.getByRole('button', { name: 'Log Weight' })).toBeVisible({ timeout: 10000 })
      await page.getByRole('button', { name: 'Log Weight' }).click()
      await page.getByPlaceholder('0.0').fill('87')
      await page.getByRole('dialog').getByRole('button', { name: 'Log Weight' }).click()
      await expect(page.getByText('Weight logged')).toBeVisible({ timeout: 5000 })

      // Wait for page to stabilize
      await page.waitForTimeout(1000)

      // Should still be able to log another weigh-in (button visible)
      await expect(page.getByRole('button', { name: 'Log Weight' })).toBeVisible()

      // Click to log second weigh-in
      await page.getByRole('button', { name: 'Log Weight' }).click()

      // Should see the info message about multiple entries
      await expect(page.getByText(/already logged this week/i)).toBeVisible()

      // Enter second weight
      await page.getByPlaceholder('0.0').fill('86.5')

      // Submit
      await page.getByRole('dialog').getByRole('button', { name: 'Log Weight' }).click()

      // Success toast (no 409 error)
      await expect(page.getByText('Weight logged')).toBeVisible({ timeout: 5000 })
    })

    test('should allow multiple injections via API (no 409 error)', async ({ page, request }) => {
      await completeOnboardingFlow(page)

      // Get user ID from localStorage
      await page.goto('/injection')
      await expect(page.getByRole('heading', { name: 'Injection', exact: true })).toBeVisible()

      const userId = await page.evaluate(() => localStorage.getItem('userId'))
      expect(userId).toBeTruthy()

      // Create first injection via API
      const response1 = await request.post('/api/injections', {
        data: {
          userId,
          site: 'ABDOMEN_LEFT',
        },
      })
      expect(response1.ok()).toBeTruthy()

      // Create second injection via API (same week) - should succeed (no 409)
      const response2 = await request.post('/api/injections', {
        data: {
          userId,
          site: 'ABDOMEN_RIGHT',
        },
      })
      expect(response2.ok()).toBeTruthy()

      // Reload page to refresh history
      await page.reload()
      await expect(page.getByRole('heading', { name: 'Injection', exact: true })).toBeVisible()

      // Both injections should appear in history section
      const historySection = page.locator('text=History').locator('..')
      await expect(historySection.getByText('Left Abdomen')).toBeVisible({ timeout: 10000 })
      await expect(historySection.getByText('Right Abdomen')).toBeVisible()
    })
  })
})
