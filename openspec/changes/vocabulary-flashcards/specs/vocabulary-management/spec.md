## ADDED Requirements

### Requirement: Vocabulary Library
The system SHALL provide a library view of all user vocabulary cards.

#### Scenario: View all cards
- **WHEN** user opens vocabulary library
- **THEN** system shows all vocabulary cards sorted by date added

#### Scenario: Search vocabulary
- **WHEN** user searches for a word
- **THEN** system filters and shows matching cards

### Requirement: Deck Management
The system SHALL allow users to create and manage vocabulary decks.

#### Scenario: Create new deck
- **WHEN** user creates a new deck
- **THEN** system creates the deck with user-given name

#### Scenario: Add card to deck
- **WHEN** user adds a card to a deck
- **THEN** system associates the card with the selected deck

#### Scenario: Remove card from deck
- **WHEN** user removes a card from a deck
- **THEN** system removes association but keeps the card

### Requirement: Course Integration
The system SHALL automatically add vocabulary from completed lessons.

#### Scenario: Auto-add vocabulary from lesson
- **WHEN** user completes a lesson
- **THEN** system extracts and adds vocabulary from that lesson

#### Scenario: Auto-create course deck
- **WHEN** vocabulary is added from a course
- **THEN** system creates/uses an auto-deck for that course

### Requirement: Vocabulary Stats
The system SHALL show vocabulary learning statistics.

#### Scenario: View mastery summary
- **WHEN** user views vocabulary stats
- **THEN** system shows count of words at each mastery level

#### Scenario: View learning streak
- **WHEN** user views vocabulary stats
- **THEN** system shows daily review streak and history
