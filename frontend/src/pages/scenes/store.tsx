'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { Navbar } from '../../components/Navbar';
import { StoreEnvironment } from '../../components/scenes/StoreEnvironment';
import { Character3D } from '../../components/scenes/Character3D';
import { PlayerCharacter } from '../../components/scenes/PlayerCharacter';
import { InteractionPrompt } from '../../components/scenes/InteractionPrompt';
import { useVoiceChat } from '../../hooks/useVoiceChat';
import { usePlayerControls } from '../../hooks/usePlayerControls';
import { useProximityDetection } from '../../hooks/useProximityDetection';

const CHARACTERS = [
  {
    id: 'sales_1',
    name: 'Emma (Sales Associate)',
    avatarColor: '#FFDAB9',
    clothingColor: '#DC143C',
    position: [-1.5, 0, -6.5] as [number, number, number],
    role: 'staff' as const,
    status: 'Ready to help',
  },
  {
    id: 'sales_2',
    name: 'James (Checkout)',
    avatarColor: '#D2B48C',
    clothingColor: '#2F2F2F',
    position: [0, 0, -6.5] as [number, number, number],
    role: 'staff' as const,
    status: 'At the register',
  },
  {
    id: 'customer_1',
    name: 'Sophie (Customer)',
    avatarColor: '#FFDAB9',
    clothingColor: '#9370DB',
    position: [-4, 0, 0] as [number, number, number],
    role: 'customer_f' as const,
    status: 'Browsing clothes',
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
      <PointerLockControls onLock={() => onLockChange(true)} onUnlock={() => onLockChange(false)} />
      <PlayerCharacter firstPerson={isChatting} playerPosition={playerPosition} keys={keys} playerFacing={playerFacing} />
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
    if (hovered || isSelected) document.body.style.cursor = 'pointer';
    else document.body.style.cursor = 'auto';
  }, [hovered, isSelected]);

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
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

