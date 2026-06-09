# Player Character Specification

## ADDED Requirements

### Requirement: Player character exists in scene
The system SHALL render a player-controlled humanoid character in the 3D restaurant scene that visually resembles the existing NPC characters.

#### Scenario: Player character renders
- **WHEN** user navigates to the /scenes page
- **THEN** a player character shall appear at the starting position (0, 0, 4)

#### Scenario: Player character visually distinct
- **WHEN** user observes the player character
- **THEN** the player character SHALL have a different clothing color (#607D8B - blue casual shirt) than the NPCs to distinguish it

### Requirement: WASD keyboard movement
The system SHALL allow the player to move using WASD keys when PointerLockControls is active.

#### Scenario: W key moves forward
- **WHEN** PointerLockControls is active and user presses W
- **THEN** the player character SHALL move in the direction the camera is facing
- **AND** the movement speed SHALL be 5 units per second

#### Scenario: S key moves backward
- **WHEN** PointerLockControls is active and user presses S
- **THEN** the player character SHALL move opposite to the camera direction

#### Scenario: A key moves left
- **WHEN** PointerLockControls is active and user presses A
- **THEN** the player character SHALL move to the left relative to camera direction

#### Scenario: D key moves right
- **WHEN** PointerLockControls is active and user presses D
- **THEN** the player character SHALL move to the right relative to camera direction

#### Scenario: Diagonal movement
- **WHEN** user presses two movement keys simultaneously (e.g., W + A)
- **THEN** the player character SHALL move diagonally
- **AND** the diagonal speed SHALL be normalized to prevent faster diagonal movement

### Requirement: Mouse look controls view direction
The system SHALL use PointerLockControls to allow mouse movement to control the camera/view direction.

#### Scenario: Mouse horizontal movement rotates view
- **WHEN** PointerLockControls is active and user moves mouse horizontally
- **THEN** the camera SHALL rotate horizontally following mouse movement

#### Scenario: Mouse vertical movement rotates view
- **WHEN** PointerLockControls is active and user moves mouse vertically
- **THEN** the camera SHALL rotate vertically following mouse movement
- **AND** vertical rotation SHALL be clamped to prevent camera flipping

#### Scenario: ESC exits pointer lock
- **WHEN** user presses ESC key
- **THEN** PointerLockControls SHALL release mouse lock
- **AND** the control hint SHALL change to "Click to resume"

### Requirement: Player character stays within scene bounds
The system SHALL prevent the player character from leaving the restaurant boundaries.

#### Scenario: Player blocked at north wall
- **WHEN** player position would exceed Z > 5
- **THEN** player position SHALL be clamped to Z = 5

#### Scenario: Player blocked at south wall
- **WHEN** player position would exceed Z < -6
- **THEN** player position SHALL be clamped to Z = -6

#### Scenario: Player blocked at east wall
- **WHEN** player position would exceed X > 9
- **THEN** player position SHALL be clamped to X = 9

#### Scenario: Player blocked at west wall
- **WHEN** player position would exceed X < -6
- **THEN** player position SHALL be clamped to X = -6

### Requirement: Control instructions displayed
The system SHALL display control instructions when PointerLockControls is not active.

#### Scenario: Initial state shows enter instructions
- **WHEN** user first arrives at /scenes page
- **THEN** a prompt SHALL display: "Click anywhere to start exploring"
- **AND** WASD and mouse icons SHALL be shown

#### Scenario: Controls reminder shown after ESC
- **WHEN** user presses ESC to exit PointerLockControls
- **THEN** the prompt SHALL change to: "Click to resume"
- **AND** movement controls SHALL remain displayed
