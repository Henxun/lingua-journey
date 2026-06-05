# Password Recovery Specification

## ADDED Requirements

### Requirement: Request Password Reset
The system SHALL allow users to request a password reset by providing their email address.

#### Scenario: Successful password reset request
- **WHEN** user submits email address on `/forgot-password` page
- **THEN** system SHALL verify the email exists in the system
- **AND** if email exists, system SHALL generate a 6-digit verification code
- **AND** system SHALL send the code to user's email
- **AND** system SHALL display message "Verification code has been sent to your email"

#### Scenario: Email not found
- **WHEN** user submits email address that does not exist
- **THEN** system SHALL display message "If an account exists with this email, a verification code has been sent"
- **AND** system SHALL still send a generic email (for security reasons, to prevent email enumeration)

#### Scenario: Rate limiting on password reset requests
- **WHEN** user requests password reset
- **AND** a verification code was already sent to this email within the last 60 seconds
- **THEN** system SHALL display error "Please wait 60 seconds before requesting another code"
- **AND** system SHALL NOT send a new code

#### Scenario: Account without password
- **WHEN** user with OAuth-only account (no password set) requests password reset
- **THEN** system SHALL display message "This account uses OAuth login. Please use Google or GitHub to sign in."
- **AND** system SHALL NOT send a verification code

### Requirement: Verify Password Reset Code
The system SHALL verify the 6-digit code provided by the user.

#### Scenario: Valid verification code
- **WHEN** user submits valid 6-digit code
- **THEN** system SHALL verify the code is:
  - Associated with the correct email
  - Of type RESET_PASSWORD
  - Not marked as used
  - Not expired (within 15 minutes)
- **AND** if all checks pass, system SHALL mark the code as used
- **AND** system SHALL allow user to set a new password

#### Scenario: Invalid verification code
- **WHEN** user submits incorrect code
- **THEN** system SHALL display error "Invalid verification code"
- **AND** system SHALL NOT allow password change
- **AND** system SHALL NOT mark the code as used (allow retry)

#### Scenario: Expired verification code
- **WHEN** user submits a code that has expired (older than 15 minutes)
- **THEN** system SHALL display error "Verification code has expired. Please request a new one."
- **AND** system SHALL NOT allow password change

#### Scenario: Code already used
- **WHEN** user submits a code that has already been used
- **THEN** system SHALL display error "Verification code has already been used. Please request a new one."
- **AND** system SHALL NOT allow password change

### Requirement: Set New Password
The system SHALL allow users to set a new password after successful code verification.

#### Scenario: Successful password reset
- **WHEN** user submits new password and confirmation password
- **THEN** system SHALL verify the verification code is valid and unused
- **AND** system SHALL validate password strength:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- **AND** if password and confirmation match
- **AND** if all validations pass
- **THEN** system SHALL update the user's password
- **AND** system SHALL invalidate all existing verification codes for this email
- **AND** system SHALL display success message "Password has been reset successfully"
- **AND** system SHALL redirect user to login page

#### Scenario: Password too weak
- **WHEN** user submits password that does not meet strength requirements
- **THEN** system SHALL display specific error about missing requirements
- **AND** system SHALL NOT update the password

#### Scenario: Password mismatch
- **WHEN** user submits password and confirmation that do not match
- **THEN** system SHALL display error "Passwords do not match"
- **AND** system SHALL NOT update the password

#### Scenario: Expired verification code during password set
- **WHEN** user takes longer than 15 minutes to set password
- **THEN** system SHALL detect that the verification code has expired
- **AND** system SHALL display error "Verification code has expired. Please request a new one."
- **AND** system SHALL NOT update the password

### Requirement: Password Reset Email Template
The system SHALL send a styled HTML email for password reset requests.

#### Scenario: Password reset email content
- **WHEN** user requests password reset
- **THEN** system SHALL send an email with:
  - Subject: "Reset Your Lingua Journey Password"
  - HTML template matching the app's design
  - The 6-digit verification code displayed prominently
  - Clear instructions on how to use the code
  - Warning about the 15-minute expiration
  - Note about not sharing the code with anyone

#### Scenario: Email delivery failure
- **WHEN** email delivery fails
- **THEN** system SHALL log the error
- **AND** if in development mode, system SHALL display the verification code in server console
- **AND** system SHALL return success to user (to prevent email enumeration attacks)

### Requirement: Security Against Attacks
The system SHALL implement security measures to prevent abuse.

#### Scenario: Prevent brute force attacks
- **WHEN** user enters 5 incorrect verification codes
- **THEN** system SHALL mark all codes for this email as used
- **AND** system SHALL display error "Too many attempts. Please request a new code after 15 minutes."

#### Scenario: Prevent email enumeration
- **WHEN** user submits email that does not exist
- **THEN** system SHALL display the same message as if the email existed
- **AND** system SHALL NOT reveal whether the email is registered

#### Scenario: Log security events
- **WHEN** any password reset event occurs
- **THEN** system SHALL log:
  - Email address (masked, e.g., u***@example.com)
  - IP address
  - User agent
  - Timestamp
  - Success/failure status
