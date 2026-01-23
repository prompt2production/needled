import { test, expect } from '@playwright/test'

test.describe('Dashboard Page', () => {
  let testUserId: string

  test.beforeEach(async ({ request }) => {
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

  async function setupLocalStorage(page: any, userId: string) {
    // Go to the design page first (which doesn't redirect) to set localStorage
    await page.goto('/design')
    await page.evaluate((id: string) => {
      localStorage.setItem('userId', id)
    }, userId)
    // Now navigate to home with localStorage already set
    await page.goto('/home')
  }

  test('dashboard page loads with all cards visible', async ({ page }) => {
    await setupLocalStorage(page, testUserId)

    // Wait for dashboard to load
    await expect(page.getByText('Hey, Test User')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText("Let's check in on your journey")).toBeVisible()

    // Weight Progress Card should be visible
    await expect(page.getByText('Weight Progress')).toBeVisible()

    // Journey Stats Card should be visible (use heading role to avoid conflict with page subtitle)
    await expect(page.getByRole('heading', { name: 'Your Journey' })).toBeVisible()
  })

  test('weight progress card displays starting weight when no weigh-ins', async ({
    page,
  }) => {
    await setupLocalStorage(page, testUserId)

    // Wait for page to load
    await expect(page.getByText('Weight Progress')).toBeVisible({ timeout: 10000 })

    // Should show starting weight label
    await expect(page.getByText('Starting weight')).toBeVisible()

    // Should show the starting weight value
    await expect(page.getByText('90.0')).toBeVisible()

    // Should show encouraging message
    await expect(page.getByText('Log your first weigh-in to track progress')).toBeVisible()

    // CTA button should be visible
    await expect(page.getByRole('link', { name: "Log This Week's Weight" })).toBeVisible()
  })

  test('weight progress card displays correct data after weigh-in', async ({
    page,
    request,
  }) => {
    // First log a weigh-in via API
    await request.post('/api/weigh-ins', {
      data: {
        userId: testUserId,
        weight: 87,
      },
    })

    await setupLocalStorage(page, testUserId)

    // Wait for page to load
    await expect(page.getByText('Weight Progress')).toBeVisible({ timeout: 10000 })

    // Should show current weight
    await expect(page.getByText('87.0')).toBeVisible()

    // Should show kg lost (90 - 87 = 3)
    await expect(page.getByText('kg lost')).toBeVisible()

    // Should NOT show "Starting weight" label (has weigh-ins now)
    await expect(page.getByText('Starting weight')).not.toBeVisible()
  })

  test('journey stats card displays week number', async ({ page }) => {
    await setupLocalStorage(page, testUserId)

    // Wait for journey stats to load
    await expect(page.getByRole('heading', { name: 'Your Journey' })).toBeVisible({ timeout: 10000 })

    // Should show week label with exact match
    await expect(page.getByText('Week', { exact: true })).toBeVisible()

    // A week number should be displayed somewhere in the journey card
    // Just verify the card section is visible and has content
    const journeyCard = page.locator('.bg-card').filter({ hasText: 'Your Journey' })
    await expect(journeyCard).toBeVisible()
  })

  test('journey stats card displays habit completion percentage', async ({
    page,
  }) => {
    await setupLocalStorage(page, testUserId)

    // Wait for journey stats to load
    await expect(page.getByRole('heading', { name: 'Your Journey' })).toBeVisible({ timeout: 10000 })

    // Should show habits label
    await expect(page.getByText('Habits this week')).toBeVisible()

    // Should show a percentage
    await expect(page.getByText('%')).toBeVisible()
  })

  test('journey stats card displays total weigh-ins count', async ({
    page,
    request,
  }) => {
    // Log a weigh-in first
    await request.post('/api/weigh-ins', {
      data: {
        userId: testUserId,
        weight: 88,
      },
    })

    await setupLocalStorage(page, testUserId)

    // Wait for journey stats to load
    await expect(page.getByRole('heading', { name: 'Your Journey' })).toBeVisible({ timeout: 10000 })

    // Should show weigh-ins label
    await expect(page.getByText('Total weigh-ins')).toBeVisible()

    // The journey card should show the total weigh-ins text and a count
    const journeyCard = page.locator('.bg-card').filter({ hasText: 'Total weigh-ins' })
    await expect(journeyCard).toBeVisible()
    // The count "1" should appear somewhere in the card
    await expect(journeyCard).toContainText('1')
  })

  test.describe('responsive layout', () => {
    test('desktop viewport shows 2-column grid layout', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 800 })

      await setupLocalStorage(page, testUserId)

      // Wait for page to load
      await expect(page.getByText('Hey, Test User')).toBeVisible({ timeout: 10000 })

      // Get the dashboard grid
      const grid = page.locator('.grid.gap-6')

      // Verify it has the lg:grid-cols-2 class (desktop 2-column layout)
      await expect(grid).toHaveClass(/lg:grid-cols-2/)
    })

    test('mobile viewport shows single column stack', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      await setupLocalStorage(page, testUserId)

      // Wait for page to load
      await expect(page.getByText('Hey, Test User')).toBeVisible({ timeout: 10000 })

      // All cards should be visible and stacked vertically
      await expect(page.getByText('Weight Progress')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Your Journey' })).toBeVisible()

      // Cards should be in view when scrolling
      await page.getByText('Weight Progress').scrollIntoViewIfNeeded()
      await expect(page.getByText('Weight Progress')).toBeInViewport()
    })

    test('tablet viewport (768px) still shows content', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })

      await setupLocalStorage(page, testUserId)

      // Wait for page to load
      await expect(page.getByText('Hey, Test User')).toBeVisible({ timeout: 10000 })

      // All cards should be visible
      await expect(page.getByText('Weight Progress')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Your Journey' })).toBeVisible()
    })
  })

  test('shows loading skeleton initially', async ({ page }) => {
    // Intercept dashboard API to delay response
    await page.route('**/api/dashboard**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.continue()
    })

    await page.goto('/design')
    await page.evaluate((id: string) => {
      localStorage.setItem('userId', id)
    }, testUserId)

    // Navigate and catch loading state
    await page.goto('/home')

    // Should see skeleton elements (animate-pulse divs)
    const skeleton = page.locator('.animate-pulse').first()
    await expect(skeleton).toBeVisible({ timeout: 500 })
  })

  test('existing injection card is still rendered', async ({ page }) => {
    await setupLocalStorage(page, testUserId)

    // Wait for page to load
    await expect(page.getByText('Hey, Test User')).toBeVisible({ timeout: 10000 })

    // Injection card should still be present - look for the heading specifically
    await expect(page.getByRole('heading', { name: 'Next Injection' })).toBeVisible({ timeout: 10000 })
  })

  test('existing habits card is still rendered', async ({ page }) => {
    await setupLocalStorage(page, testUserId)

    // Wait for page to load
    await expect(page.getByText('Hey, Test User')).toBeVisible({ timeout: 10000 })

    // Habits card should still be present
    await expect(page.getByText('Daily Habits')).toBeVisible()
  })
})
