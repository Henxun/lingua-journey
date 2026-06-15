'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { Navbar } from '../../components/Navbar';
import { CafeEnvironment } from '../../components/scenes/CafeEnvironment';
import { Character3D } from '../../components/scenes/Character3D';
import { PlayerCharacter } from '../../components/scenes/PlayerCharacter';
import { InteractionPrompt } from '../../components/scenes/InteractionPrompt';
import { useVoiceChat } from '../../hooks/useVoiceChat';
import { usePlayerControls } from '../../hooks/usePlayerControls';
import { useProximityDetection } from '../../hooks/useProximityDetection';

// ============== Cafe Characters ==============
const CHARACTERS = [
  {
    id: 'barista_1',
    name: 'Alex (Barista)',
    avatarColor: '#DEB887',
    clothingColor: '#8B0000',
    position: [6.5, 0, -1.5] as [number, number, number],
    role: 'barista' as const,
    status: 'Making your coffee',
  },
  {
    id: 'customer_1',
    name: 'Sophie (Customer)',
    avatarColor: '#FFDAB9',
    clothingColor: '#9370DB',
    position: [-3.2, 0, 0.5] as [number, number, number],
    role: 'customer_f' as const,
    status: 'Enjoying her latte',
  },
  {
    id: 'customer_2',
    name: 'Tom (Customer)',
    avatarColor: '#D2B48C',
    clothingColor: '#4682B4',
    position: [0.8, 0, 0.6] as [number, number, number],
    role: 'customer_m' as const,
    status: 'Reading a book',
  },
];

// ============== Player Controls Wrapper ==============
interface PlayerControlsWrapperProps {
  isChatting: boolean;
  onLockChange: (locked: boolean) => void;
  onProximityChange: (nearestNPC: { id: string; name: string } | null, isInRange: boolean) => void;
}

function PlayerControlsWrapper({ isChatting, onLockChange, onProximityChange }: PlayerControlsWrapperProps) {
  const { playerPosition, keys, isLocked, playerFacing } = usePlayerControls({
    enabled: !isChatting,
    firstPerson: isChatting,
  });

  const { nearestNPC, isInRange } = useProximityDetection(playerPosition, CHARACTERS);

  useEffect(() => {
    onLockChange(isLocked);
  }, [isLocked, onLockChange]);

  useEffect(() => {
    onProximityChange(nearestNPC, isInRange);
  }, [nearestNPC, isInRange, onProximityChange]);

  return (
    <>
      <PointerLockControls
        onLock={() => onLockChange(true)}
        onUnlock={() => onLockChange(false)}
      />
      <PlayerCharacter
        firstPerson={isChatting}
        playerPosition={playerPosition}
        keys={keys}
        playerFacing={playerFacing}
      />
    </>
  );
}

// ============== Interactive Object Component ==============
interface InteractiveItemProps {
  position: [number, number, number];
  onClick: () => void;
  isSelected: boolean;
  children: React.ReactNode;
  hoverScale?: number;
}

function InteractiveItem({ position, onClick, isSelected, children, hoverScale = 1.1 }: InteractiveItemProps) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const target = isSelected ? hoverScale + Math.sin(state.clock.elapsedTime * 3) * 0.05 : hovered ? hoverScale : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.2);
  });

  useEffect(() => {
    if (hovered || isSelected) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'auto';
    }
  }, [hovered, isSelected]);

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {children}
    </group>
  );
}

// ============== 3D Scene ==============
interface Scene3DProps {
  selectedCharacterId: string | null;
  selectedObject: string | null;
  onCharacterClick: (id: string) => void;
  onObjectClick: (id: string) => void;
  isConnected: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  isLocked: boolean;
}

