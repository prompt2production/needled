import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should display the marketing landing page', async ({ page }) => {
    await page.goto('/')

    // Check brand
    await expect(page.locator('h1')).toHaveText('Welcome to Needled')
    await expect(page.getByText('Your GLP-1 journey companion')).toBeVisible()

    // Check feature cards
    await expect(page.getByText('Track Injections')).toBeVisible()
    await expect(page.getByText('Weekly Weigh-ins')).toBeVisible()
    await expect(page.getByText('Build Habits')).toBeVisible()

    // Check app store CTAs
    await expect(page.getByText('Download for iOS')).toBeVisible()
    await expect(page.getByText('Download for Android')).toBeVisible()

    // Check footer links
    await expect(page.getByText('Privacy Policy')).toBeVisible()
    await expect(page.getByText('Terms of Service')).toBeVisible()
    await expect(page.getByText('Contact')).toBeVisible()
  })

  test('should have working app store links', async ({ page }) => {
    await page.goto('/')

    // Verify the placeholder links exist
    const iosLink = page.locator('a[href="#ios"]')
    const androidLink = page.locator('a[href="#android"]')

    await expect(iosLink).toBeVisible()
    await expect(androidLink).toBeVisible()
  })
})

test.describe('Unsubscribe Page', () => {
  test('should show error when no token is provided', async ({ page }) => {
    await page.goto('/unsubscribe')

    // Should show error state with friendly messaging
    await expect(page.getByText('Oops! Something went wrong')).toBeVisible()
    await expect(page.getByText('No unsubscribe token provided')).toBeVisible()
    await expect(page.getByText('Back to Home')).toBeVisible()
  })
})
