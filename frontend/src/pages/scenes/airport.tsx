'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { Navbar } from '../../components/Navbar';
import { AirportEnvironment } from '../../components/scenes/AirportEnvironment';
import { Character3D } from '../../components/scenes/Character3D';
import { PlayerCharacter } from '../../components/scenes/PlayerCharacter';
import { InteractionPrompt } from '../../components/scenes/InteractionPrompt';
import { useVoiceChat } from '../../hooks/useVoiceChat';
import { usePlayerControls } from '../../hooks/usePlayerControls';
import { useProximityDetection } from '../../hooks/useProximityDetection';

const CHARACTERS = [
  {
    id: 'staff_1',
    name: 'Sarah (Check-in Staff)',
    avatarColor: '#DEB887',
    clothingColor: '#1E3A5F',
    position: [-10, 0, -5] as [number, number, number],
    role: 'staff' as const,
    status: 'Ready to help',
  },
  {
    id: 'officer_1',
    name: 'Officer Chen (Security)',
    avatarColor: '#F5DEB3',
    clothingColor: '#2F4F4F',
    position: [4, 0, -5] as [number, number, number],
    role: 'security' as const,
    status: 'Security checkpoint',
  },
  {
    id: 'passenger_1',
    name: 'Mike (Passenger)',
    avatarColor: '#D2B48C',
    clothingColor: '#4682B4',
    position: [7.5, 0, 1] as [number, number, number],
    role: 'passenger' as const,
    status: 'Waiting for boarding',
  },
  {
    id: 'passenger_2',
    name: 'Lisa (Passenger)',
    avatarColor: '#FFDAB9',
    clothingColor: '#9370DB',
    position: [8, 0, 2.5] as [number, number, number],
    role: 'passenger' as const,
    status: 'Looking at departure board',
  },
];

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

interface InteractiveItemProps {
  position: [number, number, number];
  onClick: () => void;
  isSelected: boolean;
  children: React.ReactNode;
  size?: [number, number, number];
}

function InteractiveItem({ position, onClick, isSelected, children, size = [1, 1, 1] }: InteractiveItemProps) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const target = isSelected ? 1.1 + Math.sin(state.clock.elapsedTime * 3) * 0.03 : hovered ? 1.05 : 1;
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
      <PerspectiveCamera makeDefault position={[0, 1.7, 8]} fov={50} />
      <OrbitControls
        enabled={!isLocked}
        enablePan={!isLocked}
        enableZoom={!isLocked}
        enableRotate={!isLocked}
        minDistance={3}
        maxDistance={25}
        target={[0, 0.8, 0]}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />

      <ambientLight intensity={0.5} color="#E6F3FF" />
      <directionalLight
        position={[10, 20, 10]}
        intensity={0.6}
        color="#FFFFFF"
        castShadow
      />

      <AirportEnvironment />

      {/* Clickable check-in counter */}
      <InteractiveItem
        position={[-8, 1, -5]}
        onClick={() => onObjectClick('checkin')}
        isSelected={selectedObject === 'checkin'}
        size={[8.5, 1.5, 2]}
      >
        <mesh>
          <boxGeometry args={[8.5, 1.5, 2]} />
          <meshStandardMaterial color="#2F4F4F" transparent opacity={0.01} />
        </mesh>
      </InteractiveItem>

      {/* Clickable security area */}
      <InteractiveItem
        position={[4, 0.8, -5]}
        onClick={() => onObjectClick('security')}
        isSelected={selectedObject === 'security'}
        size={[4, 1.5, 3]}
      >
        <mesh>
          <boxGeometry args={[4, 1.5, 3]} />
          <meshStandardMaterial color="#808080" transparent opacity={0.01} />
        </mesh>
      </InteractiveItem>

      {/* Clickable departure board */}
      <InteractiveItem
        position={[0, 4.5, -9.9]}
        onClick={() => onObjectClick('departure_board')}
        isSelected={selectedObject === 'departure_board'}
        size={[6, 1.5, 0.2]}
      >
        <mesh>
          <boxGeometry args={[6, 1.5, 0.2]} />
          <meshStandardMaterial color="#1a1a2e" transparent opacity={0.01} />
        </mesh>
      </InteractiveItem>

      {/* Clickable information desk */}
      <InteractiveItem
        position={[-12, 0.8, 0]}
        onClick={() => onObjectClick('info_desk')}
        isSelected={selectedObject === 'info_desk'}
        size={[2.5, 1.5, 2.5]}
      >
        <mesh>
          <cylinderGeometry args={[1.5, 1.5, 1.5, 24]} />
          <meshStandardMaterial color="#4682B4" transparent opacity={0.01} />
        </mesh>
      </InteractiveItem>

      {/* Clickable gate area */}
      <InteractiveItem
        position={[8, 0.5, 0]}
        onClick={() => onObjectClick('gate')}
        isSelected={selectedObject === 'gate'}
        size={[5, 1, 5]}
      >
        <mesh>
          <boxGeometry args={[5, 1, 5]} />
          <meshStandardMaterial color="#DC143C" transparent opacity={0.01} />
        </mesh>
      </InteractiveItem>

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