function Scene3D({
  selectedCharacterId,
  selectedObject,
  onCharacterClick,
  onObjectClick,
  isConnected,
  isRecording,
  isPlaying,
  isLocked,
}: Scene3DProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.7, 5]} fov={50} />
      <OrbitControls
        enabled={!isLocked}
        enablePan={!isLocked}
        enableZoom={!isLocked}
        enableRotate={!isLocked}
        minDistance={3}
        maxDistance={20}
        target={[0, 0.8, 0]}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />

      {/* Lighting - warm cafe ambience */}
      <ambientLight intensity={0.4} color="#FFF8DC" />
      <directionalLight
        position={[8, 15, 8]}
        intensity={0.4}
        color="#FFFAF0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 5, 5]} intensity={0.5} color="#FFD700" distance={15} decay={1.5} />

      {/* Environment */}
      <CafeEnvironment />

      {/* Clickable menu board */}
      <InteractiveItem
        position={[0, 3.2, -5.7]}
        onClick={() => onObjectClick('menu_board')}
        isSelected={selectedObject === 'menu_board'}
      >
        <mesh>
          <boxGeometry args={[3.2, 2.2, 0.01]} />
          <meshStandardMaterial color="#2F1810" transparent opacity={0.01} />
        </mesh>
      </InteractiveItem>

      {/* Clickable counter/coffee machine */}
      <InteractiveItem
        position={[7, 1, -2]}
        onClick={() => onObjectClick('counter')}
        isSelected={selectedObject === 'counter'}
      >
        <mesh>
          <boxGeometry args={[2.7, 1.5, 1.2]} />
          <meshStandardMaterial color="#8B7355" transparent opacity={0.01} />
        </mesh>
      </InteractiveItem>

      {/* Clickable tables with coffee */}
      <InteractiveItem
        position={[-3, 0.8, 0]}
        onClick={() => onObjectClick('table1')}
        isSelected={selectedObject === 'table1'}
      >
        <mesh>
          <cylinderGeometry args={[0.7, 0.7, 0.1, 24]} />
          <meshStandardMaterial color="#DEB887" transparent opacity={0.01} />
        </mesh>
      </InteractiveItem>

      <InteractiveItem
        position={[1, 0.8, 0]}
        onClick={() => onObjectClick('table2')}
        isSelected={selectedObject === 'table2'}
      >
        <mesh>
          <cylinderGeometry args={[0.7, 0.7, 0.1, 24]} />
          <meshStandardMaterial color="#DEB887" transparent opacity={0.01} />
        </mesh>
      </InteractiveItem>

      <InteractiveItem
        position={[4, 0.8, 3]}
        onClick={() => onObjectClick('table3')}
        isSelected={selectedObject === 'table3'}
      >
        <mesh>
          <cylinderGeometry args={[0.7, 0.7, 0.1, 24]} />
          <meshStandardMaterial color="#DEB887" transparent opacity={0.01} />
        </mesh>
      </InteractiveItem>

      {/* Clickable window */}
      <InteractiveItem
        position={[-6, 3, -5.7]}
        onClick={() => onObjectClick('window')}
        isSelected={selectedObject === 'window'}
      >
        <mesh>
          <boxGeometry args={[3.7, 2.7, 0.01]} />
          <meshStandardMaterial color="#87CEEB" transparent opacity={0.01} />
        </mesh>
      </InteractiveItem>

      {/* Characters */}
      {CHARACTERS.map((char) => (
        <Character3D
          key={char.id}
          name={char.name}
          avatarColor={char.avatarColor}
          clothingColor={char.clothingColor}
          position={char.position}
          role={char.role}
          animationState={
            selectedCharacterId === char.id && isRecording
              ? 'listening'
              : selectedCharacterId === char.id && isPlaying
                ? 'talking'
                : selectedCharacterId === char.id
                  ? 'waving'
                  : 'idle'
          }
          isSelected={selectedCharacterId === char.id}
          onClick={() => onCharacterClick(char.id)}
          status={char.status}
        />
      ))}
    </>
  );
}

