import { test, expect } from '@playwright/test'

test.describe('Injection Tracking', () => {
  let testUserId: string

  // Get today's day of week (0 = Monday, 6 = Sunday)
  const today = new Date()
  const jsDay = today.getDay() // 0 = Sunday in JS
  const todayAsInjectionDay = jsDay === 0 ? 6 : jsDay - 1 // Convert to our system

  test.beforeEach(async ({ page, request }) => {
    // Create a test user with injection day set to today
    const response = await request.post('/api/users', {
      data: {
        name: 'Test User',
        startWeight: 90,
        goalWeight: 80,
        weightUnit: 'kg',
        medication: 'OZEMPIC',
        injectionDay: todayAsInjectionDay,
      },
    })

    expect(response.ok()).toBeTruthy()
    const user = await response.json()
    testUserId = user.id
  })

  async function setupLocalStorage(page: any, userId: string) {
    // Go to the design page first (which doesn't redirect) to set localStorage
    await page.goto('/design')
    await page.evaluate((id: string) => {
      localStorage.setItem('userId', id)
    }, userId)
  }

  test('should show "due" state on injection day and log injection', async ({
    page,
  }) => {
    // Set up localStorage and navigate
    await setupLocalStorage(page, testUserId)
    await page.goto('/home')

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /Hey,/ })).toBeVisible()

    // Should see the InjectionCard in "due" state
    await expect(page.getByText('Injection Day')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/Time to take your Ozempic/)).toBeVisible()

    // Click Log Injection button
    await page.getByRole('button', { name: 'Log Injection' }).click()

    // Dialog should open
    await expect(
      page.getByRole('dialog').getByRole('heading', { name: 'Log Injection' })
    ).toBeVisible()

    // Select an injection site
    await page.getByRole('button', { name: 'Left Abdomen' }).click()

    // Submit the injection
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Log Injection' })
      .click()

    // Wait for toast to appear
    await expect(page.getByText('Injection logged')).toBeVisible({
      timeout: 5000,
    })

    // Card should now show "done" state
    await expect(page.getByText('Injection Done')).toBeVisible({ timeout: 5000 })
    // The card content shows the site
    await expect(page.getByRole('main').getByText('Left Abdomen').first()).toBeVisible()
  })

  test('should disable submit button until site is selected', async ({
    page,
  }) => {
    // Set up localStorage and navigate
    await setupLocalStorage(page, testUserId)
    await page.goto('/home')

    // Click Log Injection button
    await expect(
      page.getByRole('button', { name: 'Log Injection' })
    ).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: 'Log Injection' }).click()

    // Submit button should be disabled initially
    const submitButton = page
      .getByRole('dialog')
      .getByRole('button', { name: 'Log Injection' })
    await expect(submitButton).toBeDisabled()

    // Select a site
    await page.getByRole('button', { name: 'Right Thigh' }).click()

    // Submit button should now be enabled
    await expect(submitButton).toBeEnabled()
  })

  test('should show injection page with history', async ({ page, request }) => {
    // First, log an injection via API
    await request.post('/api/injections', {
      data: {
        userId: testUserId,
        site: 'ABDOMEN_LEFT',
        notes: 'Test note',
      },
    })

    // Set up localStorage and navigate to injection page
    await setupLocalStorage(page, testUserId)
    await page.goto('/injection')

    // Wait for page to load
    await expect(page.getByRole('heading', { name: 'Injection', exact: true })).toBeVisible()

    // Should show "done" state
    await expect(page.getByText('Injection Done')).toBeVisible({ timeout: 10000 })

    // Should show history with the injection
    await expect(page.getByText('Left Abdomen').first()).toBeVisible()
    await expect(page.getByText('Test note')).toBeVisible()

    // Site rotation summary should show the used site highlighted
    const siteRotation = page.locator('.bg-lime\\/10').first()
    await expect(siteRotation).toBeVisible()
  })

  test('should navigate to injection page from header', async ({ page }) => {
    // Set up localStorage and navigate
    await setupLocalStorage(page, testUserId)
    await page.goto('/home')

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /Hey,/ })).toBeVisible()

    // Click injection link in navigation
    await page
      .getByRole('navigation')
      .getByRole('link', { name: 'Injection' })
      .click()

    // Should be on injection page
    await expect(page.getByRole('heading', { name: 'Injection' })).toBeVisible()
  })

  test('should not allow logging injection twice in same week', async ({
    page,
    request,
  }) => {
    // First, log an injection via API
    await request.post('/api/injections', {
      data: {
        userId: testUserId,
        site: 'THIGH_LEFT',
      },
    })

    // Set up localStorage and navigate to home
    await setupLocalStorage(page, testUserId)
    await page.goto('/home')

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /Hey,/ })).toBeVisible()

    // Should show "done" state, not "due"
    await expect(page.getByText('Injection Done')).toBeVisible({ timeout: 10000 })

    // Log Injection button should NOT be visible
    await expect(
      page.getByRole('button', { name: 'Log Injection' })
    ).not.toBeVisible()

    // Should show the site that was used
    await expect(page.getByText('Left Thigh')).toBeVisible()

    // View History link should be visible
    await expect(page.getByRole('link', { name: 'View History' })).toBeVisible()
  })
})
