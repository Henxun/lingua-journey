---
archived-with: comet-archive
archived-at: 2026-06-07
---

## Why

Vocabulary is a core part of language learning, but current platform lacks a dedicated system for vocabulary review and memorization. Flashcards provide an effective spaced repetition learning mechanism for retaining new words.

## What Changes

- New vocabulary card system with front/back sides for words and translations
- Spaced repetition algorithm (SRS) for optimal review timing
- Vocabulary decks/categories for organized learning
- Progress tracking for each word (mastery level)
- Integration with courses to auto-add vocabulary from lessons
- Review statistics and mastery dashboard

## Capabilities

### New Capabilities
- `vocabulary-flashcards`: Core flashcard system with SRS algorithm and review scheduling
- `vocabulary-management`: Vocabulary creation, deck organization, and management
- `spaced-repetition`: SRS algorithm implementation and review scheduling

### Modified Capabilities
- `gamification-system`: Add vocabulary practice achievements and XP rewards

## Impact

- Backend: New entities for vocabulary cards, decks, and review logs; new services for SRS
- Frontend: New vocabulary pages, flashcard interaction UI, and review screens
- Database: New tables for vocabulary, decks, and review history
- Integration: Connect with existing courses and gamification systems
