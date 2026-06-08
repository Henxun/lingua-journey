---
archived-with: comet-archive
archived-at: 2026-06-07
status: archived
---

## Context

Current language learning platform has courses and conversation practice but no dedicated vocabulary memorization system. Spaced repetition systems (SRS) are proven effective for retaining vocabulary long-term.

## Goals / Non-Goals

**Goals:**
- Implement a modern flashcard system with front/back sides
- Build an SRS algorithm for optimal review scheduling
- Support vocabulary decks for organized learning
- Auto-extract vocabulary from lessons
- Track mastery levels per word
- Integrate with gamification system

**Non-Goals:**
- Advanced AI-powered vocabulary generation
- Offline flashcard syncing
- Multi-user deck sharing

## Decisions

### 1. SRS Algorithm
- **Choice**: Modified SM-2 algorithm (Simple Version)
- **Rationale**: Balanced between effectiveness and simplicity, easy to implement initially
- **Alternatives considered**: Full SM-2+, Leitner system (box-based)

### 2. Mastery Levels
- **Choice**: 5-level system (New → Learning → Familiar → Known → Mastered)
- **Rationale**: Clear progression, easy to visualize
- **Alternatives**: Continuous percentage-based mastery

### 3. Card Data Model
- **Choice**: Two-sided (front = word, back = translation + example)
- **Rationale**: Simple format works well for most use cases
- **Alternatives considered**: Multi-sided, cloze deletion cards

### 4. Deck Organization
- **Choice**: User-created decks + course auto-decks
- **Rationale**: Flexible for users, automatic integration with existing courses
- **Alternatives considered**: Tags only, hierarchical folders

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Review scheduling may feel off initially | Collect user feedback, allow custom review intervals |
| Too many reviews can overwhelm users | Implement daily review limits, optional streaks |
| Performance with large vocab libraries | Implement efficient querying and pagination |
| Data migration if SRS algorithm changes | Keep review history, allow re-scheduling |

## Open Questions

- Should we include pronunciation audio for flashcards?
- How aggressive should the initial review schedule be?
- Should decks be shareable between users?
