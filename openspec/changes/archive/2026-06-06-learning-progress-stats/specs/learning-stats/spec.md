## ADDED Requirements

### Requirement: Learning statistics display
The system SHALL display user learning statistics including total learning time, practice count, accuracy rate, and consecutive study days.

#### Scenario: View learning statistics page
- **WHEN** user navigates to `/profile/stats`
- **THEN** system displays four stat cards: total time, practice count, accuracy rate, and streak days

#### Scenario: Total learning time card
- **WHEN** user views the learning statistics page
- **THEN** the total time card shows total minutes spent learning
- **AND** displays "minutes" as the unit

#### Scenario: Practice count card
- **WHEN** user views the learning statistics page
- **THEN** the practice count card shows number of completed conversations

#### Scenario: Accuracy rate card
- **WHEN** user views the learning statistics page
- **THEN** the accuracy rate card shows percentage based on (total_score / practice_count / 10) * 100

#### Scenario: Streak days card
- **WHEN** user views the learning statistics page
- **THEN** the streak days card shows consecutive days of practice
- **AND** resets to 1 if more than one day passes between practices

### Requirement: Statistics entry from profile
The system SHALL provide a link to learning statistics from the user profile page.

#### Scenario: Profile page shows stats link
- **WHEN** user is logged in and views `/profile`
- **THEN** system displays a "View Learning Stats" button or link
- **AND** clicking it navigates to `/profile/stats`

### Requirement: Statistics update on conversation complete
The system SHALL update learning statistics when user completes a conversation with a score.

#### Scenario: Stats update after scored conversation
- **WHEN** user completes a conversation and receives a score
- **THEN** system increments practice count by 1
- **AND** adds the score to total_score
- **AND** updates last_practice_date to today
- **AND** recalculates streak days

### Requirement: Streak calculation
The system SHALL correctly calculate consecutive study days.

#### Scenario: Same day practice
- **WHEN** user practices on the same day as previous practice
- **THEN** streak days remains unchanged

#### Scenario: Consecutive day practice
- **WHEN** user practices on the day immediately after previous practice
- **THEN** streak days increments by 1

#### Scenario: Gap day practice
- **WHEN** user practices after missing one or more days
- **THEN** streak days resets to 1
