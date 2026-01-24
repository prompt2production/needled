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

test.describe('Profile Settings', () => {
  test('should navigate to settings and display profile form', async ({
    page,
  }) => {
    await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for page to load
    await expect(
      page.getByRole('heading', { name: 'Settings', level: 1 })
    ).toBeVisible({ timeout: 10000 })

    // Should see Profile card title (use more specific selector to avoid nav conflict)
    await expect(page.getByRole('main').getByText('Profile')).toBeVisible()

    // Should see profile form fields
    await expect(page.getByLabel('Name')).toBeVisible()
    await expect(page.getByLabel('Goal Weight')).toBeVisible()
    // Medication and Injection Day use Select components, check by label text
    await expect(page.getByText('Medication')).toBeVisible()
    await expect(page.getByText('Injection Day')).toBeVisible()
  })

  test('should update name and persist after reload', async ({ page }) => {
    await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for form to load
    await expect(page.getByLabel('Name')).toBeVisible({ timeout: 10000 })

    // Update name
    const nameInput = page.getByLabel('Name')
    await nameInput.clear()
    await nameInput.fill('Updated Name')

    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click()

    // Wait for success toast
    await expect(page.getByText('Profile updated')).toBeVisible({
      timeout: 5000,
    })

    // Reload page
    await page.reload()

    // Wait for form to load
    await expect(page.getByLabel('Name')).toBeVisible({ timeout: 10000 })

    // Verify name persisted
    await expect(page.getByLabel('Name')).toHaveValue('Updated Name')
  })

  test('should update goal weight and persist after reload', async ({
    page,
  }) => {
    await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for form to load
    await expect(page.getByLabel('Goal Weight')).toBeVisible({ timeout: 10000 })

    // Update goal weight
    const goalWeightInput = page.getByLabel('Goal Weight')
    await goalWeightInput.clear()
    await goalWeightInput.fill('70')

    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click()

    // Wait for success toast
    await expect(page.getByText('Profile updated')).toBeVisible({
      timeout: 5000,
    })

    // Reload page
    await page.reload()

    // Wait for form to load
    await expect(page.getByLabel('Goal Weight')).toBeVisible({ timeout: 10000 })

    // Verify goal weight persisted
    await expect(page.getByLabel('Goal Weight')).toHaveValue('70')
  })

  test('should update medication and persist after reload', async ({
    page,
  }) => {
    await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for form to load
    await expect(page.getByLabel('Name')).toBeVisible({ timeout: 10000 })

    // Find the medication select by its associated label and trigger
    // The medication select follows the "Medication" label
    const medicationSection = page.locator('div.space-y-2').filter({ hasText: 'Medication' }).first()
    const medicationTrigger = medicationSection.locator('button[role="combobox"]')
    await medicationTrigger.click()

    // Select different option
    await page.getByRole('option', { name: 'Wegovy' }).click()

    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click()

    // Wait for success toast
    await expect(page.getByText('Profile updated')).toBeVisible({
      timeout: 5000,
    })

    // Reload page
    await page.reload()

    // Wait for form to load
    await expect(page.getByLabel('Name')).toBeVisible({ timeout: 10000 })

    // Verify medication persisted by checking the select trigger shows Wegovy
    const reloadedMedicationSection = page.locator('div.space-y-2').filter({ hasText: 'Medication' }).first()
    await expect(reloadedMedicationSection.locator('button[role="combobox"]')).toContainText('Wegovy')
  })

  test('should have save button disabled when form is pristine', async ({
    page,
  }) => {
    await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for form to load
    await expect(page.getByLabel('Name')).toBeVisible({ timeout: 10000 })

    // Save button should be disabled initially
    await expect(
      page.getByRole('button', { name: 'Save Changes' })
    ).toBeDisabled()
  })

  test('should enable save button when form is modified', async ({ page }) => {
    await completeOnboardingFlow(page)
    await page.goto('/settings')

    // Wait for form to load
    await expect(page.getByLabel('Name')).toBeVisible({ timeout: 10000 })

    // Modify name
    const nameInput = page.getByLabel('Name')
    await nameInput.clear()
    await nameInput.fill('New Name')

    // Save button should now be enabled
    await expect(
      page.getByRole('button', { name: 'Save Changes' })
    ).toBeEnabled()
  })
})