function Scene3D({ selectedCharacterId, selectedObject, onCharacterClick, onObjectClick, isConnected, isRecording, isPlaying, isLocked }: Scene3DProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.7, 8]} fov={50} />
      <OrbitControls enabled={!isLocked} enablePan={!isLocked} enableZoom={!isLocked} enableRotate={!isLocked} minDistance={3} maxDistance={25} target={[0, 0.8, 0]} maxPolarAngle={Math.PI / 2 - 0.1} />

      <ambientLight intensity={0.6} color="#FFF5EE" />
      <directionalLight position={[10, 20, 10]} intensity={0.5} color="#FFFFFF" castShadow />
      <pointLight position={[0, 4.5, 0]} intensity={0.6} color="#FFF" distance={10} decay={2} />

      <StoreEnvironment />

      {/* Clickable clothing racks */}
      <InteractiveItem position={[-5, 1, -5]} onClick={() => onObjectClick('clothing')} isSelected={selectedObject === 'clothing'} size={[2, 2, 1]}>
        <mesh><boxGeometry args={[2, 2, 1]} /><meshStandardMaterial color="#FF69B4" transparent opacity={0.01} /></mesh>
      </InteractiveItem>

      <InteractiveItem position={[0, 1, -5]} onClick={() => onObjectClick('clothing2')} isSelected={selectedObject === 'clothing2'} size={[2, 2, 1]}>
        <mesh><boxGeometry args={[2, 2, 1]} /><meshStandardMaterial color="#4169E1" transparent opacity={0.01} /></mesh>
      </InteractiveItem>

      <InteractiveItem position={[5, 1, -5]} onClick={() => onObjectClick('clothing3')} isSelected={selectedObject === 'clothing3'} size={[2, 2, 1]}>
        <mesh><boxGeometry args={[2, 2, 1]} /><meshStandardMaterial color="#32CD32" transparent opacity={0.01} /></mesh>
      </InteractiveItem>

      {/* Clickable checkout counter */}
      <InteractiveItem position={[0, 0.8, -7]} onClick={() => onObjectClick('checkout')} isSelected={selectedObject === 'checkout'} size={[3.5, 1.5, 1.5]}>
        <mesh><boxGeometry args={[3.5, 1.5, 1.5]} /><meshStandardMaterial color="#696969" transparent opacity={0.01} /></mesh>
      </InteractiveItem>

      {/* Clickable fitting room */}
      <InteractiveItem position={[7, 1.2, -4]} onClick={() => onObjectClick('fitting_room')} isSelected={selectedObject === 'fitting_room'} size={[1.8, 3, 1]}>
        <mesh><boxGeometry args={[1.8, 3, 1]} /><meshStandardMaterial color="#FF69B4" transparent opacity={0.01} /></mesh>
      </InteractiveItem>

      {/* Clickable display table */}
      <InteractiveItem position={[3, 0.6, 0]} onClick={() => onObjectClick('shoes')} isSelected={selectedObject === 'shoes'} size={[2.5, 0.8, 2]}>
        <mesh><boxGeometry args={[2.5, 0.8, 2]} /><meshStandardMaterial color="#8B4513" transparent opacity={0.01} /></mesh>
      </InteractiveItem>

      {/* Clickable accessories shelf */}
      <InteractiveItem position={[-7, 0.8, 2]} onClick={() => onObjectClick('accessories')} isSelected={selectedObject === 'accessories'} size={[2, 2, 0.6]}>
        <mesh><boxGeometry args={[2, 2, 0.6]} /><meshStandardMaterial color="#FFD700" transparent opacity={0.01} /></mesh>
      </InteractiveItem>

      {CHARACTERS.map((char) => (
        <Character3D
          key={char.id}
          name={char.name}
          avatarColor={char.avatarColor}
          clothingColor={char.clothingColor}
          position={char.position}
          role={char.role}
          animationState={selectedCharacterId === char.id && isRecording ? 'listening' : selectedCharacterId === char.id && isPlaying ? 'talking' : selectedCharacterId === char.id ? 'waving' : 'idle'}
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
  clothing: {
    title: '👗 Clothing & Apparel',
    vocabulary: ['T-shirt', 'Jeans', 'Dress', 'Skirt', 'Jacket', 'Sweater', 'Pants', 'Shorts', 'Blouse', 'Coat'],
    grammar: ['Do you have this in a different size?', 'What material is this?', 'Where can I find...?', 'Can I try this on?'],
    dialogue: "Customer: Excuse me, do you have this shirt in a medium?\nStaff: Let me check... Yes, we have it in the back. What color would you like?\nCustomer: Do you have it in blue?\nStaff: Yes! Here you go. The fitting room is over there.\nCustomer: Thank you!",
    culturalTip: "Clothing sizes vary by country! US sizes differ from European and Asian sizes. It's always good to check the size chart. Many stores offer free returns within 30 days."
  },
  clothing2: {
    title: '👔 Formal Wear',
    vocabulary: ['Suit', 'Tie', 'Blazer', 'Suit jacket', 'Dress shirt', 'Formal dress', 'Evening gown', 'Tuxedo', 'Cufflinks', 'Bow tie'],
    grammar: ['I need something formal for...', 'Do you have matching accessories?', 'Which tie would go with this?', 'Can you help me with measurements?'],
    dialogue: "Customer: I have a job interview next week. Do you have suggestions for a suit?\nStaff: Of course! What colors do you prefer? We have classic black, navy, and grey.\nCustomer: Navy would be great. I'm not sure about the size.\nStaff: Let me take your measurements. We also have matching ties and dress shirts.",
    culturalTip: "In Western business culture, navy blue and charcoal grey suits are most popular for interviews. The tie should be darker than the shirt. Always check the dress code - business casual is different from formal."
  },
  clothing3: {
    title: '👕 Casual Wear',
    vocabulary: ['T-shirt', 'Jeans', 'Hoodie', 'Sneakers', 'Casual dress', 'Leggings', 'Polo shirt', 'Jacket', 'Boots', 'Sandals'],
    grammar: ['What\'s on sale?', 'Do you have a smaller/larger size?', 'Where are the fitting rooms?', 'Can I pay with card?'],
    dialogue: "Customer: Hi! I love these sneakers. Do you have them in a size 8?\nStaff: Let me check our inventory. We have them in stock!\nCustomer: Great! And are they running shoes or more for casual wear?\nStaff: They're actually both - great for running but stylish enough for everyday.",
    culturalTip: "Casual wear norms vary: In Silicon Valley tech companies, hoodies and sneakers are common. In European cities, people often dress more formally even casually. Japan has unique casual fashion trends like Harajuku style."
  },
  shoes: {
    title: '👠 Footwear',
    vocabulary: ['Sneakers', 'Heels', 'Boots', 'Sandals', 'Loafers', 'Flats', 'Running shoes', 'Dress shoes', 'Size', 'Width'],
    grammar: ['What size do you wear?', 'Do these come in wide width?', 'Are these comfortable for walking?', 'Do you have a matching bag?'],
    dialogue: "Customer: These heels are beautiful! Do you have them in a size 7?\nStaff: Yes, we have them! Would you like to try them on?\nCustomer: Yes, please. Are they comfortable for all-day wear?\nStaff: They have a cushioned insole. They should be fine for several hours.\nCustomer: Perfect! I'll take them.",
    culturalTip: "Shoe sizing differs between countries: US, UK, and EU sizes are all different. Women's sizes are generally 1.5-2 sizes smaller than men's. Always try shoes on in the afternoon when feet are slightly swollen."
  },
  accessories: {
    title: '💍 Accessories',
    vocabulary: ['Necklace', 'Bracelet', 'Earrings', 'Ring', 'Watch', 'Belt', 'Scarf', 'Handbag', 'Sunglasses', 'Hat'],
    grammar: ['Do these match together?', 'Is this real gold/silver?', 'Can I see the matching set?', 'Do you have a warranty?'],
    dialogue: "Customer: I love this necklace! Do you have matching earrings?\nStaff: Yes! We have a complete jewelry set. Let me show you.\nCustomer: Oh, they're perfect! Is the gold real?\nStaff: Yes, 18k gold plated. We also have a 1-year warranty on all jewelry.\nCustomer: I'll take the whole set!",
    culturalTip: "Accessories can elevate any outfit! In many cultures, certain accessories have symbolic meaning. In some Asian cultures, jade is very significant. In the Middle East, gold is the traditional gift for brides."
  },
  checkout: {
    title: '💳 Checkout & Payment',
    vocabulary: ['Cash', 'Credit card', 'Debit card', 'Receipt', 'Change', 'Discount', 'Tax', 'Total', 'Price tag', 'Gift card'],
    grammar: ['How much is this?', 'Can I pay by card?', 'Do you accept cash?', 'Could I have a receipt?', 'Is there a discount?'],
    dialogue: "Cashier: Did you find everything okay?\nCustomer: Yes, thank you! Can I use this coupon?\nCashier: Of course! That gives you 20% off. Your total is now $45.\nCustomer: Great! Can I pay with card?\nCashier: Absolutely. Tap or insert your card whenever you're ready.\nCustomer: *pays* Do you offer gift wrapping?\nCashier: Yes, for just $2 more! Would you like that?\nCustomer: Yes, please!",
    culturalTip: "Payment methods vary: In the US, credit cards are most common. In Europe, contactless payments are popular. In Japan, cash is still widely used. Always check if tipping is expected - it's not in most retail stores."
  },
  fitting_room: {
    title: '🚪 Fitting Room',
    vocabulary: ['Fitting room', 'Mirror', 'Try on', 'Size', 'Too tight', 'Too loose', 'Perfect fit', 'Different size', 'Look good', 'Dress up'],
    grammar: ['Can I try this on?', 'Where is the fitting room?', 'Do you have this in a different size?', 'How does it look on me?'],
    dialogue: "Customer: Excuse me, where is the fitting room?\nStaff: It's right over there. Would you like me to take those for you?\nCustomer: Yes, thank you! *tries on dress*\nCustomer: This fits perfectly! How does it look?\nStaff: It looks amazing on you! The color really suits you.\nCustomer: I'll take it!",
    culturalTip: "In many Western countries, fitting rooms are free to use. In some high-end stores, personal shopping assistants may help you. Always return items you don't want to the attendant or leave them on the seat in the fitting room."
  },
};

function LearningPanel({ content, onClose }: { content: typeof LEARNING_CONTENT[string] | null; onClose: () => void }) {
  if (!content) return null;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      className="fixed right-0 top-0 h-full w-96 bg-gradient-to-b from-pink-50 to-rose-50 shadow-2xl z-50 overflow-y-auto border-l-2 border-pink-300"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-pink-900">{content.title}</h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-pink-100 hover:bg-pink-200 rounded-lg transition-colors text-pink-800 font-bold">✕</button>
        </div>

        <div className="space-y-5">
          <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }} className="bg-white rounded-xl p-4 shadow-sm border border-pink-100">
            <h3 className="text-sm font-bold text-pink-800 mb-2">📚 Vocabulary</h3>
            <div className="flex flex-wrap gap-2">
              {content.vocabulary.map((word, index) => (
                <span key={index} className="px-2.5 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-medium">{word}</span>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-4 shadow-sm border border-pink-100">
            <h3 className="text-sm font-bold text-pink-800 mb-2">📝 Useful Phrases</h3>
            <ul className="space-y-2">
              {content.grammar.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-pink-500 mt-0.5">•</span>
                  <span className="italic">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 shadow-sm border border-green-100">
            <h3 className="text-sm font-bold text-green-800 mb-2">💬 Example Dialogue</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{content.dialogue}</p>
          </motion.div>

          {content.culturalTip && (
            <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 shadow-sm border border-purple-100">
              <h3 className="text-sm font-bold text-purple-800 mb-2">🌟 Cultural Tip</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{content.culturalTip}</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function StoreScenePage() {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  
  const [isLocked, setIsLocked] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [nearestNPC, setNearestNPC] = useState<{ id: string; name: string } | null>(null);
  const [isInRange, setIsInRange] = useState(false);

  const handleLockChange = useCallback((locked: boolean) => setIsLocked(locked), []);
  const handleProximityChange = useCallback((npc: { id: string; name: string } | null, inRange: boolean) => {
    setNearestNPC(npc);
    setIsInRange(inRange);
  }, []);

  const { isConnected, isRecording, isPlaying, transcript, evaluation, currentCharacterId, connectToCharacter, disconnectFromCharacter, startRecording, stopRecording, endConversation, sendUserMessage } = useVoiceChat();

  useEffect(() => setIsChatting(isConnected), [isConnected]);
  const [textInput, setTextInput] = useState('');

  const handleCharacterClick = async (characterId: string) => {
    setSelectedObject(null);
    setSelectedCharacterId(characterId);
    if (currentCharacterId !== characterId || !isConnected) {
      if (isConnected) disconnectFromCharacter();
      await connectToCharacter(characterId);
    }
  };

  const handleObjectClick = (objectId: string) => {
    setSelectedObject(objectId === selectedObject ? null : objectId);
    if (isConnected) disconnectFromCharacter();
    setSelectedCharacterId(null);
  };

  const handleSendText = () => { if (textInput.trim() && isConnected) { sendUserMessage(textInput.trim()); setTextInput(''); } };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendText(); } };

  useEffect(() => {
    const handleSpaceKey = (e: KeyboardEvent) => { if (e.code === 'Space' && isInRange && nearestNPC && !isChatting) { e.preventDefault(); handleCharacterClick(nearestNPC.id); } };
    document.addEventListener('keydown', handleSpaceKey);
    return () => document.removeEventListener('keydown', handleSpaceKey);
  }, [isInRange, nearestNPC, isChatting]);

  const closeLearningPanel = () => setSelectedObject(null);
  const learningContent = selectedObject ? LEARNING_CONTENT[selectedObject] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
      <Head><title>🛍️ Shopping Store - Lingua Journey</title></Head>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-pink-900 mb-1">🛍️ Fashion Boutique</h1>
          <p className="text-pink-700">Practice shopping vocabulary, asking about sizes, and handling transactions!</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1 space-y-5">
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-pink-100">
              <h2 className="text-base font-bold text-pink-900 mb-3 flex items-center gap-2">👥 Characters <span className="text-xs font-normal text-pink-500">(click to chat)</span></h2>
              <div className="space-y-2">
                {CHARACTERS.map((char) => (
                  <button key={char.id} onClick={() => handleCharacterClick(char.id)} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${currentCharacterId === char.id ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400' : 'bg-pink-50 hover:bg-pink-100 border-2 border-transparent'}`}>
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
                  {transcript.length === 0 && <div className="text-center text-gray-400 text-xs pt-8">Tap "Start Speaking" to begin</div>}
                  {transcript.map((entry, i) => (
                    <div key={i} className={`text-sm ${entry.role === 'user' ? 'text-blue-700 text-right' : 'text-gray-700'}`}>
                      <span className="font-bold text-xs">{entry.role === 'user' ? 'You: ' : 'AI: '}</span>{entry.text}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {isRecording ? (
                    <button onClick={stopRecording} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"><span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" /> Stop Listening</button>
                  ) : (
                    <button onClick={startRecording} disabled={isPlaying} className={`flex-1 py-2.5 rounded-xl font-bold text-sm ${isPlaying ? 'bg-gray-300 text-gray-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'}`}>🎤 {isPlaying ? 'AI speaking...' : 'Start Speaking'}</button>
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
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-5 border border-pink-200">
                <h3 className="text-base font-bold text-pink-900 mb-3">📊 Your Evaluation</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="text-center bg-green-50 rounded-xl p-3"><div className="text-2xl font-bold text-green-600">{evaluation.pronunciation?.score ?? 85}</div><div className="text-xs text-gray-600">Pronunciation</div></div>
                  <div className="text-center bg-blue-50 rounded-xl p-3"><div className="text-2xl font-bold text-blue-600">{evaluation.grammar?.score ?? 88}</div><div className="text-xs text-gray-600">Grammar</div></div>
                </div>
                <p className="text-sm text-gray-700 bg-pink-50 rounded-lg p-3">{evaluation.overall?.feedback ?? 'Great job!'}</p>
              </motion.div>
            )}

            {!isConnected && !evaluation && (
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-pink-100">
                <h3 className="text-base font-bold text-pink-900 mb-2">🎯 How to use this scene</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2"><span className="text-pink-500">1.</span><span><strong>Click a character</strong> to start a voice conversation</span></li>
                  <li className="flex items-start gap-2"><span className="text-pink-500">2.</span><span>Click on <strong>clothing racks, checkout, or fitting rooms</strong> to learn vocabulary</span></li>
                  <li className="flex items-start gap-2"><span className="text-pink-500">3.</span><span>Use <strong>WASD</strong> to move around the store</span></li>
                </ul>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-pink-100">
              <div className="h-10 bg-gradient-to-r from-pink-500 to-rose-600 px-6 flex items-center justify-between">
                <h2 className="text-base font-bold text-white">🛍️ Fashion Boutique</h2>
                <div className="text-white/80 text-xs">{selectedObject ? `Learning: ${learningContent?.title || 'Item'}` : selectedCharacterId ? 'Voice Chat Active' : 'Explore & Learn'}</div>
              </div>

              <div className="relative h-[620px] bg-gradient-to-b from-pink-100 to-rose-200">
                <Canvas shadows dpr={[1, 2]}>
                  <Scene3D selectedCharacterId={selectedCharacterId} selectedObject={selectedObject} onCharacterClick={handleCharacterClick} onObjectClick={handleObjectClick} isConnected={isConnected} isRecording={isRecording} isPlaying={isPlaying} isLocked={isLocked} />
                  <PlayerControlsWrapper isChatting={isChatting} onLockChange={handleLockChange} onProximityChange={handleProximityChange} />
                </Canvas>

                {!isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-10">
                    <div className="bg-white/95 rounded-2xl px-8 py-6 shadow-xl text-center">
                      <div className="text-4xl mb-3">🛍️</div>
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

              <div className="p-6 bg-gradient-to-r from-pink-50 to-rose-50 border-t border-pink-100">
                <h3 className="text-sm font-bold text-pink-900 mb-2">About This Store</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  A stylish fashion boutique with the latest trends. Practice shopping vocabulary, asking about sizes and prices, trying on clothes, and completing transactions. Click on clothing racks to learn fashion vocabulary!
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