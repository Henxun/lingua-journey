# Proximity Trigger Specification

## ADDED Requirements

### Requirement: Distance calculation to NPCs
The system SHALL calculate the 2D Euclidean distance between the player position and each NPC position in the scene.

#### Scenario: Distance calculated correctly
- **WHEN** player is at position (0, 0, 0) and NPC is at (3, 0, 4)
- **THEN** the calculated distance SHALL be 5 units (sqrt(9 + 16))

#### Scenario: Y-axis ignored in calculation
- **WHEN** player is at (0, 0, 0) and NPC is at (3, 0, 4)
- **AND** the NPC head is at y=1.6
- **THEN** the distance SHALL still be calculated using only X and Z coordinates

### Requirement: Proximity detection threshold
The system SHALL consider an NPC "in range" when the distance to the player is less than or equal to 1.5 units.

#### Scenario: NPC in range
- **WHEN** player is 1.4 units from an NPC
- **THEN** that NPC SHALL be marked as "in range"

#### Scenario: NPC out of range
- **WHEN** player is 1.6 units from an NPC
- **THEN** that NPC SHALL NOT be marked as "in range"

#### Scenario: Multiple NPCs in range
- **WHEN** player is within 1.5 units of multiple NPCs simultaneously
- **THEN** all in-range NPCs SHALL be identified

### Requirement: Nearest NPC identification
The system SHALL identify the nearest NPC when one or more NPCs are in range.

#### Scenario: Single nearest NPC
- **WHEN** player is 1.0 unit from NPC-A and 1.4 units from NPC-B
- **THEN** NPC-A SHALL be identified as the nearest NPC

#### Scenario: Equal distance selects first
- **WHEN** player is exactly 1.5 units from NPC-A and exactly 1.5 units from NPC-B
- **THEN** the NPC with the lower array index SHALL be selected as nearest

### Requirement: Proximity UI indicator
The system SHALL display an interaction prompt when the player is in range of at least one NPC.

#### Scenario: Prompt appears when in range
- **WHEN** player enters within 1.5 units of any NPC
- **THEN** a prompt SHALL appear on screen
- **AND** the prompt SHALL show the NPC's name: "Press [SPACE] to talk to {NPC_name}"

#### Scenario: Prompt updates to nearest NPC
- **WHEN** player is in range of multiple NPCs
- **AND** then moves closer to a different NPC
- **THEN** the prompt SHALL update to show the new nearest NPC's name

#### Scenario: Prompt disappears when leaving range
- **WHEN** player moves beyond 1.5 units of all NPCs
- **THEN** the interaction prompt SHALL disappear

### Requirement: Visual indicator on nearest NPC
The system SHALL highlight the nearest NPC when they are in range.

#### Scenario: Highlight appears
- **WHEN** player enters within 1.5 units of NPC
- **THEN** the NPC SHALL display a subtle glow effect

#### Scenario: Highlight changes with nearest
- **WHEN** player is in range of NPC-A and NPC-B
- **AND** NPC-A is nearest
- **THEN** only NPC-A SHALL have the highlight effect
- **AND** when player moves closer to NPC-B, NPC-B SHALL become highlighted

#### Scenario: No highlight when out of range
- **WHEN** player is more than 1.5 units from all NPCs
- **THEN** no NPC SHALL display a highlight effect
