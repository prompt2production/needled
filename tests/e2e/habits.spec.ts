import { test, expect } from '@playwright/test'

test.describe('Daily Habits', () => {
  let testUserId: string

  test.beforeEach(async ({ page, request }) => {
    // Create a test user
    const response = await request.post('/api/users', {
      data: {
        name: 'Test User',
        startWeight: 90,
        goalWeight: 80,
        weightUnit: 'kg',
        medication: 'OZEMPIC',
        injectionDay: 2, // Wednesday
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

  test('should check and uncheck habits on home page', async ({ page }) => {
    // Set up localStorage and navigate
    await setupLocalStorage(page, testUserId)
    await page.goto('/home')

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /Hey,/ })).toBeVisible()

    // Should see the HabitsCard
    await expect(page.getByText('Daily Habits')).toBeVisible({ timeout: 10000 })

    // All habits should initially be unchecked (no lime background on indicators)
    // Water row should be visible
    await expect(page.getByRole('button', { name: /water/i })).toBeVisible()

    // Click water habit to check it
    await page.getByRole('button', { name: /check water/i }).click()

    // Wait for success toast
    await expect(page.getByText('Water logged')).toBeVisible({ timeout: 5000 })

    // Water habit should now show as checked (has check icon)
    const waterButton = page.getByRole('button', { name: /uncheck water/i })
    await expect(waterButton).toBeVisible()

    // Click water habit again to uncheck
    await waterButton.click()

    // Wait for removal toast
    await expect(page.getByText('Water removed')).toBeVisible({ timeout: 5000 })

    // Water habit should now show as unchecked
    await expect(
      page.getByRole('button', { name: /check water/i })
    ).toBeVisible()
  })

  test('should check multiple habits', async ({ page }) => {
    // Set up localStorage and navigate
    await setupLocalStorage(page, testUserId)
    await page.goto('/home')

    // Wait for habits card to load
    await expect(page.getByText('Daily Habits')).toBeVisible({ timeout: 10000 })

    // Check water
    await page.getByRole('button', { name: /check water/i }).click()
    await expect(page.getByText('Water logged')).toBeVisible({ timeout: 5000 })

    // Check nutrition
    await page.getByRole('button', { name: /check nutrition/i }).click()
    await expect(page.getByText('Nutrition logged')).toBeVisible({
      timeout: 5000,
    })

    // Check exercise
    await page.getByRole('button', { name: /check exercise/i }).click()
    await expect(page.getByText('Exercise logged')).toBeVisible({
      timeout: 5000,
    })

    // All three should now be checked
    await expect(
      page.getByRole('button', { name: /uncheck water/i })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /uncheck nutrition/i })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /uncheck exercise/i })
    ).toBeVisible()
  })

  test('should display habits page with weekly view', async ({ page }) => {
    // Set up localStorage and navigate
    await setupLocalStorage(page, testUserId)
    await page.goto('/habits')

    // Should see page title
    await expect(
      page.getByRole('heading', { name: 'Habits', level: 1 })
    ).toBeVisible()

    // Should see Daily Habits card
    await expect(page.getByText('Daily Habits')).toBeVisible({ timeout: 10000 })

    // Should see This Week section
    await expect(page.getByText('This Week')).toBeVisible()

    // Should see day labels in the weekly grid
    // We check for the letter labels M, T, W, etc.
    await expect(page.getByRole('button', { name: /M -/ }).first()).toBeVisible()

    // Should be able to interact with today's habit
    const todayButtons = page.getByRole('button', { name: /today/i })
    const count = await todayButtons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should navigate to habits page from header', async ({ page }) => {
    // Set up localStorage and navigate
    await setupLocalStorage(page, testUserId)
    await page.goto('/home')

    // Wait for page to load
    await expect(page.getByRole('heading', { name: /Hey,/ })).toBeVisible()

    // Click Habits link in header
    await page.getByRole('link', { name: /habits/i }).first().click()

    // Should be on habits page
    await expect(
      page.getByRole('heading', { name: 'Habits', level: 1 })
    ).toBeVisible()
  })
})
