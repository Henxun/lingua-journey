## ADDED Requirements

### Requirement: Enroll in Course
The system SHALL allow users to enroll in courses.

#### Scenario: Enroll in new course
- **WHEN** a user enrolls in a course for the first time
- **THEN** a CourseProgress record is created with the first lesson as current

#### Scenario: Already enrolled
- **WHEN** a user tries to enroll in a course they are already enrolled in
- **THEN** the system shows the existing course progress

### Requirement: Track Course Progress
The system SHALL track a user's progress through a course.

#### Scenario: Display current progress
- **WHEN** a user views an enrolled course
- **THEN** the system shows which lessons are completed, in progress, or locked

#### Scenario: Calculate completion percentage
- **WHEN** a user's progress is displayed
- **THEN** the system calculates and shows a completion percentage based on completed lessons

### Requirement: Continue Learning
The system SHALL allow users to resume from where they left off.

#### Scenario: Resume current lesson
- **WHEN** a user returns to a course
- **THEN** the system highlights the current lesson to continue

#### Scenario: View enrolled courses on profile
- **WHEN** a user views their profile
- **THEN** the system displays a list of courses they are enrolled in
