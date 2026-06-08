## ADDED Requirements

### Requirement: SRS Algorithm
The system SHALL schedule reviews based on spaced repetition algorithm.

#### Scenario: First review
- **WHEN** card is reviewed for first time and marked remembered
- **THEN** system schedules next review in 1 day

#### Scenario: Remembered well
- **WHEN** card is marked "Easy" on review
- **THEN** system significantly increases next review interval

#### Scenario: Hard to remember
- **WHEN** card is marked "Hard" on review
- **THEN** system decreases next review interval

### Requirement: Review Queue
The system SHALL build daily review queues based on SRS schedule.

#### Scenario: Show due cards
- **WHEN** user opens review page
- **THEN** system shows all cards due for review today

#### Scenario: Daily limit
- **WHEN** there are more due cards than daily limit
- **THEN** system prioritizes cards and shows up to daily limit

### Requirement: Mastery Levels
The system SHALL track mastery levels for each vocabulary card.

#### Scenario: Level progression
- **WHEN** card is reviewed successfully multiple times
- **THEN** card advances through mastery levels (New → Learning → Familiar → Known → Mastered)

#### Scenario: Mastered level
- **WHEN** card reaches Mastered level
- **THEN** review interval becomes very long (e.g., 6 months)

#### Scenario: Forgotten card
- **WHEN** user marks card as forgotten
- **THEN** system resets mastery level and shortens intervals

### Requirement: Review History
The system SHALL record and track review history for analytics.

#### Scenario: Record review
- **WHEN** user reviews a card
- **THEN** system records review result and timestamp

#### Scenario: View history
- **WHEN** user looks at card details
- **THEN** system shows past review history and timings
