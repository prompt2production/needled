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

  return { email: testEmail, password: testPassword }
}

test.describe('Data Settings', () => {
  test('should export data and download JSON file', async ({ page }) => {
    await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for settings to load
    await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible({
      timeout: 10000,
    })

    // Set up download handler
    const downloadPromise = page.waitForEvent('download')

    // Click the Export button
    await page.getByRole('button', { name: 'Export' }).click()

    // Wait for download
    const download = await downloadPromise

    // Verify download filename contains expected pattern
    const filename = download.suggestedFilename()
    expect(filename).toMatch(/needled-export-\d{4}-\d{2}-\d{2}\.json/)

    // Wait for success toast
    await expect(page.getByText('Your data is downloading')).toBeVisible({ timeout: 5000 })
  })

  test('should export data with expected structure', async ({ page }) => {
    await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for settings to load
    await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible({
      timeout: 10000,
    })

    // Set up download handler
    const downloadPromise = page.waitForEvent('download')

    // Click the Export button
    await page.getByRole('button', { name: 'Export' }).click()

    // Wait for download
    const download = await downloadPromise

    // Read the downloaded file
    const path = await download.path()
    const fs = require('fs')
    const content = fs.readFileSync(path, 'utf8')
    const data = JSON.parse(content)

    // Verify data structure
    expect(data).toHaveProperty('exportedAt')
    expect(data).toHaveProperty('exportVersion')
    expect(data).toHaveProperty('user')
    expect(data.user).toHaveProperty('profile')
    expect(data.user.profile).toHaveProperty('name', 'Test User')
    expect(data.user.profile).toHaveProperty('email')
    expect(data).toHaveProperty('weighIns')
    expect(data).toHaveProperty('injections')
    expect(data).toHaveProperty('dailyHabits')

    // Should not contain sensitive data
    expect(data.user.profile).not.toHaveProperty('passwordHash')
  })

  test('should show delete account confirmation dialog', async ({ page }) => {
    await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for settings to load
    await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible({
      timeout: 10000,
    })

    // Click Delete Account button
    await page.getByRole('button', { name: 'Delete Account' }).click()

    // Verify dialog is shown
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('This action cannot be undone')).toBeVisible()
    await expect(page.getByText('Your profile information')).toBeVisible()
    await expect(page.getByText('All weight recordings')).toBeVisible()
    await expect(page.getByText('All injection logs')).toBeVisible()
  })

  test('should reject incorrect password on delete', async ({ page }) => {
    await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for settings to load
    await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible({
      timeout: 10000,
    })

    // Click Delete Account button
    await page.getByRole('button', { name: 'Delete Account' }).click()

    // Wait for dialog
    await expect(page.getByRole('dialog')).toBeVisible()

    // Enter wrong password
    await page.getByPlaceholder('Your password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Delete My Account' }).click()

    // Should see error
    await expect(page.getByText('Incorrect password')).toBeVisible({ timeout: 5000 })
  })

  test('should delete account and redirect to landing page', async ({ page }) => {
    const { email, password } = await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for settings to load
    await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible({
      timeout: 10000,
    })

    // Click Delete Account button
    await page.getByRole('button', { name: 'Delete Account' }).click()

    // Wait for dialog
    await expect(page.getByRole('dialog')).toBeVisible()

    // Enter correct password
    await page.getByPlaceholder('Your password').fill(password)
    await page.getByRole('button', { name: 'Delete My Account' }).click()

    // Wait for success toast
    await expect(page.getByText('Account deleted successfully')).toBeVisible({ timeout: 5000 })

    // Should redirect to landing page
    await expect(page).toHaveURL('/', { timeout: 5000 })
  })

  test('should verify login fails after account deletion', async ({ page }) => {
    const { email, password } = await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for settings to load
    await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible({
      timeout: 10000,
    })

    // Delete account
    await page.getByRole('button', { name: 'Delete Account' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByPlaceholder('Your password').fill(password)
    await page.getByRole('button', { name: 'Delete My Account' }).click()

    // Wait for redirect to landing page
    await expect(page).toHaveURL('/', { timeout: 5000 })

    // Try to login with deleted account credentials
    await page.goto('/login')
    await page.getByPlaceholder('you@example.com').fill(email)
    await page.getByPlaceholder('Enter your password').fill(password)
    await page.getByRole('button', { name: 'Log in' }).click()

    // Should see error
    await expect(page.getByText('Invalid email or password')).toBeVisible({ timeout: 5000 })
  })
})
