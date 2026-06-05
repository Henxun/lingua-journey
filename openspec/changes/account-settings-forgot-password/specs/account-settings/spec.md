# Account Settings Specification

## ADDED Requirements

### Requirement: View Linked OAuth Accounts
The system SHALL display all OAuth providers linked to the user's account on the account settings page.

#### Scenario: User views linked accounts
- **WHEN** user navigates to `/profile/settings`
- **THEN** system SHALL display a list of linked OAuth providers with their email addresses and status (active/inactive)

#### Scenario: No linked accounts
- **WHEN** user has no linked OAuth accounts
- **THEN** system SHALL display "No linked accounts" message with option to link a new account

### Requirement: Link New OAuth Account
The system SHALL allow users to link a new OAuth provider to their existing email account.

#### Scenario: Successful OAuth account linking
- **WHEN** user clicks "Link" button for an OAuth provider (Google or GitHub)
- **THEN** system SHALL redirect user to OAuth authorization page
- **AND** after successful authorization, system SHALL link the OAuth account to user's email account
- **AND** system SHALL display success message

#### Scenario: OAuth account linking with email verification
- **WHEN** user completes OAuth authorization
- **THEN** system SHALL verify the OAuth email matches the logged-in user's email
- **AND** if email matches, system SHALL link the account
- **AND** if email does not match, system SHALL display error and abort linking

#### Scenario: Email already linked by another account
- **WHEN** user attempts to link OAuth account with email already in use
- **THEN** system SHALL display error message "This email is already associated with another account"
- **AND** system SHALL NOT link the account

### Requirement: Unlink OAuth Account
The system SHALL allow users to unlink an OAuth provider from their account.

#### Scenario: Successful OAuth account unlinking
- **WHEN** user clicks "Unlink" button for a linked OAuth provider
- **THEN** system SHALL verify user has at least one other login method (email password or another OAuth)
- **AND** if other login method exists, system SHALL unlink the OAuth account
- **AND** system SHALL display success message

#### Scenario: Prevent unlinking last login method
- **WHEN** user attempts to unlink their only OAuth account
- **AND** user does not have a password set
- **THEN** system SHALL display error "Cannot unlink your only login method. Please set a password first or link another account."
- **AND** system SHALL NOT unlink the account

#### Scenario: Prevent unlinking last remaining login method
- **WHEN** user attempts to unlink their last OAuth account
- **AND** they only have this one login method
- **THEN** system SHALL display error "Cannot unlink your only login method. Please add another login method first."
- **AND** system SHALL NOT unlink the account

### Requirement: Update User Profile
The system SHALL allow users to update their username and language preferences.

#### Scenario: Successful profile update
- **WHEN** user updates username or language preferences
- **THEN** system SHALL validate the input data
- **AND** if valid, system SHALL update the user profile
- **AND** system SHALL display success message

#### Scenario: Username already taken
- **WHEN** user attempts to change username to one already in use
- **THEN** system SHALL display error "Username is already taken"
- **AND** system SHALL NOT update the username

#### Scenario: Invalid username format
- **WHEN** user enters username with invalid characters or length
- **THEN** system SHALL display validation error with requirements
- **AND** system SHALL NOT update the username

### Requirement: View Login Methods
The system SHALL display all available login methods for the user's account.

#### Scenario: Display all login methods
- **WHEN** user views account settings
- **THEN** system SHALL display all login methods:
  - Email/password (if set)
  - Google OAuth (if linked)
  - GitHub OAuth (if linked)
- **AND** for each method, system SHALL show its status and last used date

#### Scenario: Show primary login method
- **WHEN** user has multiple login methods
- **THEN** system SHALL designate one as "Primary" login method
- **AND** the primary method SHALL be shown at the top of the list
