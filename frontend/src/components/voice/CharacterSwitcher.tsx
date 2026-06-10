import { motion } from 'framer-motion';
import { useVoiceChatStore } from '../../stores/voiceChatStore';

interface Character {
  id: string;
  name: string;
  role: string;
  personality: string;
  speechStyle: string;
}

interface CharacterSwitcherProps {
  characters: Character[];
  currentCharacterId: string;
  onSwitch: (characterId: string) => void;
  disabled?: boolean;
}

export function CharacterSwitcher({
  characters,
  currentCharacterId,
  onSwitch,
  disabled = false
}: CharacterSwitcherProps) {
  const { isConnected } = useVoiceChatStore();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'waiter': return '服务员';
      case 'customer': return '顾客';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'waiter': return '👨‍🍳';
      case 'customer': return '👤';
      default: return '💬';
    }
  };

  if (!isConnected) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4"
    >
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        切换角色
      </h4>
      
      <div className="flex flex-wrap gap-2">
        {characters.map((char) => (
          <motion.button
            key={char.id}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            onClick={() => !disabled && onSwitch(char.id)}
            disabled={disabled || char.id === currentCharacterId}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              char.id === currentCharacterId
                ? 'bg-green-500 text-white shadow-md'
                : disabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <span className="mr-1">{getRoleIcon(char.role)}</span>
            {char.name}
          </motion.button>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-2">
        当前对话结束后可以切换到其他角色
      </p>
    </motion.div>
  );
}

export const DEFAULT_CHARACTERS: Character[] = [
  {
    id: 'waiter_1',
    name: 'Mike',
    role: 'waiter',
    personality: 'friendly, professional, patient',
    speechStyle: 'friendly'
  },
  {
    id: 'customer_1',
    name: 'Emma',
    role: 'customer',
    personality: 'polite, curious, eager to learn',
    speechStyle: 'polite'
  },
  {
    id: 'customer_2',
    name: 'Marcus',
    role: 'customer',
    personality: 'direct, casual, hungry',
    speechStyle: 'casual'
  },
  {
    id: 'customer_3',
    name: 'Lisa',
    role: 'customer',
    personality: 'friendly, talkative, adventurous',
    speechStyle: 'friendly'
  }
];
