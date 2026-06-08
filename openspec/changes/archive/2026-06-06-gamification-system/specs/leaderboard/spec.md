## ADDED Requirements

### Requirement: Weekly Leaderboard
The system SHALL display a weekly ranking of users based on XP earned in the current week.

#### Scenario: Weekly ranking display
- **WHEN** user opens the weekly leaderboard
- **THEN** system displays top 100 users ranked by weekly XP in descending order

#### Scenario: User's own rank
- **WHEN** user views weekly leaderboard
- **THEN** system displays user's current rank within the weekly list

### Requirement: Monthly Leaderboard
The system SHALL display a monthly ranking of users based on XP earned in the current month.

#### Scenario: Monthly ranking display
- **WHEN** user opens the monthly leaderboard
- **THEN** system displays top 100 users ranked by monthly XP in descending order

### Requirement: Leaderboard Refresh
The system SHALL refresh leaderboard data periodically.

#### Scenario: Leaderboard data cache
- **WHEN** leaderboard is requested
- **THEN** system returns cached data if available, otherwise queries database

### Requirement: Leaderboard Reset
The system SHALL reset weekly and monthly leaderboards at appropriate intervals.

#### Scenario: Weekly reset
- **WHEN** a new week begins (Monday 00:00 UTC)
- **THEN** system resets all weekly XP counters to zero

#### Scenario: Monthly reset
- **WHEN** a new month begins (1st day 00:00 UTC)
- **THEN** system resets all monthly XP counters to zero
