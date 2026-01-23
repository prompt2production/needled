import { test, expect } from '@playwright/test'

test.describe('User Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/onboarding')
    await page.evaluate(() => {
      localStorage.clear()
    })
    await page.reload()
  })

  test('should navigate through all 5 steps and complete onboarding', async ({ page }) => {
    // Step 1: Welcome screen
    await expect(page.getByRole('heading', { name: 'Needled' })).toBeVisible()
    await expect(page.getByText('Your journey companion')).toBeVisible()
    await page.getByRole('button', { name: 'Get Started' }).click()

    // Step 2: Name input
    await expect(page.getByRole('heading', { name: 'What should we call you?' })).toBeVisible()
    await page.getByPlaceholder('Enter your name').fill('Test User')
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 3: Starting weight
    await expect(page.getByRole('heading', { name: "What's your current weight?" })).toBeVisible()
    await page.getByPlaceholder('0.0').fill('85')
    // Verify kg is selected by default
    await expect(page.getByRole('button', { name: 'kg' })).toHaveClass(/bg-lime/)
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 4: Goal weight
    await expect(page.getByRole('heading', { name: "What's your goal weight?" })).toBeVisible()
    await page.getByPlaceholder('0.0').fill('75')
    // Verify the "X kg to lose" message appears
    await expect(page.getByText(/10\.0 kg to lose/)).toBeVisible()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 5: Medication and injection day
    await expect(page.getByRole('heading', { name: 'Final step' })).toBeVisible()
    // Select medication
    await page.getByRole('button', { name: 'Ozempic' }).click()
    // Select injection day - click the first day button (Monday)
    // The day buttons are within a flex container after the "What day do you take your injection?" label
    const dayButtons = page.locator('button.rounded-full.w-10.h-10')
    await dayButtons.first().click()
    // Complete setup - wait for button to be enabled
    await expect(page.getByRole('button', { name: 'Complete Setup' })).toBeEnabled()
    await page.getByRole('button', { name: 'Complete Setup' }).click()

    // Success screen
    await expect(page.getByText("You're all set, Test User!")).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Your profile is ready')).toBeVisible()

    // Verify redirect to home page (wait for navigation)
    await expect(page).toHaveURL('/home', { timeout: 5000 })
  })

  test('should skip goal weight when clicking skip link', async ({ page }) => {
    // Navigate to step 4
    await page.getByRole('button', { name: 'Get Started' }).click()
    await page.getByPlaceholder('Enter your name').fill('Skip Tester')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByPlaceholder('0.0').fill('80')
    await page.getByRole('button', { name: 'Continue' }).click()

    // Skip goal weight
    await expect(page.getByRole('heading', { name: "What's your goal weight?" })).toBeVisible()
    await page.getByRole('button', { name: 'Skip for now' }).click()

    // Should be on medication step
    await expect(page.getByRole('heading', { name: 'Final step' })).toBeVisible()
  })

  test('should persist progress on page reload', async ({ page }) => {
    // Complete steps 1-2
    await page.getByRole('button', { name: 'Get Started' }).click()
    await page.getByPlaceholder('Enter your name').fill('Persistent User')
    await page.getByRole('button', { name: 'Continue' }).click()

    // Reload the page
    await page.reload()

    // Should be on step 3, not step 1
    await expect(page.getByRole('heading', { name: "What's your current weight?" })).toBeVisible()
  })

  test('should navigate back to previous steps', async ({ page }) => {
    // Go to step 3
    await page.getByRole('button', { name: 'Get Started' }).click()
    await page.getByPlaceholder('Enter your name').fill('Back Button Test')
    await page.getByRole('button', { name: 'Continue' }).click()

    // Verify we're on step 3
    await expect(page.getByRole('heading', { name: "What's your current weight?" })).toBeVisible()

    // Go back
    await page.getByRole('button', { name: 'Go back' }).click()

    // Should be back on step 2
    await expect(page.getByRole('heading', { name: 'What should we call you?' })).toBeVisible()
    // Name should still be filled in
    await expect(page.getByPlaceholder('Enter your name')).toHaveValue('Back Button Test')
  })

  test('should redirect to home if user already has profile', async ({ page }) => {
    // Set userId in localStorage to simulate existing user
    await page.evaluate(() => {
      localStorage.setItem('userId', 'existing-user-id')
    })
    await page.reload()

    // Should redirect to home
    await expect(page).toHaveURL('/home', { timeout: 5000 })
  })

  test('should disable Continue until name is 2+ characters', async ({ page }) => {
    await page.getByRole('button', { name: 'Get Started' }).click()

    const continueButton = page.getByRole('button', { name: 'Continue' })

    // Button should be disabled initially
    await expect(continueButton).toBeDisabled()

    // Single character - still disabled
    await page.getByPlaceholder('Enter your name').fill('A')
    await expect(continueButton).toBeDisabled()

    // Two characters - should be enabled
    await page.getByPlaceholder('Enter your name').fill('Ab')
    await expect(continueButton).toBeEnabled()
  })

  test('should validate weight ranges', async ({ page }) => {
    // Navigate to weight step
    await page.getByRole('button', { name: 'Get Started' }).click()
    await page.getByPlaceholder('Enter your name').fill('Validator')
    await page.getByRole('button', { name: 'Continue' }).click()

    const continueButton = page.getByRole('button', { name: 'Continue' })

    // Invalid weight (too low)
    await page.getByPlaceholder('0.0').fill('30')
    await expect(page.getByText(/Weight must be between/)).toBeVisible()
    await expect(continueButton).toBeDisabled()

    // Valid weight
    await page.getByPlaceholder('0.0').fill('85')
    await expect(page.getByText(/Weight must be between/)).not.toBeVisible()
    await expect(continueButton).toBeEnabled()
  })
})
