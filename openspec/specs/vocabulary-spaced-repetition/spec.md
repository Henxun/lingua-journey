## ADDED Requirements

### Requirement: Flashcard System
The system SHALL provide flashcard functionality with front/back sides.

#### Scenario: View flashcard
- **WHEN** user opens a flashcard
- **THEN** system displays the front side (word/phrase)

#### Scenario: Flip flashcard
- **WHEN** user clicks/taps on the flashcard
- **THEN** system reveals the back side (translation + example)

### Requirement: Spaced Repetition Review
The system SHALL implement SM-2 algorithm for optimal review scheduling.

#### Scenario: Review due card
- **WHEN** user reviews a card
- **THEN** system calculates next review date based on SM-2 algorithm

#### Scenario: Rating card
- **WHEN** user rates a card (Again/Hard/Good/Easy)
- **THEN** system updates interval, ease factor, and next review date

#### Scenario: Get due cards
- **WHEN** user starts review session
- **THEN** system returns all cards where next_review <= current date

### Requirement: Mastery Tracking
The system SHALL track mastery level for each vocabulary word.

#### Scenario: Initial mastery
- **WHEN** new card is created
- **THEN** mastery level is set to "new"

#### Scenario: Update mastery
- **WHEN** card is reviewed correctly multiple times
- **THEN** mastery level progresses (new → learning → familiar → known → mastered)

#### Scenario: Reset mastery
- **WHEN** card is marked as "Again" (failed)
- **THEN** mastery level resets to "learning"

### Requirement: Review History
The system SHALL maintain complete review history for each card.

#### Scenario: Log review
- **WHEN** user reviews a card
- **THEN** system creates a review log with quality, interval, and ease factor changes

#### Scenario: View card history
- **WHEN** user views card details
- **THEN** system shows review history and statistics
