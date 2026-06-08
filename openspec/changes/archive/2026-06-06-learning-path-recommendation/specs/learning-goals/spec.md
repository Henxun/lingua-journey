## ADDED Requirements

### Requirement: Goal Creation
The system SHALL allow users to create learning goals with title, description, type, and target date.

#### Scenario: Create short-term goal
- **WHEN** user creates a goal with type "short-term" and target date within 30 days
- **THEN** system creates the goal and sets status to "active"

#### Scenario: Create goal without target date
- **WHEN** user creates a goal without specifying a target date
- **THEN** system creates the goal with null target_date

### Requirement: Goal Types
The system SHALL support three goal types: short-term, medium-term, and long-term.

#### Scenario: Short-term goal
- **WHEN** user sets goal type to short-term
- **THEN** system expects target completion within 30 days

#### Scenario: Medium-term goal
- **WHEN** user sets goal type to medium-term
- **THEN** system expects target completion within 90 days

#### Scenario: Long-term goal
- **WHEN** user sets goal type to long-term
- **THEN** system expects target completion within 365 days

### Requirement: Goal Progress Tracking
The system SHALL track and display progress toward goal completion.

#### Scenario: Update goal progress
- **WHEN** user completes courses related to a goal
- **THEN** system updates the goal progress percentage

#### Scenario: Goal completion
- **WHEN** goal progress reaches 100%
- **THEN** system marks the goal status as "completed"

### Requirement: Goal Management
The system SHALL allow users to view, edit, and delete their learning goals.

#### Scenario: View all goals
- **WHEN** user opens goal management page
- **THEN** system displays all user goals grouped by status

#### Scenario: Edit goal
- **WHEN** user modifies an existing goal
- **THEN** system updates the goal and preserves the original created_at date

#### Scenario: Delete goal
- **WHEN** user deletes a goal
- **THEN** system removes the goal but preserves related learning path