// ============== Learning Content ==============
const LEARNING_CONTENT: Record<string, {
  title: string;
  vocabulary: string[];
  grammar: string[];
  dialogue: string;
  culturalTip?: string;
}> = {
  menu_board: {
    title: '☕ Coffee Menu',
    vocabulary: ['Espresso', 'Americano', 'Latte', 'Cappuccino', 'Mocha', 'Macchiato', 'Flat white', 'Cold brew', 'To-go cup', 'Stay in'],
    grammar: ['I would like a coffee, please.', 'Could I have a latte?', 'What do you recommend?', "I'll have the...", 'Can I get that to go?'],
    dialogue: "Customer: Hi, what do you recommend?\nBarista: Our house latte is excellent! Or if you prefer something stronger, the flat white is popular.\nCustomer: I'll try a latte, please. To-go.\nBarista: Sure! What size - small, medium, or large?\nCustomer: Medium, please.",
    culturalTip: "In coffee shops worldwide, knowing your order is key. 'To-go' means you want it in a disposable cup. 'For here' means a ceramic cup. Many cafes offer 'happy hour' discounts in the afternoon!"
  },
  counter: {
    title: '🍵 At the Counter',
    vocabulary: ['Order', 'Receipt', 'Cash', 'Card', 'Tip', 'Change', 'Receipt', 'Order number', 'Hot', 'Iced'],
    grammar: ['Can I pay by card?', 'Do you accept cash?', 'Where do I pick up?', 'Is this inclusive?'],
    dialogue: "Customer: Excuse me, where do I pick up my order?\nBarista: Your number will be called when it's ready. Here's your receipt with the number.\nCustomer: Thank you! How much is a tip?\nBarista: Tips are optional but appreciated!",
    culturalTip: "Tipping customs vary: In the US, 15-20% is standard. In Japan, tipping is not expected and can even be considered rude. In Europe, rounding up or small change is common."
  },
  table1: {
    title: '🥐 Coffee Break',
    vocabulary: ['Sugar', 'Milk', 'Creamer', 'Stirrer', 'Napkin', 'Coaster', 'Croissant', 'Pastry', 'Cookie', 'Cake slice'],
    grammar: ['Could I have some sugar?', 'Do you have oat milk?', 'This is delicious!', 'Would you like to share?'],
    dialogue: "Sophie: This latte is perfect!\nTom: Right? The barista really knows how to make espresso.\nSophie: Would you like to try my pastry? It's a chocolate croissant.\nTom: Oh, that sounds great! Want to try my cookie?\nSophie: Sure! Let's交换 (exchange).",
    culturalTip: "Coffee culture varies widely: In Italy, espresso is drunk standing at the bar. In France, café au lait is popular with croissants. In Scandinavian countries, coffee is a big part of 'fika' - a social coffee break."
  },
  table2: {
    title: '☕ Specialty Drinks',
    vocabulary: ['Vanilla syrup', 'Caramel', 'Whipped cream', 'Foam', 'Shot', 'Double', 'Decaf', 'Skinny', 'Extra hot', 'Light ice'],
    grammar: ['Could I get that with...?', 'Can you make it iced?', 'I want it extra sweet.', 'No foam, please.'],
    dialogue: "Customer: Hi, can I get a vanilla latte?\nBarista: Of course! What size?\nCustomer: Large, please. And can I get it iced?\nBarista: Sure! Any other modifications?\nCustomer: Extra vanilla syrup, please.\nBarista: Got it! That'll be $5.50.",
    culturalTip: "Specialty coffee drinks can be customized in many ways. 'Skinny' means with skim milk and no whipped cream. 'Light ice' gives you more drink. Don't be afraid to ask for exactly what you want!"
  },
  table3: {
    title: '🍰 Afternoon Tea',
    vocabulary: ['Tea', 'Herbal tea', 'Chai', 'Earl Grey', 'Green tea', 'Matcha', 'Scone', 'Sandwich', 'Clotted cream', 'Jam'],
    grammar: ['I prefer tea over coffee.', 'This scone is wonderful!', 'Would you like some more?', 'Shall we get dessert?'],
    dialogue: "Emma: I'm so glad we came here for afternoon tea!\nJames: Yes, this matcha latte is surprisingly good.\nEmma: And look at these scones! They have clotted cream!\nJames: Traditional English style! Want to try some?\nEmma: Definitely! Let me spread some on this scone.",
    culturalTip: "Afternoon tea originated in England in the 1840s. It typically includes finger sandwiches, scones with cream and jam, and cakes. 'High tea' is a more substantial meal, while 'cream tea' is just scones and tea."
  },
  window: {
    title: '🪟 Making Small Talk',
    vocabulary: ['Weather', 'Rainy', 'Sunny', 'Cloudy', 'Cozy', 'Comfy', 'Relaxing', 'Peaceful', 'View', 'Beautiful'],
    grammar: ["Isn't this place cozy?", 'The weather is nice today.', 'I love rainy days.', "It's so relaxing here."],
    dialogue: "Sophia: Isn't this cafe lovely?\nDavid: Yes, it's so peaceful. I love the natural light from the window.\nSophia: Me too! And the coffee is excellent.\nDavid: The view outside is beautiful too.\nSophia: I could stay here all day!",
    culturalTip: "Making small talk about the weather, the cafe, or surroundings is common in many cultures. In English-speaking countries, comments like 'Nice weather today!' or 'What a cozy place!' are standard conversation starters."
  },
};

// ============== Learning Panel ==============
interface LearningPanelProps {
  content: typeof LEARNING_CONTENT[string] | null;
  onClose: () => void;
}

