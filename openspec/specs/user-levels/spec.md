# User Levels

## Purpose

User levels provide a visible representation of learning progress. Users earn XP through various activities, advance through levels, and unlock titles that reflect their proficiency.

## Requirements

### Requirement: XP Awarding
The system SHALL award XP to users for various learning activities.

#### Scenario: XP from check-in
- **WHEN** user checks in daily
- **THEN** system awards 10 XP

#### Scenario: XP from quest completion
- **WHEN** user completes a daily quest
- **THEN** system awards XP as defined by the quest

#### Scenario: XP from achievement
- **WHEN** user unlocks an achievement
- **THEN** system awards XP as defined by the achievement

### Requirement: User Level Calculation
The system SHALL calculate user level based on total accumulated XP.

#### Scenario: Level calculation formula
- **WHEN** user's XP changes
- **THEN** system recalculates level using formula: level = floor(sqrt(totalXp / 100))

#### Scenario: Level up notification
- **WHEN** user's level increases
- **THEN** system displays level up notification with new level number

### Requirement: Level Titles
The system SHALL assign titles based on user level.

#### Scenario: Title assignment
- **WHEN** user reaches certain levels
- **THEN** system assigns corresponding title:
  - Level 0-4: "初学者"
  - Level 5-9: "学习者"
  - Level 10-19: "进阶者"
  - Level 20-29: "熟练者"
  - Level 30+: "大师"

### Requirement: Level Progress Display
The system SHALL show progress toward the next level.

#### Scenario: Progress bar
- **WHEN** user views their profile or level page
- **THEN** system displays XP progress bar showing current XP, next level XP threshold, and percentage

### Requirement: Level Cap
The system SHALL have a maximum level of 100.

#### Scenario: Max level reached
- **WHEN** user reaches level 100
- **THEN** system displays "最高等级" and no further XP accumulation changes level