const LEARNING_CONTENT: Record<string, {
  title: string;
  vocabulary: string[];
  grammar: string[];
  dialogue: string;
  culturalTip?: string;
}> = {
  checkin: {
    title: '✈️ Check-in Counter',
    vocabulary: ['Boarding pass', 'Passport', 'Destination', 'Baggage', 'Tag', 'Seat assignment', 'Boarding time', 'Gate number', 'Luggage allowance', 'Overweight bag'],
    grammar: ['I would like to check in, please.', 'Here is my passport and booking confirmation.', 'Which seat would you prefer?', 'Where is the gate?', 'How many bags can I check?'],
    dialogue: "Agent: Good morning! May I see your passport and booking confirmation?\nPassenger: Yes, here you go. I'm going to Tokyo.\nAgent: Perfect. Window seat or aisle?\nPassenger: Aisle, please.\nAgent: You're all set! Boarding starts at Gate 15 in 2 hours.",
    culturalTip: "Online check-in is common worldwide, but airport counters are still needed for baggage check. Arrive 2-3 hours early for international flights. Have your documents ready and boarding pass on your phone or printed."
  },
  security: {
    title: '🔒 Security Checkpoint',
    vocabulary: ['Security', 'Scanner', 'X-ray', 'Tray', 'Liquids', 'Electronics', 'ID check', 'Boarding pass', 'Pat down', 'Clear'],
    grammar: ['Please put your belongings in the tray.', 'Do I need to remove my laptop?', 'Is this allowed?', 'Step through, please.', 'Do you have anything metal on you?'],
    dialogue: "Officer: Please place your laptop and liquids in a separate tray.\nPassenger: Sure, here they are. Do I need to take off my shoes?\nOfficer: Yes, please. Standard procedure.\nPassenger: Okay, done.\nOfficer: Please walk through the scanner. Arms up, please.\nPassenger: *walks through*\nOfficer: You're clear. Have a nice flight!",
    culturalTip: "Security procedures vary: Some countries require removing shoes, others don't. The 100ml liquid rule (3-1-1) is standard in most countries. TSA PreCheck and Global Entry help expedite the process in the US."
  },
  departure_board: {
    title: '📋 Departure Board',
    vocabulary: ['Flight number', 'Destination', 'Departure', 'Arrival', 'Gate', 'Status', 'On time', 'Delayed', 'Cancelled', 'Boarding', 'Final call'],
    grammar: ['Which gate is my flight?', 'Is my flight on time?', 'When does boarding start?', 'The flight has been delayed.', 'Where can I find gate information?'],
    dialogue: "Passenger: Excuse me, could you help me find my flight?\nStaff: Of course. What's your flight number?\nPassenger: It's UA 892 to San Francisco.\nStaff: Let me check... That's Gate 23. Boarding in 45 minutes.\nPassenger: Thank you! Is it on time?\nStaff: Yes, showing on time so far.",
    culturalTip: "Flight information displays show: flight number, destination city, scheduled departure time, current status, and gate. 'On Time' is good, but check periodically as delays happen. 'Final Call' means you need to hurry!"
  },
  info_desk: {
    title: '💼 Information Desk',
    vocabulary: ['Information', 'Help', 'Direction', 'Map', 'Facilities', 'Restroom', 'Duty free', 'Restaurant', 'Lounge', 'WiFi'],
    grammar: ['Where can I find...?', 'Could you help me with...?', 'Is there a...?', 'How do I get to...?', 'Can you recommend a place to eat?'],
    dialogue: "Passenger: Hi, could you tell me where the currency exchange is?\nStaff: Yes, it's in the main hall near Gate 5.\nPassenger: And is there a place to eat after security?\nStaff: Absolutely! There's a food court near Gate 12 with many options.\nPassenger: Great, thank you!\nStaff: You're welcome! Is there anything else?",
    culturalTip: "Airport information desks are staffed with helpful people who know the airport layout. Don't be shy to ask - they've heard every question! Most airports have free WiFi, sometimes requiring registration."
  },
  gate: {
    title: '🚪 Boarding Gate',
    vocabulary: ['Boarding', 'Gate', 'Zone', 'Priority', 'Group', 'Seat', 'Overhead bin', 'Carry-on', 'Seatbelt', 'Take off'],
    grammar: ['When does boarding start?', 'Is this the right gate?', 'Am I in the right zone?', 'May I board now?', 'Where is my seat?'],
    dialogue: "Agent: Now boarding Zone 2 for Flight UA 892.\nPassenger: Excuse me, am I in Zone 2?\nAgent: Let me see your boarding pass... Yes, you are! Please have your boarding pass ready.\nPassenger: Here it is. Is there overhead bin space?\nAgent: Yes, bins are available. Have a pleasant flight!\nPassenger: Thank you!",
    culturalTip: "Boarding is often done in zones (1, 2, 3) or groups (A, B, C). Priority boarding is for first class, business class, and frequent flyers. Board early to ensure overhead bin space for carry-on bags."
  },
};

