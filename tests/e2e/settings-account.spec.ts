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

async function login(page: any, email: string, password: string) {
  await page.goto('/login')
  await expect(page.getByPlaceholder('you@example.com')).toBeVisible({ timeout: 10000 })
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('Enter your password').fill(password)
  await page.getByRole('button', { name: 'Log in' }).click()
  await expect(page).toHaveURL('/dashboard', { timeout: 5000 })
}

async function logout(page: any) {
  // Click logout button
  await page.getByRole('button', { name: 'Logout' }).click()
  // Should redirect to home/login
  await expect(page).toHaveURL('/', { timeout: 5000 })
}

test.describe('Account Settings', () => {
  test('should update email address', async ({ page }) => {
    const { email, password } = await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for settings to load
    await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible({
      timeout: 10000,
    })

    // Get the email input (labeled "Email Address")
    const emailInput = page.getByLabel('Email Address')
    await expect(emailInput).toBeVisible()

    const newEmail = `updated-${Date.now()}@example.com`
    await emailInput.clear()
    await emailInput.fill(newEmail)

    // Click the Update Email button
    await page.getByRole('button', { name: 'Update Email' }).click()

    // Wait for success toast
    await expect(page.getByText('Email updated')).toBeVisible({ timeout: 5000 })

    // Logout
    await logout(page)

    // Login with new email
    await login(page, newEmail, password)

    // Should be on dashboard
    await expect(page).toHaveURL('/dashboard')
  })

  test('should show error for duplicate email', async ({ page }) => {
    // Create first user
    const { email: firstEmail } = await completeOnboardingFlow(page)

    // Clear cookies and create second user
    await page.context().clearCookies()
    await page.evaluate(() => localStorage.clear())

    await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for settings to load
    await expect(page.getByLabel('Email Address')).toBeVisible({ timeout: 10000 })

    // Try to change to the first user's email
    const emailInput = page.getByLabel('Email Address')
    await emailInput.clear()
    await emailInput.fill(firstEmail)

    // Click Update Email
    await page.getByRole('button', { name: 'Update Email' }).click()

    // Should see error message
    await expect(page.getByText('Email already in use')).toBeVisible({ timeout: 5000 })
  })

  test('should change password', async ({ page }) => {
    const { email, password } = await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for settings to load
    await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible({
      timeout: 10000,
    })

    // Expand the password change section by clicking the trigger text
    await page.getByText('Change Password').first().click()

    // Fill in password fields - use exact label matching
    const newPassword = 'newpassword456'
    await page.getByLabel('Current Password').fill(password)
    await page.getByLabel('New Password', { exact: true }).fill(newPassword)
    await page.getByLabel('Confirm New Password').fill(newPassword)

    // Submit - the button inside the form is also "Change Password"
    // Use getByRole with exact match to find the submit button
    await page.locator('form').getByRole('button', { name: 'Change Password' }).click()

    // Wait for success toast
    await expect(page.getByText('Password changed successfully')).toBeVisible({ timeout: 5000 })

    // Logout
    await logout(page)

    // Login with new password
    await login(page, email, newPassword)

    // Should be on dashboard
    await expect(page).toHaveURL('/dashboard')
  })

  test('should reject incorrect current password', async ({ page }) => {
    await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for settings to load
    await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible({
      timeout: 10000,
    })

    // Expand the password change section
    await page.getByText('Change Password').first().click()

    // Fill in password fields with wrong current password
    await page.getByLabel('Current Password').fill('wrongpassword')
    await page.getByLabel('New Password', { exact: true }).fill('newpassword456')
    await page.getByLabel('Confirm New Password').fill('newpassword456')

    // Submit
    await page.locator('form').getByRole('button', { name: 'Change Password' }).click()

    // Should see error - the component shows "Incorrect current password"
    await expect(page.getByText('Incorrect current password')).toBeVisible({ timeout: 5000 })
  })

  test('should verify old password no longer works after password change', async ({ page }) => {
    const { email, password } = await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for settings to load
    await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible({
      timeout: 10000,
    })

    // Change password
    await page.getByText('Change Password').first().click()
    const newPassword = 'newpassword789'
    await page.getByLabel('Current Password').fill(password)
    await page.getByLabel('New Password', { exact: true }).fill(newPassword)
    await page.getByLabel('Confirm New Password').fill(newPassword)
    await page.locator('form').getByRole('button', { name: 'Change Password' }).click()
    await expect(page.getByText('Password changed successfully')).toBeVisible({ timeout: 5000 })

    // Logout
    await logout(page)

    // Try to login with old password
    await page.goto('/login')
    await page.getByPlaceholder('you@example.com').fill(email)
    await page.getByPlaceholder('Enter your password').fill(password)
    await page.getByRole('button', { name: 'Log in' }).click()

    // Should see error
    await expect(page.getByText('Invalid email or password')).toBeVisible({ timeout: 5000 })
  })
})
