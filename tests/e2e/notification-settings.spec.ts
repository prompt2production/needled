import { test, expect } from '@playwright/test'

// Shared setup - complete onboarding to get authenticated session
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
  await page.getByPlaceholder('Enter your name').fill('Test User')
  await page.getByRole('button', { name: 'Continue' }).click()

  // Step 3: Email and password (Account step)
  await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
  await page.getByPlaceholder('you@example.com').fill(testEmail)
  await page.getByPlaceholder('Create a password').fill(testPassword)
  await page.getByPlaceholder('Confirm your password').fill(testPassword)
  await page.getByRole('button', { name: 'Continue' }).click()

  // Step 4: Starting weight
  await expect(page.getByPlaceholder('0.0')).toBeVisible()
  await page.getByPlaceholder('0.0').fill('85')
  await page.getByRole('button', { name: 'Continue' }).click()

  // Step 5: Goal weight
  await expect(page.getByPlaceholder('0.0')).toBeVisible()
  await page.getByPlaceholder('0.0').fill('75')
  await page.getByRole('button', { name: 'Continue' }).click()

  // Step 6: Medication and injection day
  await expect(page.getByRole('button', { name: 'Ozempic' })).toBeVisible()
  await page.getByRole('button', { name: 'Ozempic' }).click()
  const dayButtons = page.locator('button.rounded-full.w-10.h-10')
  await dayButtons.first().click()

  // Complete setup
  await expect(
    page.getByRole('button', { name: 'Complete Setup' })
  ).toBeEnabled({ timeout: 5000 })
  await page.getByRole('button', { name: 'Complete Setup' }).click()

  // Wait for success screen and redirect
  await expect(page.getByText("You're all set")).toBeVisible({ timeout: 10000 })
  await expect(page).toHaveURL('/dashboard', { timeout: 5000 })
}

test.describe('Notification Settings', () => {
  test('should load settings page and display notification settings', async ({
    page,
  }) => {
    await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: 'Settings', level: 1 })
    ).toBeVisible({ timeout: 10000 })

    // Should see notification preferences description
    await expect(
      page.getByText('Manage your notification preferences')
    ).toBeVisible()

    // Should see Email Notifications card
    await expect(page.getByText('Email Notifications')).toBeVisible()

    // Should see all three notification toggles
    await expect(page.getByText('Injection reminders')).toBeVisible()
    await expect(page.getByText('Weigh-in reminders')).toBeVisible()
    await expect(page.getByText('Daily habit reminders')).toBeVisible()
  })

  test('should toggle notification preferences', async ({ page }) => {
    await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for settings to load
    await expect(page.getByText('Email Notifications')).toBeVisible({
      timeout: 10000,
    })

    // Find the injection reminder switch
    const switchElements = page.locator('[role="switch"]')
    await expect(switchElements.first()).toBeVisible()

    // Get initial state of first switch
    const initialState = await switchElements.first().getAttribute('data-state')

    // Click to toggle
    await switchElements.first().click()

    // Wait for save toast
    await expect(page.getByText('Preferences saved')).toBeVisible({
      timeout: 5000,
    })

    // Verify state changed
    const newState = await switchElements.first().getAttribute('data-state')
    expect(newState).not.toBe(initialState)
  })

  test('should change reminder times', async ({ page }) => {
    await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for settings to load
    await expect(page.getByText('Reminder Times')).toBeVisible({
      timeout: 10000,
    })

    // Find the time input
    const timeInput = page.locator('input[type="time"]').first()
    await expect(timeInput).toBeVisible()

    // Enter new time
    await timeInput.fill('10:30')

    // Wait for save toast
    await expect(page.getByText('Preferences saved')).toBeVisible({
      timeout: 5000,
    })
  })

  test('should display test email buttons', async ({ page }) => {
    await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for settings to load
    await expect(page.getByText('Email Notifications')).toBeVisible({
      timeout: 10000,
    })

    // Should see Send test buttons
    const testButtons = page.getByRole('button', { name: /send test/i })
    const count = await testButtons.count()

    // Should have 3 test buttons (one per notification type)
    expect(count).toBe(3)
  })

  test('should show email required notice when user has no email', async () => {
    // This test is skipped because the current onboarding flow always requires email
    test.skip()
  })
})
