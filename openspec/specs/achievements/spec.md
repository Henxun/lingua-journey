# Achievements

## Purpose

Achievements system provides users with goals and recognition for completing learning milestones. Users can unlock various achievements by completing courses, maintaining streaks, and practicing regularly.

## Requirements

### Requirement: Achievement Unlocking
The system SHALL unlock achievements when users meet predefined conditions.

#### Scenario: Achievement unlocked
- **WHEN** user completes an action that satisfies an achievement condition
- **THEN** system creates UserAchievement record and awards XP

#### Scenario: Achievement already owned
- **WHEN** user has already unlocked an achievement
- **THEN** system does not re-award XP for that achievement

### Requirement: Achievement Categories
The system SHALL support multiple achievement categories.

#### Scenario: Course completion achievements
- **WHEN** user completes a course
- **THEN** system checks course-related achievements and unlocks any that qualify

#### Scenario: Practice milestone achievements
- **WHEN** user completes a number of practice sessions
- **THEN** system checks practice-related achievements

#### Scenario: Learning streak achievements
- **WHEN** user maintains a check-in streak
- **THEN** system checks streak-related achievements

### Requirement: Achievement Display
The system SHALL provide a list of all achievements showing locked/unlocked status.

#### Scenario: View all achievements
- **WHEN** user opens achievement page
- **THEN** system displays all achievements with locked status for unearned ones

### Requirement: Achievement Notification
The system SHALL notify users when an achievement is unlocked.

#### Scenario: Achievement notification
- **WHEN** achievement is unlocked
- **THEN** system displays achievement unlock notification to user