function LearningPanel({ content, onClose }: { content: typeof LEARNING_CONTENT[string] | null }) {
  if (!content) return null;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      className="fixed right-0 top-0 h-full w-96 bg-gradient-to-b from-blue-50 to-indigo-50 shadow-2xl z-50 overflow-y-auto border-l-2 border-blue-300"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-blue-900">{content.title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors text-blue-800 font-bold"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-blue-100"
          >
            <h3 className="text-sm font-bold text-blue-800 mb-2">📚 Vocabulary</h3>
            <div className="flex flex-wrap gap-2">
              {content.vocabulary.map((word, index) => (
                <span key={index} className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {word}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-blue-100"
          >
            <h3 className="text-sm font-bold text-blue-800 mb-2">📝 Useful Phrases</h3>
            <ul className="space-y-2">
              {content.grammar.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-500 mt-0.5">•</span>
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

export default function AirportScenePage() {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50">
      <Head>
        <title>✈️ Airport Scene - Lingua Journey</title>
      </Head>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <h1 className="text-3xl font-bold text-blue-900 mb-1">✈️ International Airport</h1>
          <p className="text-blue-700">
            Practice navigating the airport - from check-in to boarding!
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
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-blue-100">
              <h2 className="text-base font-bold text-blue-900 mb-3 flex items-center gap-2">
                👥 Characters <span className="text-xs font-normal text-blue-500">(click to chat)</span>
              </h2>
              <div className="space-y-2">
                {CHARACTERS.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => handleCharacterClick(char.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all text-sm ${
                      currentCharacterId === char.id
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400'
                        : 'bg-blue-50 hover:bg-blue-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{char.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{char.status}</div>
                  </button>
                ))}
              </div>
            </div>

            {isConnected && (
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-green-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-green-800">💬 Conversation</h3>
                  <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">● Connected</div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 h-40 overflow-y-auto mb-4 space-y-2 border border-gray-100">
                  {transcript.length === 0 && (
                    <div className="text-center text-gray-400 text-xs pt-8">Tap "Start Speaking" to begin</div>
                  )}
                  {transcript.map((entry, i) => (
                    <div key={i} className={`text-sm ${entry.role === 'user' ? 'text-blue-700 text-right' : 'text-gray-700'}`}>
                      <span className="font-bold text-xs">{entry.role === 'user' ? 'You: ' : 'AI: '}</span>
                      {entry.text}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {isRecording ? (
                    <button onClick={stopRecording} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                      <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" /> Stop Listening
                    </button>
                  ) : (
                    <button onClick={startRecording} disabled={isPlaying} className={`flex-1 py-2.5 rounded-xl font-bold text-sm ${isPlaying ? 'bg-gray-300 text-gray-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'}`}>
                      🎤 {isPlaying ? 'AI speaking...' : 'Start Speaking'}
                    </button>
                  )}
                  <button onClick={endConversation} className="py-2.5 px-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm">End</button>
                </div>

                <div className="flex gap-2">
                  <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type message..." className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm" />
                  <button onClick={handleSendText} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold text-sm">Send</button>
                </div>
              </div>
            )}

            {evaluation && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-5 border border-blue-200">
                <h3 className="text-base font-bold text-blue-900 mb-3">📊 Your Evaluation</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="text-center bg-green-50 rounded-xl p-3"><div className="text-2xl font-bold text-green-600">{evaluation.pronunciation?.score ?? 85}</div><div className="text-xs text-gray-600">Pronunciation</div></div>
                  <div className="text-center bg-blue-50 rounded-xl p-3"><div className="text-2xl font-bold text-blue-600">{evaluation.grammar?.score ?? 88}</div><div className="text-xs text-gray-600">Grammar</div></div>
                </div>
                <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3">{evaluation.overall?.feedback ?? 'Great job!'}</p>
              </motion.div>
            )}

            {!isConnected && !evaluation && (
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-blue-100">
                <h3 className="text-base font-bold text-blue-900 mb-2">🎯 How to use this scene</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2"><span className="text-blue-500">1.</span><span><strong>Click a character</strong> to start a voice conversation</span></li>
                  <li className="flex items-start gap-2"><span className="text-blue-500">2.</span><span>Click on <strong>counters, signs, or areas</strong> to learn vocabulary</span></li>
                  <li className="flex items-start gap-2"><span className="text-blue-500">3.</span><span>Use <strong>WASD</strong> to move around the airport</span></li>
                </ul>
              </div>
            )}
          </motion.div>

          {/* RIGHT PANEL */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
              <div className="h-10 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 flex items-center justify-between">
                <h2 className="text-base font-bold text-white">✈️ International Terminal</h2>
                <div className="text-white/80 text-xs">{selectedObject ? `Learning: ${learningContent?.title || 'Item'}` : selectedCharacterId ? 'Voice Chat Active' : 'Explore & Learn'}</div>
              </div>

              <div className="relative h-[620px] bg-gradient-to-b from-blue-100 to-sky-200">
                <Canvas shadows dpr={[1, 2]}>
                  <Scene3D selectedCharacterId={selectedCharacterId} selectedObject={selectedObject} onCharacterClick={handleCharacterClick} onObjectClick={handleObjectClick} isConnected={isConnected} isRecording={isRecording} isPlaying={isPlaying} isLocked={isLocked} />
                  <PlayerControlsWrapper isChatting={isChatting} onLockChange={handleLockChange} onProximityChange={handleProximityChange} />
                </Canvas>

                {!isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-10">
                    <div className="bg-white/95 rounded-2xl px-8 py-6 shadow-xl text-center">
                      <div className="text-4xl mb-3">✈️</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Click to Start</h3>
                      <p className="text-gray-600 text-sm">Click anywhere to enable first-person controls</p>
                      <p className="text-gray-500 text-xs mt-3">Press ESC to release mouse</p>
                    </div>
                  </div>
                )}

                <InteractionPrompt isInRange={isInRange} nearestNPCName={nearestNPC?.name || null} />

                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg px-4 py-2 shadow-md text-xs text-gray-700">
                  {isLocked ? 'WASD to move • Mouse to look • SPACE to interact • ESC to release' : 'Click to start exploring'}
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-t border-blue-100">
                <h3 className="text-sm font-bold text-blue-900 mb-2">About This Airport</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  A modern international airport terminal. Practice checking in, going through security, finding your gate, and asking for directions. Click on the departure board to learn flight-related vocabulary!
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {selectedObject && learningContent && <LearningPanel content={learningContent} onClose={closeLearningPanel} />}
        </AnimatePresence>
      </div>
    </div>
  );
}