# Course Recommendation

## Purpose

Course recommendation suggests courses tailored to each user based on goals, current level, and learning history to provide personalized learning recommendations.

## Requirements

### Requirement: Course Recommendation
The system SHALL recommend courses based on user goals, current level, and learning history.

#### Scenario: Recommend next course in path
- **WHEN** user views their current learning path
- **THEN** system highlights the next recommended course

#### Scenario: Recommend courses by goal
- **WHEN** user has set a learning goal
- **THEN** system recommends courses matching that goal's target language and level

### Requirement: Recommendation Factors
The system SHALL consider multiple factors when generating recommendations.

#### Scenario: Language match
- **WHEN** generating recommendations
- **THEN** system prioritizes courses in user's target language (weight: 30%)

#### Scenario: Level match
- **WHEN** generating recommendations
- **THEN** system prioritizes courses matching user's current level (weight: 25%)

#### Scenario: Prerequisite completion
- **WHEN** generating recommendations
- **THEN** system only recommends courses with completed prerequisites (weight: 20%)

### Requirement: Recommendation Display
The system SHALL display recommendations with clear reasoning.

#### Scenario: Show recommendation reason
- **WHEN** system displays a recommended course
- **THEN** system shows why this course is recommended (e.g., "Matches your goal: Travel Japanese")

#### Scenario: Popular courses
- **WHEN** user requests recommendations
- **THEN** system includes popular courses in the recommendation list (weight: 15%)

### Requirement: Recommendation Feedback
The system SHALL learn from user feedback to improve recommendations.

#### Scenario: User skips recommendation
- **WHEN** user ignores a recommended course
- **THEN** system decreases that course's recommendation score for this user

#### Scenario: User completes recommendation
- **WHEN** user completes a recommended course
- **THEN** system increases similar courses' recommendation scores
