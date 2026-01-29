# Flexible Logging

## Overview

Currently, the app enforces strict once-per-week logging for both weigh-ins and injections. While this prevents obsessive tracking, users need flexibility to:
- Log entries on past dates (e.g., forgot to log yesterday)
- Log multiple entries if needed (e.g., retook weight, correction)
- Edit existing entries to fix mistakes

This feature removes the hard restrictions while maintaining UI encouragement for weekly-only logging patterns.

## User Stories

### As a user logging my weight:
- I want to log my weight with a date picker so I can record past weigh-ins I forgot to log
- I want the date to default to today so the common case is fast
- I want to log multiple weigh-ins if needed so I can correct mistakes
- I want to edit my previous weigh-ins so I can fix typos
- I still want to see messaging that encourages weekly weigh-ins so I maintain healthy habits

### As a user logging my injection:
- I want to log my injection with a date picker so I can record past injections I forgot to log
- I want the date to default to today so the common case is fast
- I want to log multiple injections if needed so I can correct mistakes
- I want to edit my previous injections so I can update site or notes
- I still want to see my injection schedule and status so I stay on track

## Detailed Requirements

### Weigh-In Changes

#### Date Selection
- Add date picker to weigh-in dialog
- Default to current date (today at midnight UTC)
- Allow selection of past dates only (no future dates)
- Reasonable past limit: 90 days

#### Remove Hard Restriction
- Remove the 409 conflict error for same-week entries
- Allow multiple entries on the same day
- Keep the week boundary logic for display/encouragement only

#### Edit Functionality
- Add edit button to weigh-in history entries
- Open dialog pre-populated with existing values
- Allow changing weight and date
- Add PATCH endpoint for updates

#### Delete Functionality
- Add delete button to weigh-in history entries
- Confirmation dialog before deletion
- Add DELETE endpoint

#### UI Messaging
- When logging additional entry in same week, show subtle reminder: "You've already logged this week. Multiple weigh-ins are fine, but weekly tracking works best for most people."
- Don't block the action, just inform

### Injection Changes

#### Date Selection
- Add date picker to injection dialog
- Default to current date (today at midnight UTC)
- Allow selection of past dates only (no future dates)
- Reasonable past limit: 90 days

#### Remove Hard Restriction
- Remove the 409 conflict error for same-week entries
- Allow multiple entries on the same day
- Keep injection week logic for status display

#### Edit Functionality
- Add edit button to injection history entries
- Open dialog pre-populated with existing values (date, site, notes)
- Allow changing all fields
- Add PATCH endpoint for updates

#### Delete Functionality
- Add delete button to injection history entries
- Confirmation dialog before deletion
- Add DELETE endpoint

#### Site Rotation
- Keep site rotation suggestion working
- Base suggestion on most recent injection by date
- When editing, pre-select the current site

### Database Changes

#### WeighIn Model
- Add `updatedAt` field for tracking edits
- No other schema changes needed

#### Injection Model
- Add `updatedAt` field for tracking edits
- No other schema changes needed

### API Changes

#### Weigh-In Endpoints

**POST /api/weigh-ins** (Modified)
- Add optional `date` field to request body
- Remove same-week conflict check
- Validate date is not in future
- Validate date is within 90 days

**PATCH /api/weigh-ins/[id]** (New)
- Update weight and/or date
- Validate user owns the entry
- Return updated entry

**DELETE /api/weigh-ins/[id]** (New)
- Delete entry by ID
- Validate user owns the entry
- Return 204 No Content

**GET /api/weigh-ins/latest** (Modified)
- Keep `canWeighIn` for UI hint, but always true now
- Add `hasWeighedThisWeek` boolean for messaging

#### Injection Endpoints

**POST /api/injections** (Modified)
- Add optional `date` field to request body
- Remove same-week conflict check
- Validate date is not in future
- Validate date is within 90 days

**PATCH /api/injections/[id]** (New)
- Update date, site, and/or notes
- Validate user owns the entry
- Return updated entry

**DELETE /api/injections/[id]** (New)
- Delete entry by ID
- Validate user owns the entry
- Return 204 No Content

**GET /api/injections/status** (Modified)
- Keep status calculation for display
- Status still reflects current week state

## UI/UX Requirements

### Date Picker Component
- Use shadcn Calendar + Popover components
- Display format: "Jan 15, 2025"
- Disable future dates
- Disable dates > 90 days ago
- Mobile-friendly touch target

### Weigh-In Dialog
- Add date field above weight field
- Pre-populated with today's date
- Show week encouragement message when applicable

### Weigh-In History
- Add edit/delete icons to each row
- Edit opens dialog with pre-filled values
- Delete shows confirmation alert

### Injection Dialog
- Add date field above site selection
- Pre-populated with today's date
- Keep site rotation suggestion

### Injection History
- Add edit/delete icons to each row
- Edit opens dialog with pre-filled values
- Delete shows confirmation alert

## Testing Requirements

### Unit Tests
- Date validation (no future, within 90 days)
- API endpoints accept date parameter
- Edit endpoints validate ownership
- Delete endpoints validate ownership

### E2E Tests
- Log weigh-in with custom date
- Edit existing weigh-in
- Delete weigh-in with confirmation
- Log injection with custom date
- Edit existing injection
- Delete injection with confirmation
- Log multiple entries in same week (no error)
