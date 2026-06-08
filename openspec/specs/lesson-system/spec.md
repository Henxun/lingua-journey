## ADDED Requirements

### Requirement: Lesson Structure
The system SHALL organize course content into ordered lessons.

#### Scenario: Lesson has type and content
- **WHEN** a lesson is created
- **THEN** it has a type (either "conversation" or "scene") and associated content

#### Scenario: Lessons ordered by sequence
- **WHEN** lessons are displayed in a course
- **THEN** they are ordered by their sequence number

### Requirement: Start Lesson
The system SHALL allow users to start a lesson.

#### Scenario: Start first lesson
- **WHEN** a user starts the first lesson of an enrolled course
- **THEN** the lesson content is displayed and the user can begin

#### Scenario: Start unlocked lesson
- **WHEN** a user starts a lesson that is unlocked (previous lessons completed)
- **THEN** the lesson content is displayed and the user can begin

#### Scenario: Cannot start locked lesson
- **WHEN** a user tries to start a lesson that is locked (previous lessons not completed)
- **THEN** the system prevents access and shows a message about completion requirements

### Requirement: Complete Lesson
The system SHALL allow users to mark a lesson as completed.

#### Scenario: Complete conversation lesson
- **WHEN** a user completes a conversation lesson with passing score
- **THEN** the lesson is marked as completed and next lesson is unlocked

#### Scenario: Complete scene lesson
- **WHEN** a user completes a scene lesson
- **THEN** the lesson is marked as completed and next lesson is unlocked
