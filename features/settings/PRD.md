# Settings Feature

## Overview

The settings feature provides users with a centralized location to manage their profile information, account credentials, and data. It allows users to update their journey parameters (goal weight, medication, injection day), manage their account security (email, password), and control their data (export, delete account).

## User Stories

### Profile Settings
- As a user, I want to update my display name so my dashboard greeting reflects my preferred name
- As a user, I want to change my goal weight as my journey evolves
- As a user, I want to update my medication type if I switch to a different GLP-1 medication
- As a user, I want to change my preferred injection day if my schedule changes

### Account Settings
- As a user, I want to change my email address for login purposes
- As a user, I want to change my password to maintain account security

### Data Management
- As a user, I want to export all my data (weigh-ins, injections, habits) as a downloadable file so I can have a personal backup or share with my healthcare provider
- As a user, I want to delete my account and all associated data if I choose to leave the platform

## Detailed Requirements

### Settings Page Structure

The settings page will be accessible from the header navigation (Settings icon or link). It will be organized into three sections:

1. **Profile Section**
   - Name (editable text input)
   - Goal Weight (numeric input with unit display)
   - Medication (dropdown select)
   - Injection Day (dropdown select: Monday-Sunday)

2. **Account Section**
   - Email (editable text input with validation)
   - Password Change (current password + new password + confirm new password)

3. **Data Section**
   - Export Data button (downloads JSON file)
   - Delete Account button (with confirmation dialog)

### Validation Rules

**Name:**
- Required
- 1-100 characters
- Trimmed whitespace

**Goal Weight:**
- Optional (can be null)
- If provided: positive number, max 500 kg / 1100 lbs
- Displayed in user's preferred unit (kg/lbs)

**Medication:**
- Required
- One of: OZEMPIC, WEGOVY, MOUNJARO, ZEPBOUND, OTHER

**Injection Day:**
- Required
- 0-6 (Monday = 0, Sunday = 6)

**Email:**
- Required for existing email users
- Valid email format
- Must be unique across all users
- Cannot change to an email that already exists

**Password:**
- Current password required to change
- New password: minimum 8 characters
- Confirm password must match new password

### Database Changes

No schema changes required. The existing User model already supports all needed fields:
- name, email, passwordHash
- goalWeight, medication, injectionDay

### API Endpoints

**GET /api/settings**
- Returns current user's settings (profile fields, email)
- Requires authentication

**PUT /api/settings/profile**
- Updates: name, goalWeight, medication, injectionDay
- Requires authentication
- Returns updated user object

**PUT /api/settings/email**
- Updates email address
- Requires authentication
- Validates email uniqueness
- Returns success/error

**PUT /api/settings/password**
- Requires: currentPassword, newPassword
- Validates current password matches
- Hashes and stores new password
- Returns success/error

**GET /api/settings/export**
- Returns JSON file with all user data:
  - Profile (name, startWeight, goalWeight, medication, etc.)
  - WeighIns (all weight records)
  - Injections (all injection records)
  - DailyHabits (all habit records)
- Content-Disposition header for download

**DELETE /api/settings/account**
- Requires password confirmation
- Deletes user and all associated data (cascades)
- Clears session cookie
- Returns success

### UI/UX Requirements

**Settings Page Layout:**
- Full-width card-based sections per DESIGN_SYSTEM.md
- Each section in its own card with clear heading
- Save buttons per section (not one global save)
- Loading states during API calls
- Success/error toasts for all operations

**Profile Section Card:**
- Inline form fields
- Save button at bottom of card
- Disable save if no changes

**Account Section Card:**
- Email field with "Update Email" button
- Password change form (collapsed by default, expandable)
- Three fields: Current Password, New Password, Confirm Password

**Data Section Card:**
- Export button with icon (Download icon)
- Delete Account button (destructive variant)
- Delete requires confirmation dialog with password input

**Confirmation Dialogs:**
- Email change: Simple confirmation dialog
- Delete Account: Warning dialog with password confirmation
  - Red destructive styling
  - Clear warning about data loss
  - Type "DELETE" or enter password to confirm

**Navigation:**
- Add Settings link to header navigation (Settings icon)
- Active state when on /settings route

### Success/Error States

**Success Messages (toast):**
- "Profile updated successfully"
- "Email updated successfully"
- "Password changed successfully"
- "Your data is downloading..."
- "Account deleted. We're sorry to see you go."

**Error Messages:**
- "Email already in use"
- "Current password is incorrect"
- "Passwords do not match"
- "Failed to update. Please try again."

### Empty States

N/A - Settings always have default values from onboarding.

### Testing Requirements

**Unit Tests:**
- Settings validation schemas
- Profile update API
- Email update API (including uniqueness check)
- Password change API
- Export data formatting
- Account deletion

**E2E Tests:**
- Update profile fields and verify persistence
- Change email and re-login
- Change password and re-login with new password
- Export data and verify download
- Delete account and verify redirect to landing

## Out of Scope

- Notification preferences (handled by notifications feature)
- Weight unit preference change (would require recalculating all historical data)
- Profile photo/avatar
- Two-factor authentication
- Account recovery/password reset (separate feature)
