# Daily Quests

## Purpose

Daily quests provide users with regular goals to complete each day, encouraging consistent learning habits. Quests reset daily and offer XP rewards upon completion.

## Requirements

### Requirement: Daily Check-in
The system SHALL allow users to check in once per day and earn XP rewards.

#### Scenario: Successful check-in
- **WHEN** user clicks "Check In" button and has not checked in today
- **THEN** system records check-in time, awards XP, and increments streak counter

#### Scenario: Already checked in today
- **WHEN** user has already checked in today and clicks "Check In"
- **THEN** system displays message "Already checked in today"

### Requirement: Streak Reward
The system SHALL award bonus XP for consecutive daily check-ins.

#### Scenario: Streak milestone reached
- **WHEN** user maintains a 7-day streak
- **THEN** system awards 50 bonus XP in addition to regular check-in XP

#### Scenario: Streak broken
- **WHEN** user misses a day and checks in after missing
- **THEN** system resets streak counter to 1 and awards only base XP

### Requirement: Daily Quest Completion
The system SHALL track daily quest progress and award XP upon completion.

#### Scenario: Quest progress updated
- **WHEN** user completes a learning activity that matches a daily quest
- **THEN** system increments quest progress counter

#### Scenario: Quest completed
- **WHEN** user reaches the target value for a daily quest
- **THEN** system marks quest as completed and awards XP reward

### Requirement: Daily Quest Reset
The system SHALL reset daily quests at midnight UTC.

#### Scenario: New day reset
- **WHEN** a new day begins (00:00 UTC)
- **THEN** system resets all daily quest progress for all users