function LearningPanel({ content, onClose }: LearningPanelProps) {
  if (!content) return null;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      className="fixed right-0 top-0 h-full w-96 bg-gradient-to-b from-amber-50 to-yellow-50 shadow-2xl z-50 overflow-y-auto border-l-2 border-amber-300"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-amber-900">{content.title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors text-amber-800 font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-amber-100"
          >
            <h3 className="text-sm font-bold text-amber-800 mb-2">📚 Vocabulary</h3>
            <div className="flex flex-wrap gap-2">
              {content.vocabulary.map((word, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium"
                >
                  {word}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-amber-100"
          >
            <h3 className="text-sm font-bold text-amber-800 mb-2">📝 Useful Phrases</h3>
            <ul className="space-y-2">
              {content.grammar.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span className="italic">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 shadow-sm border border-green-100"
          >
            <h3 className="text-sm font-bold text-green-800 mb-2">💬 Example Dialogue</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{content.dialogue}</p>
          </motion.div>

          {content.culturalTip && (
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 shadow-sm border border-purple-100"
            >
              <h3 className="text-sm font-bold text-purple-800 mb-2">🌟 Cultural Tip</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{content.culturalTip}</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============== Main Page ==============
export default function CafeScenePage() {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [isLocked, setIsLocked] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [nearestNPC, setNearestNPC] = useState<{ id: string; name: string } | null>(null);
  const [isInRange, setIsInRange] = useState(false);

  const handleLockChange = useCallback((locked: boolean) => {
    setIsLocked(locked);
  }, []);

  const handleProximityChange = useCallback((npc: { id: string; name: string } | null, inRange: boolean) => {
    setNearestNPC(npc);
    setIsInRange(inRange);
  }, []);

  const {
    isConnected,
    isRecording,
    isPlaying,
    transcript,
    evaluation,
    currentCharacterId,
    connectToCharacter,
    disconnectFromCharacter,
    startRecording,
    stopRecording,
    endConversation,
    sendUserMessage,
  } = useVoiceChat();

  useEffect(() => {
    setIsChatting(isConnected);
  }, [isConnected]);

  const [textInput, setTextInput] = useState('');

  const handleCharacterClick = async (characterId: string) => {
    setSelectedObject(null);
    setSelectedCharacterId(characterId);
    if (currentCharacterId !== characterId || !isConnected) {
      if (isConnected) {
        disconnectFromCharacter();
      }
      await connectToCharacter(characterId);
    }
  };

  const handleObjectClick = (objectId: string) => {
    setSelectedObject(objectId === selectedObject ? null : objectId);
    if (isConnected) {
      disconnectFromCharacter();
    }
    setSelectedCharacterId(null);
  };

  const handleSendText = () => {
    if (textInput.trim() && isConnected) {
      sendUserMessage(textInput.trim());
      setTextInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  // SPACE key handler
  useEffect(() => {
    const handleSpaceKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isInRange && nearestNPC && !isChatting) {
        e.preventDefault();
        handleCharacterClick(nearestNPC.id);
      }
    };

    document.addEventListener('keydown', handleSpaceKey);
    return () => {
      document.removeEventListener('keydown', handleSpaceKey);
    };
  }, [isInRange, nearestNPC, isChatting]);

  const closeLearningPanel = () => {
    setSelectedObject(null);
  };

  const learningContent = selectedObject ? LEARNING_CONTENT[selectedObject] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <Head>
        <title>☕ Coffee Shop Scene - Lingua Journey</title>
      </Head>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <h1 className="text-3xl font-bold text-amber-900 mb-1">☕ Cozy Coffee Shop</h1>
          <p className="text-amber-700">
            Practice ordering coffee, making small talk, and casual conversations!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT PANEL */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-5"
          >
            {/* Characters */}
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-amber-100">
              <h2 className="text-base font-bold text-amber-900 mb-3 flex items-center gap-2">
                👥 Characters <span className="text-xs font-normal text-amber-500">(click to chat)</span>
              </h2>
              <div className="space-y-2">
                {CHARACTERS.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => handleCharacterClick(char.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all text-sm ${
                      currentCharacterId === char.id
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400'
                        : 'bg-amber-50 hover:bg-amber-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{char.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{char.status}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Panel */}
            {isConnected && (
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-green-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-green-800">💬 Conversation</h3>
                  <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                    ● Connected
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 h-40 overflow-y-auto mb-4 space-y-2 border border-gray-100">
                  {transcript.length === 0 && (
                    <div className="text-center text-gray-400 text-xs pt-8">
                      Tap "Start Speaking" to begin conversation
                    </div>
                  )}
                  {transcript.map((entry, i) => (
                    <div
                      key={i}
                      className={`text-sm ${entry.role === 'user' ? 'text-blue-700 text-right' : 'text-gray-700'}`}
                    >
                      <span className="font-bold text-xs">{entry.role === 'user' ? 'You: ' : 'AI: '}</span>
                      {entry.text}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {isRecording ? (
                    <button
                      onClick={stopRecording}
                      className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm shadow-md hover:bg-red-600 transition flex items-center justify-center gap-2"
                    >
                      <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                      Stop Listening
                    </button>
                  ) : (
                    <button
                      onClick={startRecording}
                      disabled={isPlaying}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 ${
                        isPlaying
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
                      }`}
                    >
                      🎤 {isPlaying ? 'AI speaking...' : 'Start Speaking'}
                    </button>
                  )}
                  <button
                    onClick={endConversation}
                    className="py-2.5 px-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-300 transition"
                  >
                    End
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Or type your message..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                  />
                  <button
                    onClick={handleSendText}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold text-sm shadow-md"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* Evaluation */}
            {evaluation && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-5 border border-amber-200"
              >
                <h3 className="text-base font-bold text-amber-900 mb-3">📊 Your Evaluation</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="text-center bg-green-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-green-600">{evaluation.pronunciation?.score ?? 85}</div>
                    <div className="text-xs text-gray-600">Pronunciation</div>
                  </div>
                  <div className="text-center bg-blue-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-blue-600">{evaluation.grammar?.score ?? 88}</div>
                    <div className="text-xs text-gray-600">Grammar</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 bg-amber-50 rounded-lg p-3">
                  {evaluation.overall?.feedback ?? 'Great job practicing! Keep speaking to improve more.'}
                </p>
              </motion.div>
            )}

            {/* Tip panel */}
            {!isConnected && !evaluation && (
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-amber-100">
                <h3 className="text-base font-bold text-amber-900 mb-2">🎯 How to use this scene</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">1.</span>
                    <span><strong>Click a character</strong> to start a voice conversation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">2.</span>
                    <span>Click on <strong>menu board, counter, or tables</strong> to learn vocabulary</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">3.</span>
                    <span>Use <strong>WASD</strong> to move around the cafe</span>
                  </li>
                </ul>
              </div>
            )}
          </motion.div>

          {/* RIGHT PANEL - 3D Canvas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-100">
              <div className="h-10 bg-gradient-to-r from-amber-600 to-yellow-600 px-6 flex items-center justify-between">
                <h2 className="text-base font-bold text-white">☕ The Coffee Corner</h2>
                <div className="text-white/80 text-xs">
                  {selectedObject ? `Learning: ${learningContent?.title || 'Item'}` : selectedCharacterId ? 'Voice Chat Active' : 'Explore & Learn'}
                </div>
              </div>

              <div className="relative h-[620px] bg-gradient-to-b from-amber-100 to-yellow-200">
                <Canvas shadows dpr={[1, 2]}>
                  <Scene3D
                    selectedCharacterId={selectedCharacterId}
                    selectedObject={selectedObject}
                    onCharacterClick={handleCharacterClick}
                    onObjectClick={handleObjectClick}
                    isConnected={isConnected}
                    isRecording={isRecording}
                    isPlaying={isPlaying}
                    isLocked={isLocked}
                  />
                  <PlayerControlsWrapper
                    isChatting={isChatting}
                    onLockChange={handleLockChange}
                    onProximityChange={handleProximityChange}
                  />
                </Canvas>

                {/* Click to start overlay */}
                {!isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-10">
                    <div className="bg-white/95 rounded-2xl px-8 py-6 shadow-xl text-center">
                      <div className="text-4xl mb-3">☕</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Click to Start</h3>
                      <p className="text-gray-600 text-sm">Click anywhere to enable first-person controls</p>
                      <p className="text-gray-500 text-xs mt-3">Press ESC to release mouse</p>
                    </div>
                  </div>
                )}

                {/* Interaction prompt */}
                <InteractionPrompt
                  isInRange={isInRange}
                  nearestNPCName={nearestNPC?.name || null}
                />

                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg px-4 py-2 shadow-md text-xs text-gray-700">
                  {isLocked ? 'WASD to move • Mouse to look • SPACE to interact • ESC to release' : 'Click to start exploring'}
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-t border-amber-100">
                <h3 className="text-sm font-bold text-amber-900 mb-2">About This Coffee Shop</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  A warm and inviting coffee shop with a cozy atmosphere. Practice ordering drinks,
                  making small talk, and casual conversations. Click on the menu board to learn coffee
                  vocabulary, or chat with the barista and other customers!
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {selectedObject && learningContent && (
            <LearningPanel content={learningContent} onClose={closeLearningPanel} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}