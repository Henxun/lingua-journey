## ADDED Requirements

### Requirement: Display Course List
The system SHALL display a list of available courses with filtering options.

#### Scenario: View all active courses
- **WHEN** a user visits the courses page
- **THEN** the system displays all active courses with name, language, difficulty, and thumbnail

#### Scenario: Filter courses by language
- **WHEN** a user selects a language filter
- **THEN** the course list updates to show only courses for the selected language

#### Scenario: Filter courses by difficulty
- **WHEN** a user selects a difficulty filter
- **THEN** the course list updates to show only courses at the selected difficulty level

### Requirement: Display Course Details
The system SHALL display detailed information about a specific course.

#### Scenario: View course details
- **WHEN** a user selects a specific course
- **THEN** the system displays course description, language, difficulty, and all lessons in order

#### Scenario: View lesson list in course
- **WHEN** a user views a course detail page
- **THEN** the system displays all lessons with their order, title, and completion status
