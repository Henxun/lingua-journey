## ADDED Requirements

### Requirement: Vocabulary Achievements
The system SHALL unlock achievements based on vocabulary learning.

#### Scenario: First flashcard created
- **WHEN** user creates first vocabulary card
- **THEN** system unlocks "Vocabulary Starter" achievement

#### Scenario: 100 words learned
- **WHEN** user reaches 100 Mastered words
- **THEN** system unlocks "Wordsmith" achievement

#### Scenario: 7-day review streak
- **WHEN** user reviews for 7 consecutive days
- **THEN** system unlocks "Review Champion" achievement

### Requirement: Vocabulary XP Rewards
The system SHALL award XP for vocabulary review activities.

#### Scenario: Review card reward
- **WHEN** user completes a vocabulary review
- **THEN** system awards XP based on mastery and accuracy

#### Scenario: Daily review complete
- **WHEN** user completes daily review queue
- **THEN** system awards bonus XP and updates daily quest progress
