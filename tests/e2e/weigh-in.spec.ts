import { test, expect } from '@playwright/test'

test.describe('Weekly Weigh-In', () => {
  let testUserId: string

  test.beforeEach(async ({ page, request }) => {
    // Create a test user via API
    const response = await request.post('/api/users', {
      data: {
        name: 'Test User',
        startWeight: 90,
        goalWeight: 80,
        weightUnit: 'kg',
        medication: 'OZEMPIC',
        injectionDay: 0,
      },
    })

    expect(response.ok()).toBeTruthy()
    const user = await response.json()
    testUserId = user.id
  })

  test.afterEach(async ({ request }) => {
    // Clean up: delete weigh-ins for test user
    // Note: In a real app, you'd have a cleanup endpoint or use a test database
  })

  async function setupLocalStorage(page: any, userId: string) {
    // Go to the design page first (which doesn't redirect) to set localStorage
    await page.goto('/design')
    await page.evaluate((id: string) => {
      localStorage.setItem('userId', id)
    }, userId)
    // Now navigate to weigh-in with localStorage already set
    await page.goto('/weigh-in')
  }

  test('should log a weigh-in and see results', async ({ page }) => {
    // Set up localStorage and navigate
    await setupLocalStorage(page, testUserId)

    // Wait for page to load
    await expect(page.getByRole('heading', { name: 'Weight' })).toBeVisible()

    // Should see the "Log your weight" card (first time or can weigh in)
    await expect(
      page.getByRole('button', { name: 'Log Weight' })
    ).toBeVisible({ timeout: 10000 })

    // Click Log Weight button
    await page.getByRole('button', { name: 'Log Weight' }).click()

    // The dialog should open
    await expect(page.getByText('Log your weight')).toBeVisible()

    // Enter weight
    await page.getByPlaceholder('0.0').fill('88.5')

    // Click the submit button in the dialog
    await page.getByRole('dialog').getByRole('button', { name: 'Log Weight' }).click()

    // Wait for toast to appear
    await expect(page.getByText('Weight logged')).toBeVisible({ timeout: 5000 })

    // Card should now show the logged weight
    await expect(page.getByText('88.5')).toBeVisible({ timeout: 5000 })
  })

  test('should show first-time state with starting weight reference', async ({
    page,
  }) => {
    // Set up localStorage and navigate
    await setupLocalStorage(page, testUserId)

    // Wait for page to load
    await expect(page.getByRole('heading', { name: 'Weight' })).toBeVisible()

    // Should see starting weight reference
    await expect(page.getByText(/You started at 90\.0 kg/)).toBeVisible({
      timeout: 10000,
    })
  })

  test('should validate weight input', async ({ page }) => {
    // Set up localStorage and navigate
    await setupLocalStorage(page, testUserId)

    // Open the dialog
    await expect(
      page.getByRole('button', { name: 'Log Weight' })
    ).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: 'Log Weight' }).click()

    // Enter invalid weight (too low)
    await page.getByPlaceholder('0.0').fill('30')

    // Validation message should appear
    await expect(page.getByText(/Weight must be between/)).toBeVisible()

    // Submit button should be disabled
    const submitButton = page.getByRole('dialog').getByRole('button', { name: 'Log Weight' })
    await expect(submitButton).toBeDisabled()

    // Enter valid weight
    await page.getByPlaceholder('0.0').fill('85')

    // Validation message should disappear
    await expect(page.getByText(/Weight must be between/)).not.toBeVisible()

    // Submit button should be enabled
    await expect(submitButton).toBeEnabled()
  })

  test('should show progress after logging weigh-in', async ({ page }) => {
    // Set up localStorage and navigate
    await setupLocalStorage(page, testUserId)

    // Log a weigh-in
    await expect(
      page.getByRole('button', { name: 'Log Weight' })
    ).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: 'Log Weight' }).click()
    await page.getByPlaceholder('0.0').fill('87')
    await page.getByRole('dialog').getByRole('button', { name: 'Log Weight' }).click()

    // Wait for toast and update
    await expect(page.getByText('Weight logged')).toBeVisible({ timeout: 5000 })

    // Reload to see progress (page fetches data on mount)
    await page.reload()

    // Progress section should show total change
    await expect(page.getByText('Total change')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('-3.0')).toBeVisible() // 87 - 90 = -3

    // Should show progress percentage (10kg target, 3kg lost = 30%)
    await expect(page.getByText(/30%/)).toBeVisible()
    await expect(page.getByText('To goal')).toBeVisible()
  })

  test('should not allow weighing in twice in same week', async ({ page }) => {
    // Set up localStorage and navigate
    await setupLocalStorage(page, testUserId)

    // Log first weigh-in
    await expect(
      page.getByRole('button', { name: 'Log Weight' })
    ).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: 'Log Weight' }).click()
    await page.getByPlaceholder('0.0').fill('88')
    await page.getByRole('dialog').getByRole('button', { name: 'Log Weight' }).click()

    // Wait for toast
    await expect(page.getByText('Weight logged')).toBeVisible({ timeout: 5000 })

    // Card should now show logged weight instead of input prompt
    await expect(page.getByText('88.0')).toBeVisible({ timeout: 5000 })

    // Log Weight button should NOT be visible (already logged this week)
    await expect(page.getByRole('button', { name: 'Log Weight' })).not.toBeVisible()

    // Should show "This week" indicator
    await expect(page.getByText('This week')).toBeVisible()
  })
})
