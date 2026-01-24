import { test, expect } from '@playwright/test'

test.describe('Dose Tracking', () => {
  let testUserId: string

  // Get today's day of week (0 = Monday, 6 = Sunday)
  const today = new Date()
  const jsDay = today.getDay() // 0 = Sunday in JS
  const todayAsInjectionDay = jsDay === 0 ? 6 : jsDay - 1 // Convert to our system

  test.beforeEach(async ({ page, request }) => {
    // Create a test user with injection day set to today
    const response = await request.post('/api/users', {
      data: {
        name: 'Dose Test User',
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

  // DOSE-016: Test logging injection with default dose
  test('should log injection with default suggested dose', async ({ page }) => {
    await setupLocalStorage(page, testUserId)
    await page.goto('/home')

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /Hey,/ })).toBeVisible()

    // Should see the InjectionCard in "due" state
    await expect(page.getByText('Injection Day')).toBeVisible({ timeout: 10000 })

    // Click Log Injection button
    await page.getByRole('button', { name: 'Log Injection' }).click()

    // Dialog should open with DoseSelector visible
    await expect(
      page.getByRole('dialog').getByRole('heading', { name: 'Log Injection' })
    ).toBeVisible()

    // Should see dose selector with dose 1 as suggested (first injection)
    const doseButton1 = page.getByRole('dialog').getByRole('button', { name: '1' })
    await expect(doseButton1).toBeVisible()

    // Dose 1 should have 'Suggested' label (first injection defaults to dose 1)
    await expect(page.getByText('Suggested')).toBeVisible()

    // Select an injection site
    await page.getByRole('button', { name: 'Left Abdomen' }).click()

    // Submit the injection (dose 1 should be selected by default)
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Log Injection' })
      .click()

    // Wait for success
    await expect(page.getByText('Injection logged')).toBeVisible({
      timeout: 5000,
    })

    // Navigate to injection page to see history
    await page.goto('/injection')

    // Check history shows dose 1
    await expect(page.getByText('Dose 1 - Left Abdomen')).toBeVisible({ timeout: 10000 })
  })

  // DOSE-016: Test selecting a different dose number
  test('should allow selecting a different dose number', async ({ page }) => {
    await setupLocalStorage(page, testUserId)
    await page.goto('/home')

    // Wait for page to load
    await expect(page.getByText('Injection Day')).toBeVisible({ timeout: 10000 })

    // Click Log Injection button
    await page.getByRole('button', { name: 'Log Injection' }).click()

    // Select dose 3 instead of suggested dose 1
    await page.getByRole('dialog').getByRole('button', { name: '3' }).click()

    // Select an injection site
    await page.getByRole('button', { name: 'Right Thigh' }).click()

    // Submit the injection
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Log Injection' })
      .click()

    // Wait for success
    await expect(page.getByText('Injection logged')).toBeVisible({
      timeout: 5000,
    })

    // Navigate to injection page to see history
    await page.goto('/injection')

    // Check history shows dose 3
    await expect(page.getByText('Dose 3 - Right Thigh')).toBeVisible({ timeout: 10000 })
  })

  // DOSE-017: Test editing dose on existing injection
  test('should edit dose number on existing injection', async ({
    page,
    request,
  }) => {
    // Create an injection with dose 2
    await request.post('/api/injections', {
      data: {
        userId: testUserId,
        site: 'ABDOMEN_RIGHT',
        doseNumber: 2,
      },
    })

    await setupLocalStorage(page, testUserId)
    await page.goto('/injection')

    // Wait for history to load
    await expect(page.getByText('Dose 2 - Right Abdomen')).toBeVisible({ timeout: 10000 })

    // Hover and click edit button
    const historyItem = page.locator('.group').filter({ hasText: 'Right Abdomen' }).first()
    await historyItem.hover()
    await historyItem.getByRole('button', { name: 'Edit injection' }).click()

    // Edit dialog should open
    await expect(
      page.getByRole('dialog').getByRole('heading', { name: 'Edit Injection' })
    ).toBeVisible()

    // Change dose from 2 to 4
    await page.getByRole('dialog').getByRole('button', { name: '4' }).click()

    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click()

    // Wait for success
    await expect(page.getByText('Injection updated')).toBeVisible({
      timeout: 5000,
    })

    // Check history now shows dose 4
    await expect(page.getByText('Dose 4 - Right Abdomen')).toBeVisible({ timeout: 5000 })
  })

  // DOSE-018: Test doses remaining card visibility
  test('should show doses remaining card on injection page', async ({
    page,
    request,
  }) => {
    // Create an injection with dose 1
    await request.post('/api/injections', {
      data: {
        userId: testUserId,
        site: 'THIGH_LEFT',
        doseNumber: 1,
      },
    })

    await setupLocalStorage(page, testUserId)
    await page.goto('/injection')

    // Wait for page to load
    await expect(page.getByRole('heading', { name: 'Injection', exact: true })).toBeVisible()

    // Should show Pen Status card
    await expect(page.getByText('Pen Status')).toBeVisible({ timeout: 10000 })

    // Should show current dose information
    await expect(page.getByText('Dose 1 of 4')).toBeVisible()

    // Should show doses remaining
    await expect(page.getByText('3 doses remaining')).toBeVisible()
  })

  // DOSE-018: Test dose count updates after logging injection
  test('should update dose count after logging new injection', async ({
    page,
    request,
  }) => {
    // Create first injection with dose 2
    await request.post('/api/injections', {
      data: {
        userId: testUserId,
        site: 'THIGH_RIGHT',
        doseNumber: 2,
      },
    })

    await setupLocalStorage(page, testUserId)
    await page.goto('/injection')

    // Verify initial state shows dose 2
    await expect(page.getByText('Dose 2 of 4')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('2 doses remaining')).toBeVisible()

    // Log another injection (dose 3) using the dialog
    await page.getByRole('button', { name: 'Log Another' }).click()

    // Select site and submit (dose 3 should be suggested)
    await page.getByRole('button', { name: 'Left Abdomen' }).click()
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Log Injection' })
      .click()

    // Wait for success
    await expect(page.getByText('Injection logged')).toBeVisible({
      timeout: 5000,
    })

    // Refresh page to see updated status
    await page.reload()

    // Verify dose count updated to 3
    await expect(page.getByText('Dose 3 of 4')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('1 dose remaining')).toBeVisible()
  })

  // DOSE-018: Test reorder message appears on dose 4
  test('should show reorder message on dose 4', async ({ page, request }) => {
    // Create injection with dose 4
    await request.post('/api/injections', {
      data: {
        userId: testUserId,
        site: 'ABDOMEN_LEFT',
        doseNumber: 4,
      },
    })

    await setupLocalStorage(page, testUserId)
    await page.goto('/injection')

    // Wait for page to load
    await expect(page.getByText('Pen Status')).toBeVisible({ timeout: 10000 })

    // Should show dose 4 of 4
    await expect(page.getByText('Dose 4 of 4')).toBeVisible()

    // Should show reorder message instead of doses remaining
    await expect(page.getByText('Last dose - time to reorder')).toBeVisible()
  })

  // DOSE-016: Verify dose appears in history after logging
  test('should show dose in history after logging', async ({ page }) => {
    await setupLocalStorage(page, testUserId)
    await page.goto('/injection')

    // Click Log Injection from the due card
    await page.getByRole('button', { name: 'Log Injection' }).click()

    // Select dose 2
    await page.getByRole('dialog').getByRole('button', { name: '2' }).click()

    // Select site
    await page.getByRole('button', { name: 'Right Abdomen' }).click()

    // Submit
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Log Injection' })
      .click()

    // Wait for success
    await expect(page.getByText('Injection logged')).toBeVisible({
      timeout: 5000,
    })

    // Reload to ensure fresh history
    await page.reload()

    // Verify dose appears in history
    await expect(page.getByText('Dose 2 - Right Abdomen')).toBeVisible({ timeout: 10000 })
  })
})
