# Scene Voice Integration Specification

## ADDED Requirements

### Requirement: Space key triggers voice chat
The system SHALL initiate voice chat with the nearest NPC when the player is in range and presses the SPACE key.

#### Scenario: Space key initiates chat
- **WHEN** player is within 1.5 units of an NPC
- **AND** player presses SPACE
- **THEN** voice chat SHALL begin with that NPC
- **AND** the existing voice chat UI SHALL appear

#### Scenario: Space key ignored when out of range
- **WHEN** player is more than 1.5 units from all NPCs
- **AND** player presses SPACE
- **THEN** nothing SHALL happen
- **AND** no error SHALL be shown

#### Scenario: Space key triggers nearest NPC
- **WHEN** player is within 1.5 units of multiple NPCs
- **AND** player presses SPACE
- **THEN** voice chat SHALL begin with the nearest NPC

### Requirement: Voice chat pauses player controls
The system SHALL disable player movement controls while voice chat is active.

#### Scenario: Movement disabled during chat
- **WHEN** voice chat is active
- **THEN** WASD keys SHALL NOT move the player character
- **AND** mouse movement SHALL NOT rotate the camera

#### Scenario: Controls restored after chat ends
- **WHEN** voice chat ends (user clicks "End Chat" or conversation completes)
- **THEN** WASD controls SHALL be re-enabled
- **AND** PointerLockControls SHALL be re-enabled

### Requirement: Seamless transition to voice chat
The system SHALL use the existing voice chat infrastructure without modification.

#### Scenario: Voice chat uses existing hooks
- **WHEN** player presses SPACE near NPC
- **THEN** the system SHALL call the existing `useVoiceChat.startConversation(npcId)` function
- **AND** the existing voice chat store state SHALL be updated

#### Scenario: Existing UI displayed
- **WHEN** voice chat is active
- **THEN** the existing conversation panel SHALL be displayed
- **AND** TTS and STT SHALL function as before

#### Scenario: Evaluation triggered on chat end
- **WHEN** voice chat conversation ends
- **THEN** the existing pronunciation/grammar evaluation SHALL be triggered
- **AND** results SHALL be displayed as before

### Requirement: Player position not tracked during chat
The system SHALL maintain the player's last position during voice chat without updating it.

#### Scenario: Player stays in place
- **WHEN** voice chat is active
- **THEN** the player character SHALL remain at its last position
- **AND** no movement SHALL occur even if keys are pressed

#### Scenario: Player position restored
- **WHEN** voice chat ends
- **THEN** the player character SHALL still be at the same position
- **AND** player can continue exploring from that position

### Requirement: Camera state preserved
The system SHALL preserve the camera direction when entering and exiting voice chat.

#### Scenario: Camera direction preserved on entry
- **WHEN** player presses SPACE to start voice chat
- **THEN** the camera direction SHALL remain facing the NPC
- **AND** PointerLockControls SHALL be temporarily disabled

#### Scenario: Camera direction preserved on exit
- **WHEN** voice chat ends
- **AND** PointerLockControls is re-enabled
- **THEN** the camera SHALL still be facing the same direction as before the chat

#### Scenario: Re-lock after exit
- **WHEN** voice chat ends
- **AND** PointerLockControls was previously locked
- **THEN** PointerLockControls SHALL remain unlocked (user must click to re-lock)
