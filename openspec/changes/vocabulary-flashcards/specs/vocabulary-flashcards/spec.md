## ADDED Requirements

### Requirement: Flashcard Creation
The system SHALL allow users to create flashcards with front (word) and back (translation/example) sides.

#### Scenario: Create basic flashcard
- **WHEN** user creates a flashcard with word and translation
- **THEN** system saves the card to the user's vocabulary library

#### Scenario: Add example sentence
- **WHEN** user creates a flashcard with an example sentence
- **THEN** system saves the example sentence with the card

### Requirement: Flashcard Review
The system SHALL support interactive flashcard review with card flipping.

#### Scenario: Show front of card first
- **WHEN** user starts a review session
- **THEN** system shows the front (word) side of the card first

#### Scenario: Flip card to back
- **WHEN** user clicks flip or taps the card
- **THEN** system reveals the back (translation) side

#### Scenario: Mark card remembered
- **WHEN** user marks a card as remembered during review
- **THEN** system advances the card to next review interval

### Requirement: Flashcard Deck
The system SHALL organize flashcards into decks for focused study.

#### Scenario: Select deck to review
- **WHEN** user selects a deck from their library
- **THEN** system shows only cards from that deck for review

#### Scenario: Review multiple decks
- **WHEN** user selects multiple decks
- **THEN** system combines cards from selected decks for review

### Requirement: Review Progress
The system SHALL track review progress and show completion.

#### Scenario: Show review count
- **WHEN** user starts a review session
- **THEN** system displays total cards to review in the session

#### Scenario: Show remaining cards
- **WHEN** user reviews cards during session
- **THEN** system updates display showing remaining cards
