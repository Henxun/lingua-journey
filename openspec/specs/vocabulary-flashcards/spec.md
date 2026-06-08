## ADDED Requirements

### Requirement: Vocabulary Cards CRUD
The system SHALL provide CRUD operations for vocabulary cards.

#### Scenario: Create card
- **WHEN** user creates a new vocabulary card
- **THEN** system stores the card with front, back, and optional example

#### Scenario: Update card
- **WHEN** user updates a card
- **THEN** system updates the card fields

#### Scenario: Delete card
- **WHEN** user deletes a card
- **THEN** system removes the card and all its review history

#### Scenario: View card
- **WHEN** user views a card
- **THEN** system returns card details including mastery level and review statistics

### Requirement: Vocabulary Flashcard Page
The system SHALL provide a dedicated vocabulary flashcards page.

#### Scenario: Access vocabulary page
- **WHEN** user navigates to /vocabulary
- **THEN** system shows vocabulary management interface with cards and decks

#### Scenario: Access review page
- **WHEN** user starts review session
- **THEN** system shows /vocabulary/review with due cards

### Requirement: Card UI/UX
The system SHALL provide beautiful and intuitive flashcard UI.

#### Scenario: Display mastery colors
- **WHEN** cards are displayed
- **THEN** each mastery level has distinct color coding

#### Scenario: 3D flip animation
- **WHEN** user clicks on a card
- **THEN** card flips with 3D animation revealing back side

#### Scenario: Progress tracking
- **WHEN** user is reviewing
- **THEN** system shows progress bar and statistics
