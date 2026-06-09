import { Character3D } from './Character3D';
import { usePlayerControls } from '../../hooks/usePlayerControls';

export interface PlayerCharacterProps {
  firstPerson?: boolean;
  name?: string;
  enabled?: boolean;
}

export function PlayerCharacter({
  firstPerson = true,
  name = 'Player',
  enabled = true,
}: PlayerCharacterProps) {
  // usePlayerControls now gets camera internally via useThree()
  const { playerPosition } = usePlayerControls({ enabled });

  // In first-person mode, don't render the player character
  // (the camera IS the player, so we just see through their eyes)
  if (firstPerson) {
    return null;
  }

  // Default position if playerPosition.current is somehow null
  const pos = playerPosition.current ?? { x: 0, y: 0, z: 0 };

  // Third-person mode: render the character at player position
  return (
    <Character3D
      name={name}
      avatarColor="#FFE4C4"
      clothingColor="#607D8B"
      position={[pos.x, 0, pos.z]}
      animationState="idle"
      isSelected={false}
      onClick={() => {}}
      role="customer_m"
    />
  );
}
