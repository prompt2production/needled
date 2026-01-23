import { test, expect } from '@playwright/test'

test.describe('Login & Session Management', () => {
  test.describe('Protected route access', () => {
    test('should redirect unauthenticated users from /dashboard to /login', async ({ page }) => {
      // Clear any existing auth state
      await page.goto('/login')
      await page.context().clearCookies()
      await page.evaluate(() => localStorage.clear())

      // Try to access dashboard
      await page.goto('/dashboard')

      // Should be redirected to login
      await expect(page).toHaveURL('/login', { timeout: 5000 })
    })

    test('should redirect unauthenticated users from /calendar to /login', async ({ page }) => {
      // Clear any existing auth state
      await page.goto('/login')
      await page.context().clearCookies()
      await page.evaluate(() => localStorage.clear())

      // Try to access calendar
      await page.goto('/calendar')

      // Should be redirected to login
      await expect(page).toHaveURL('/login', { timeout: 5000 })
    })

    test('should redirect unauthenticated users from /weigh-in to /login', async ({ page }) => {
      // Clear any existing auth state
      await page.goto('/login')
      await page.context().clearCookies()
      await page.evaluate(() => localStorage.clear())

      // Try to access weigh-in
      await page.goto('/weigh-in')

      // Should be redirected to login
      await expect(page).toHaveURL('/login', { timeout: 5000 })
    })

    test('should redirect unauthenticated users from /habits to /login', async ({ page }) => {
      // Clear any existing auth state
      await page.goto('/login')
      await page.context().clearCookies()
      await page.evaluate(() => localStorage.clear())

      // Try to access habits
      await page.goto('/habits')

      // Should be redirected to login
      await expect(page).toHaveURL('/login', { timeout: 5000 })
    })
  })

  test.describe('Login page UI', () => {
    test('should display login form with email and password fields', async ({ page }) => {
      // Clear any existing auth state
      await page.goto('/login')
      await page.context().clearCookies()
      await page.evaluate(() => localStorage.clear())
      await page.reload()

      // Verify login form elements
      await expect(page.getByPlaceholder('you@example.com')).toBeVisible({ timeout: 5000 })
      await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible()
      await expect(page.getByText('New here?')).toBeVisible()
      await expect(page.getByRole('link', { name: 'Create an account' })).toBeVisible()
    })

    test('should disable login button when fields are empty', async ({ page }) => {
      await page.goto('/login')
      await page.context().clearCookies()
      await page.evaluate(() => localStorage.clear())
      await page.reload()

      // Button should be disabled initially
      await expect(page.getByRole('button', { name: 'Log in' })).toBeDisabled()
    })

    test('should enable login button when fields are filled', async ({ page }) => {
      await page.goto('/login')
      await page.context().clearCookies()
      await page.evaluate(() => localStorage.clear())
      await page.reload()

      // Fill in credentials
      await page.getByPlaceholder('you@example.com').fill('test@example.com')
      await page.getByPlaceholder('Enter your password').fill('password123')

      // Button should be enabled
      await expect(page.getByRole('button', { name: 'Log in' })).toBeEnabled()
    })
  })

  test.describe('Public route access', () => {
    test('should allow access to home page without auth', async ({ page }) => {
      // Clear any existing auth state
      await page.goto('/login')
      await page.context().clearCookies()
      await page.evaluate(() => localStorage.clear())

      // Visit home page
      await page.goto('/')

      // Should stay on home page (not redirect to login)
      await expect(page).toHaveURL('/', { timeout: 5000 })
    })

    test('should allow access to onboarding without auth', async ({ page }) => {
      // Clear any existing auth state
      await page.goto('/login')
      await page.context().clearCookies()
      await page.evaluate(() => localStorage.clear())

      // Visit onboarding
      await page.goto('/onboarding')

      // Should stay on onboarding
      await expect(page).toHaveURL('/onboarding', { timeout: 5000 })
    })
  })
})
