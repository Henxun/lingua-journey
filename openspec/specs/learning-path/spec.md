# Learning Path

## Purpose

Learning paths provide personalized, structured sequences of courses tailored to a user's goals and current level.

## Requirements

### Requirement: Learning Path Generation
The system SHALL generate personalized learning paths based on user goals and current progress.

#### Scenario: Generate path for new user
- **WHEN** user with no completed courses requests a learning path
- **THEN** system generates a path starting from beginner courses matching user goals

#### Scenario: Generate path for existing user
- **WHEN** user with completed courses requests a learning path
- **THEN** system generates a path continuing from user's current level

### Requirement: Learning Path Structure
The system SHALL organize learning paths as ordered sequences of courses.

#### Scenario: Path course order
- **WHEN** system generates a learning path
- **THEN** system orders courses by prerequisite and difficulty level

#### Scenario: Path includes course details
- **WHEN** system returns a learning path
- **THEN** system includes course name, description, and estimated duration for each step

### Requirement: Learning Path Progress
The system SHALL track and update user progress through their learning path.

#### Scenario: Track current position
- **WHEN** user completes a course in their path
- **THEN** system advances the current_position to the next course

#### Scenario: Path completion
- **WHEN** user completes all courses in their path
- **THEN** system marks the path status as "completed"

### Requirement: Learning Path Visualization
The system SHALL provide a visual representation of the learning path.

#### Scenario: View path progress
- **WHEN** user opens their learning path page
- **THEN** system displays a visual roadmap showing completed, current, and upcoming courses

#### Scenario: Path progress percentage
- **WHEN** user views their learning path
- **THEN** system shows overall completion percentage based on completed courses

### Requirement: Learning Path Adjustment
The system SHALL allow users to modify their learning path.

#### Scenario: Skip a course
- **WHEN** user skips a course in their path
- **THEN** system marks that course as skipped and advances to next

#### Scenario: Add course to path
- **WHEN** user adds a course to their path
- **THEN** system inserts the course at the appropriate difficulty level
