'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { Navbar } from '../../components/Navbar';
import { Character3D } from '../../components/scenes/Character3D';
import { PlayerCharacter } from '../../components/scenes/PlayerCharacter';
import { InteractionPrompt } from '../../components/scenes/InteractionPrompt';
import { CandleFlicker } from '../../components/scenes/CandleFlicker';
import { useVoiceChat } from '../../hooks/useVoiceChat';
import { usePlayerControls } from '../../hooks/usePlayerControls';
import { useProximityDetection } from '../../hooks/useProximityDetection';

const CHARACTERS = [
  { id: 'waiter_1', name: 'James (Waiter)', avatarColor: '#FDB97D', clothingColor: '#1a3a5c', position: [-1.8, 0, 0.5] as [number, number, number], role: 'waiter' as const, status: 'Here to take your order' },
  { id: 'customer_1', name: 'Emma (Customer)', avatarColor: '#FFDAB9', clothingColor: '#c97b8a', position: [2.2, 0, 0.8] as [number, number, number], role: 'customer_f' as const, status: 'Dining alone' },
  { id: 'customer_2', name: 'Marcus (Customer)', avatarColor: '#DEB887', clothingColor: '#4a6b3d', position: [1.8, 0, -1.8] as [number, number, number], role: 'customer_m' as const, status: 'Hungry and friendly' },
];

interface InteractiveItemProps { position: [number, number, number]; onClick: () => void; isSelected: boolean; children: React.ReactNode; hoverScale?: number; }

function InteractiveItem({ position, onClick, isSelected, children, hoverScale = 1.1 }: InteractiveItemProps) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!groupRef.current) return;
    const target = isSelected ? hoverScale + Math.sin(state.clock.elapsedTime * 3) * 0.05 : hovered ? hoverScale : 1;
    groupRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.2);
  });
  useEffect(() => { document.body.style.cursor = (hovered || isSelected) ? 'pointer' : 'auto'; }, [hovered, isSelected]);
  return (
    <group ref={groupRef} position={position} onClick={(e) => { e.stopPropagation(); onClick(); }} onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }} onPointerOut={() => setHovered(false)}>
      {children}
    </group>
  );
}

function RestaurantEnvironment() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow><planeGeometry args={[30, 30, 1, 1]} /><meshStandardMaterial color="#8B5A2B" roughness={0.8} /></mesh>
      {Array.from({ length: 15 }).map((_, i) => (<mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-7 + i, 0.005, 0]} receiveShadow><planeGeometry args={[0.02, 30]} /><meshStandardMaterial color="#6B3410" /></mesh>))}
      <mesh position={[0, 2.5, -6]} receiveShadow><boxGeometry args={[20, 5, 0.2]} /><meshStandardMaterial color="#d4a574" roughness={0.85} /></mesh>
      <mesh position={[-10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow><boxGeometry args={[12, 5, 0.2]} /><meshStandardMaterial color="#c99a6b" roughness={0.85} /></mesh>
      <mesh position={[10, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow><boxGeometry args={[12, 5, 0.2]} /><meshStandardMaterial color="#c99a6b" roughness={0.85} /></mesh>
      <mesh position={[0, 1.2, -5.85]}><boxGeometry args={[20, 1.5, 0.05]} /><meshStandardMaterial color="#8B6F47" roughness={0.7} /></mesh>
      {[-7, -3.5, 0, 3.5, 7].map((x, i) => (<mesh key={i} position={[x, 1.2, -5.83]}><boxGeometry args={[0.08, 1.6, 0.04]} /><meshStandardMaterial color="#6B5A3D" /></mesh>))}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 5, 0]} receiveShadow><planeGeometry args={[30, 30]} /><meshStandardMaterial color="#e8d5b7" roughness={0.9} /></mesh>
      <group position={[6, 1.5, -5.85]}><mesh position={[0, 0, 0.05]} castShadow><boxGeometry args={[1.6, 3, 0.08]} /><meshStandardMaterial color="#5C3D1E" roughness={0.6} /></mesh><mesh position={[0.5, 0, 0.15]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color="#D4AF37" metalness={0.7} roughness={0.3} /></mesh></group>
      <group position={[-5.5, 2.8, -5.85]}><mesh position={[0, 0, 0.05]}><boxGeometry args={[2.5, 2, 0.05]} /><meshStandardMaterial color="#2a3a4a" roughness={0.3} metalness={0.1} emissive="#4a5a6a" emissiveIntensity={0.2} /></mesh><mesh position={[0, 0, 0.1]}><boxGeometry args={[2.7, 2.2, 0.08]} /><meshStandardMaterial color="#5C3D1E" /></mesh></group>
      {[-2.5, 1.5].map((x, i) => (<group key={i} position={[x, 3.2, -5.82]}><mesh castShadow><boxGeometry args={[1.2, 0.8, 0.05]} /><meshStandardMaterial color="#8B6F47" /></mesh><mesh position={[0, 0, 0.03]}><boxGeometry args={[1, 0.6, 0.02]} /><meshStandardMaterial color={i === 0 ? '#c97b8a' : '#7b8ac9'} emissive={i === 0 ? '#c97b8a' : '#7b8ac9'} emissiveIntensity={0.1} /></mesh></group>))}
      {[-4, 0, 4].map((x, i) => (<group key={i} position={[x, 4.8, -1]}><mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.02, 0.02, 0.6, 8]} /><meshStandardMaterial color="#333" /></mesh><mesh position={[0, -0.3, 0]} castShadow><cylinderGeometry args={[0.3, 0.15, 0.3, 16]} /><meshStandardMaterial color="#6B3410" roughness={0.7} emissive="#3a1d08" emissiveIntensity={0.3} /></mesh><mesh position={[0, -0.35, 0]}><sphereGeometry args={[0.08, 12, 12]} /><meshStandardMaterial color="#FFF4D4" emissive="#FFE082" emissiveIntensity={2} /></mesh><pointLight intensity={0.8} color="#FFC880" distance={5} decay={2} position={[0, -0.35, 0]} /></group>))}
      <group position={[-8.5, 0, -5]}><mesh position={[0, 0.4, 0]} castShadow><cylinderGeometry args={[0.35, 0.25, 0.8, 12]} /><meshStandardMaterial color="#8B4513" roughness={0.8} /></mesh>{Array.from({ length: 8 }).map((_, i) => (<mesh key={i} position={[Math.cos(i * 0.8) * 0.2, 1 + i * 0.08, Math.sin(i * 0.8) * 0.2]} castShadow><sphereGeometry args={[0.25, 8, 8]} /><meshStandardMaterial color={i % 2 === 0 ? '#2d5a2d' : '#3d7a3d'} roughness={0.8} /></mesh>))}</group>
      <group position={[8.5, 0, -3]}><mesh position={[0, 0.55, 0]} castShadow><boxGeometry args={[1.8, 1.1, 0.8]} /><meshStandardMaterial color="#5C3D1E" roughness={0.7} /></mesh><mesh position={[0, 1.15, 0]} castShadow><boxGeometry args={[1.9, 0.08, 0.9]} /><meshStandardMaterial color="#2d1810" roughness={0.4} metalness={0.2} /></mesh>{[-0.5, -0.25, 0, 0.25, 0.5].map((bx, i) => (<group key={i} position={[bx, 1.45, 0]}><mesh castShadow><cylinderGeometry args={[0.06, 0.07, 0.35, 8]} /><meshStandardMaterial color={i % 2 === 0 ? '#4a1010' : '#1a3a5c'} roughness={0.5} metalness={0.2} /></mesh><mesh position={[0, 0.22, 0]}><cylinderGeometry args={[0.04, 0.04, 0.08, 8]} /><meshStandardMaterial color="#D4AF37" roughness={0.4} /></mesh></group>))}</group>
    </group>
  );
}

interface DiningTableProps { position: [number, number, number]; rotationY?: number; tableId: string; selectedObject: string | null; onObjectClick: (id: string) => void; }

function DiningTable({ position, rotationY = 0, tableId, selectedObject, onObjectClick }: DiningTableProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow><boxGeometry args={[2, 0.08, 1.4]} /><meshStandardMaterial color="#6B3410" roughness={0.5} metalness={0.1} /></mesh>
      {[[-0.9, 0.35, 0.6] as [number, number, number], [0.9, 0.35, 0.6] as [number, number, number], [-0.9, 0.35, -0.6] as [number, number, number], [0.9, 0.35, -0.6] as [number, number, number]].map((pos, i) => (<mesh key={i} position={pos} castShadow><boxGeometry args={[0.1, 0.7, 0.1]} /><meshStandardMaterial color="#4a2810" roughness={0.7} /></mesh>))}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow><boxGeometry args={[0.5, 0.06, 0.5]} /><meshStandardMaterial color="#5C3D1E" roughness={0.6} /></mesh><mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[0.48, 0.05, 0.48]} /><meshStandardMaterial color="#8B2500" roughness={0.9} /></mesh><mesh position={[0, 0.85, -0.23]} castShadow><boxGeometry args={[0.45, 0.7, 0.06]} /><meshStandardMaterial color="#5C3D1E" roughness={0.6} /></mesh>
      {[[-0.22, 0.22, 0.22] as [number, number, number], [0.22, 0.22, 0.22] as [number, number, number], [-0.22, 0.22, -0.22] as [number, number, number], [0.22, 0.22, -0.22] as [number, number, number]].map((pos, i) => (<mesh key={i} position={pos} castShadow><cylinderGeometry args={[0.05, 0.05, 0.45, 8]} /><meshStandardMaterial color="#3a2410" roughness={0.7} /></mesh>))}
      <InteractiveItem position={[-0.5, 0.8, 0]} onClick={() => onObjectClick(`${tableId}_plate1`)} isSelected={selectedObject === `${tableId}_plate1`}><mesh castShadow><cylinderGeometry args={[0.22, 0.2, 0.03, 24]} /><meshStandardMaterial color="white" roughness={0.3} /></mesh><mesh position={[0, 0.04, 0]} castShadow><cylinderGeometry args={[0.15, 0.16, 0.04, 16]} /><meshStandardMaterial color="#5C2E1E" roughness={0.7} /></mesh></InteractiveItem>
      <InteractiveItem position={[0.5, 0.8, 0]} onClick={() => onObjectClick(`${tableId}_plate2`)} isSelected={selectedObject === `${tableId}_plate2`}><mesh castShadow><cylinderGeometry args={[0.22, 0.2, 0.03, 24]} /><meshStandardMaterial color="white" roughness={0.3} /></mesh>{Array.from({ length: 6 }).map((_, i) => (<mesh key={i} position={[Math.cos(i) * 0.06, 0.04, Math.sin(i) * 0.06]}><cylinderGeometry args={[0.01, 0.01, 0.15, 6]} /><meshStandardMaterial color="#F4C430" roughness={0.6} /></mesh>))}</InteractiveItem>
      <InteractiveItem position={[-0.3, 0.8, 0.4]} onClick={() => onObjectClick(`${tableId}_wine1`)} isSelected={selectedObject === `${tableId}_wine1`}><mesh castShadow><cylinderGeometry args={[0.08, 0.08, 0.05, 12]} /><meshStandardMaterial color="#8B0000" roughness={0.2} metalness={0.1} transparent opacity={0.7} /></mesh><mesh position={[0, 0.1, 0]} castShadow><cylinderGeometry args={[0.11, 0.05, 0.18, 12]} /><meshStandardMaterial color="white" transparent opacity={0.2} roughness={0.1} metalness={0.3} /></mesh></InteractiveItem>
      <mesh position={[-0.7, 0.8, -0.4]} rotation={[0, 0, Math.PI / 2]} castShadow><boxGeometry args={[0.02, 0.15, 0.02]} /><meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.3} /></mesh>
      <InteractiveItem position={[0.7, 0.82, -0.3]} onClick={() => onObjectClick(`${tableId}_menu`)} isSelected={selectedObject === `${tableId}_menu`}><mesh rotation={[-0.3, 0.2, 0]} castShadow><boxGeometry args={[0.3, 0.02, 0.4]} /><meshStandardMaterial color="#F5F5DC" roughness={0.8} /></mesh></InteractiveItem>
      <CandleFlicker position={[0, 0.77, 0]} />
    </group>
  );
}

function PlayerControlsWrapper({ isChatting, onLockChange, onProximityChange }: PlayerControlsWrapperProps) {
  const { playerPosition, keys, isLocked, playerFacing } = usePlayerControls({ enabled: !isChatting, firstPerson: isChatting });
  const { nearestNPC, isInRange } = useProximityDetection(playerPosition, CHARACTERS);
  useEffect(() => { onLockChange(isLocked); }, [isLocked, onLockChange]);
  useEffect(() => { onProximityChange(nearestNPC, isInRange); }, [nearestNPC, isInRange, onProximityChange]);
  return (<><PointerLockControls onLock={() => onLockChange(true)} onUnlock={() => onLockChange(false)} /><PlayerCharacter firstPerson={isChatting} playerPosition={playerPosition} keys={keys} playerFacing={playerFacing} /></>);
}

interface Scene3DProps { selectedCharacterId: string | null; selectedObject: string | null; onCharacterClick: (id: string) => void; onObjectClick: (id: string) => void; isConnected: boolean; isRecording: boolean; isPlaying: boolean; isLocked: boolean; }

function Scene3D({ selectedCharacterId, selectedObject, onCharacterClick, onObjectClick, isConnected, isRecording, isPlaying, isLocked }: Scene3DProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.7, 4]} fov={50} />
      <OrbitControls enabled={!isLocked} enablePan={!isLocked} enableZoom={!isLocked} enableRotate={!isLocked} minDistance={3} maxDistance={20} target={[0, 0.8, 0]} maxPolarAngle={Math.PI / 2 - 0.1} />
      <ambientLight intensity={0.35} color="#FFE8C0" /><directionalLight position={[8, 15, 8]} intensity={0.5} color="#FFF8DC" castShadow /><pointLight position={[0, 6, 8]} intensity={0.6} color="#FFCC80" distance={15} decay={1.5} /><pointLight position={[-5, 3, 3]} intensity={0.4} color="#FFB060" distance={10} decay={2} />
      <RestaurantEnvironment />
      <DiningTable position={[-3, 0, -0.5]} rotationY={0.15} tableId="table1" selectedObject={selectedObject} onObjectClick={onObjectClick} />
      <DiningTable position={[2.5, 0, -0.5]} rotationY={-0.1} tableId="table2" selectedObject={selectedObject} onObjectClick={onObjectClick} />
      <DiningTable position={[3.5, 0, -3]} rotationY={0.3} tableId="table3" selectedObject={selectedObject} onObjectClick={onObjectClick} />
      <InteractiveItem position={[6, 1.5, -5.7]} onClick={() => onObjectClick('door')} isSelected={selectedObject === 'door'}><mesh><boxGeometry args={[1.7, 3.1, 0.01]} /><meshStandardMaterial color="#5C3D1E" transparent opacity={0.01} /></mesh></InteractiveItem>
      <InteractiveItem position={[-5.5, 2.8, -5.7]} onClick={() => onObjectClick('window')} isSelected={selectedObject === 'window'}><mesh><boxGeometry args={[2.7, 2.2, 0.01]} /><meshStandardMaterial color="#2a3a4a" transparent opacity={0.01} /></mesh></InteractiveItem>
      <InteractiveItem position={[8.5, 1, -3]} onClick={() => onObjectClick('bar')} isSelected={selectedObject === 'bar'}><mesh><boxGeometry args={[2, 2, 1]} /><meshStandardMaterial color="#5C3D1E" transparent opacity={0.01} /></mesh></InteractiveItem>
      {CHARACTERS.map((char) => (<Character3D key={char.id} name={char.name} avatarColor={char.avatarColor} clothingColor={char.clothingColor} position={char.position} role={char.role} animationState={selectedCharacterId === char.id && isRecording ? 'listening' : selectedCharacterId === char.id && isPlaying ? 'talking' : selectedCharacterId === char.id ? 'waving' : 'idle'} isSelected={selectedCharacterId === char.id} onClick={() => onCharacterClick(char.id)} status={char.status} />))}
    </>
  );
}

const LEARNING_CONTENT: Record<string, { title: string; vocabulary: string[]; grammar: string[]; dialogue: string; culturalTip?: string; }> = {
  table1_menu: { title: '📖 Reading a Menu', vocabulary: ['Menu', 'Appetizer', 'Main course', 'Dessert', "Today's special", 'Chef recommendation', 'Gluten-free', 'Vegetarian'], grammar: ['Could I see the menu?', 'What do you recommend?', "I'll have the...", 'Does this contain...?'], dialogue: "Customer: Could I see the menu, please?\nWaiter: Certainly. Today's special is grilled salmon.\nCustomer: That sounds delicious. I'll have that.\nWaiter: Excellent choice!", culturalTip: "In Western restaurants, menus typically list starters/appetizers, main courses, and desserts." },
  table1_plate1: { title: '🥩 Ordering Food', vocabulary: ['Steak', 'Medium rare', 'Well done', 'Rare', 'Side dish', 'Sauce', 'Seasoning', 'Portion'], grammar: ['I would like the steak, please.', 'How would you like it cooked?', 'Medium rare, please.', 'Could I have it without...?'], dialogue: "Waiter: How would you like your steak cooked?\nCustomer: Medium rare, please.\nWaiter: Would you like a sauce with that?\nCustomer: Yes, I'll have the pepper sauce." },
  door: { title: '🚪 Entering and Leaving', vocabulary: ['Reservation', 'Table for two', 'Welcome', 'Good evening', 'Check please', 'Thank you', 'Goodbye', 'Come again!'], grammar: ['I have a reservation.', 'Table for [number], please.', 'Could we have the check/bill?', 'Thank you very much!'], dialogue: "Host: Good evening! Welcome to our restaurant.\nCustomer: Good evening - I have a reservation under Smith.\nHost: Perfect! Right this way." },
  window: { title: '🪟 Making Small Talk', vocabulary: ['View', 'Atmosphere', 'Decor', 'Cozy', 'Romantic', 'Lively', 'Ambience', 'Beautiful'], grammar: ["Isn't this place lovely?", 'What a great atmosphere!', 'It feels so cozy in here.', 'I love the decor.'], dialogue: "Emma: Isn't this restaurant lovely?\nMarcus: Yes, it has such a warm atmosphere.\nEmma: I love the candlelight!" },
  bar: { title: '🍸 At the Bar', vocabulary: ['Bartender', 'Cocktail', 'On the rocks', 'Straight up', 'Tab', 'Draft beer', 'Wine list', 'Happy hour'], grammar: ['Could I have a drink?', 'What do you have on tap?', "I'll have another, please.", 'Could you start a tab?'], dialogue: "Bartender: What can I get for you?\nCustomer: What do you have on draft?\nBartender: We have a local IPA and a German lager." },
};

function LearningPanel({ content, onClose }: { content: typeof LEARNING_CONTENT[string] | null }) {
  if (!content) return null;
  return (
    <motion.div initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 220 }} className="fixed right-0 top-0 h-full w-96 bg-gradient-to-b from-amber-50 to-orange-50 shadow-2xl z-50 overflow-y-auto border-l-2 border-amber-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5"><h2 className="text-xl font-bold text-amber-900">{content.title}</h2><button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors text-amber-800 font-bold">✕</button></div>
        <div className="space-y-5">
          <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }} className="bg-white rounded-xl p-4 shadow-sm border border-amber-100"><h3 className="text-sm font-bold text-amber-800 mb-2">📚 Vocabulary</h3><div className="flex flex-wrap gap-2">{content.vocabulary.map((word, index) => (<span key={index} className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">{word}</span>))}</div></motion.div>
          <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-4 shadow-sm border border-amber-100"><h3 className="text-sm font-bold text-amber-800 mb-2">📝 Useful Phrases</h3><ul className="space-y-2">{content.grammar.map((item, index) => (<li key={index} className="flex items-start gap-2 text-sm text-gray-700"><span className="text-amber-500 mt-0.5">•</span><span className="italic">{item}</span></li>))}</ul></motion.div>
          <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 shadow-sm border border-green-100"><h3 className="text-sm font-bold text-green-800 mb-2">💬 Example Dialogue</h3><p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{content.dialogue}</p></motion.div>
          {content.culturalTip && (<motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 shadow-sm border border-purple-100"><h3 className="text-sm font-bold text-purple-800 mb-2">🌟 Cultural Tip</h3><p className="text-sm text-gray-700 leading-relaxed">{content.culturalTip}</p></motion.div>)}
        </div>
      </div>
    </motion.div>
  );
}

export default function RestaurantScenePage() {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [nearestNPC, setNearestNPC] = useState<{ id: string; name: string } | null>(null);
  const [isInRange, setIsInRange] = useState(false);
  const handleLockChange = useCallback((locked: boolean) => { setIsLocked(locked); }, []);
  const handleProximityChange = useCallback((npc: { id: string; name: string } | null, inRange: boolean) => { setNearestNPC(npc); setIsInRange(inRange); }, []);
  const { isConnected, isRecording, isPlaying, transcript, evaluation, currentCharacterId, connectToCharacter, disconnectFromCharacter, startRecording, stopRecording, endConversation, sendUserMessage } = useVoiceChat();
  useEffect(() => { setIsChatting(isConnected); }, [isConnected]);
  const [textInput, setTextInput] = useState('');
  const handleCharacterClick = async (characterId: string) => { setSelectedObject(null); setSelectedCharacterId(characterId); if (currentCharacterId !== characterId || !isConnected) { if (isConnected) disconnectFromCharacter(); await connectToCharacter(characterId); } };
  const handleObjectClick = (objectId: string) => { setSelectedObject(objectId === selectedObject ? null : objectId); if (isConnected) disconnectFromCharacter(); setSelectedCharacterId(null); };
  const handleSendText = () => { if (textInput.trim() && isConnected) { sendUserMessage(textInput.trim()); setTextInput(''); } };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendText(); } };
  useEffect(() => { const handleSpaceKey = (e: KeyboardEvent) => { if (e.code === 'Space' && isInRange && nearestNPC && !isChatting) { e.preventDefault(); handleCharacterClick(nearestNPC.id); } }; document.addEventListener('keydown', handleSpaceKey); return () => document.removeEventListener('keydown', handleSpaceKey); }, [isInRange, nearestNPC, isChatting]);
  const closeLearningPanel = () => { setSelectedObject(null); };
  const learningContent = selectedObject ? LEARNING_CONTENT[selectedObject] : null;
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Head><title>🍽️ Restaurant Scene - Lingua Journey</title></Head>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center"><h1 className="text-3xl font-bold text-amber-900 mb-1">🍽️ Cozy Restaurant</h1><p className="text-amber-700">Click on characters to practice conversation, or click on objects to learn vocabulary!</p></motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1 space-y-5">
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-amber-100"><h2 className="text-base font-bold text-amber-900 mb-3 flex items-center gap-2">👥 Characters <span className="text-xs font-normal text-amber-500">(click to chat)</span></h2><div className="space-y-2">{CHARACTERS.map((char) => (<button key={char.id} onClick={() => handleCharacterClick(char.id)} className={`w-full text-left p-3 rounded-xl transition-all text-sm ${currentCharacterId === char.id ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400' : 'bg-amber-50 hover:bg-amber-100 border-2 border-transparent'}`}><div className="font-semibold text-gray-900">{char.name}</div><div className="text-xs text-gray-500 mt-0.5">{char.status}</div></button>))}</div></div>
            {isConnected && (<div className="bg-white rounded-2xl shadow-lg p-5 border border-green-100"><div className="flex items-center justify-between mb-3"><h3 className="text-base font-bold text-green-800">💬 Conversation</h3><div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">● Connected</div></div><div className="bg-gray-50 rounded-xl p-3 h-40 overflow-y-auto mb-4 space-y-2 border border-gray-100">{transcript.length === 0 && (<div className="text-center text-gray-400 text-xs pt-8">Tap "Start Speaking" to begin conversation</div>)}{transcript.map((entry, i) => (<div key={i} className={`text-sm ${entry.role === 'user' ? 'text-blue-700 text-right' : 'text-gray-700'}`}><span className="font-bold text-xs">{entry.role === 'user' ? 'You: ' : 'AI: '}</span>{entry.text}</div>))}</div><div className="flex flex-wrap gap-2 mb-3">{isRecording ? (<button onClick={stopRecording} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"><span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" /> Stop Listening</button>) : (<button onClick={startRecording} disabled={isPlaying} className={`flex-1 py-2.5 rounded-xl font-bold text-sm ${isPlaying ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'}`}>🎤 {isPlaying ? 'AI speaking...' : 'Start Speaking'}</button>)}<button onClick={endConversation} className="py-2.5 px-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm">End</button></div><div className="flex gap-2"><input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type message..." className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm" /><button onClick={handleSendText} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold text-sm">Send</button></div></div>)}
            {evaluation && (<motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-5 border border-amber-200"><h3 className="text-base font-bold text-amber-900 mb-3">📊 Your Evaluation</h3><div className="grid grid-cols-2 gap-3 mb-3"><div className="text-center bg-green-50 rounded-xl p-3"><div className="text-2xl font-bold text-green-600">{evaluation.pronunciation?.score ?? 85}</div><div className="text-xs text-gray-600">Pronunciation</div></div><div className="text-center bg-blue-50 rounded-xl p-3"><div className="text-2xl font-bold text-blue-600">{evaluation.grammar?.score ?? 88}</div><div className="text-xs text-gray-600">Grammar</div></div></div><p className="text-sm text-gray-700 bg-amber-50 rounded-lg p-3">{evaluation.overall?.feedback ?? 'Great job!'}</p></motion.div>)}
            {!isConnected && !evaluation && (<div className="bg-white rounded-2xl shadow-lg p-5 border border-amber-100"><h3 className="text-base font-bold text-amber-900 mb-2">🎯 How to use this scene</h3><ul className="space-y-2 text-sm text-gray-700"><li className="flex items-start gap-2"><span className="text-amber-500">1.</span><span><strong>Click a character</strong> to start voice conversation</span></li><li className="flex items-start gap-2"><span className="text-amber-500">2.</span><span>Click on <strong>objects</strong> to learn vocabulary</span></li><li className="flex items-start gap-2"><span className="text-amber-500">3.</span><span>Use <strong>WASD</strong> to move around</span></li></ul></div>)}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-100">
              <div className="h-10 bg-gradient-to-r from-amber-500 to-orange-500 px-6 flex items-center justify-between"><h2 className="text-base font-bold text-white">🍽️ The Warm Table Restaurant</h2><div className="text-white/80 text-xs">{selectedObject ? `Learning: ${learningContent?.title || 'Item'}` : selectedCharacterId ? 'Voice Chat Active' : 'Explore & Learn'}</div></div>
              <div className="relative h-[620px] bg-gradient-to-b from-amber-100 to-orange-200">
                <Canvas shadows dpr={[1, 2]}><Scene3D selectedCharacterId={selectedCharacterId} selectedObject={selectedObject} onCharacterClick={handleCharacterClick} onObjectClick={handleObjectClick} isConnected={isConnected} isRecording={isRecording} isPlaying={isPlaying} isLocked={isLocked} /><PlayerControlsWrapper isChatting={isChatting} onLockChange={handleLockChange} onProximityChange={handleProximityChange} /></Canvas>
                {!isLocked && (<div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-10"><div className="bg-white/95 rounded-2xl px-8 py-6 shadow-xl text-center"><div className="text-4xl mb-3">🎮</div><h3 className="text-xl font-bold text-gray-900 mb-2">Click to Start</h3><p className="text-gray-600 text-sm">Click anywhere to enable first-person controls</p><p className="text-gray-500 text-xs mt-3">Press ESC to release mouse</p></div></div>)}
                <InteractionPrompt isInRange={isInRange} nearestNPCName={nearestNPC?.name || null} />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg px-4 py-2 shadow-md text-xs text-gray-700">{isLocked ? 'WASD to move • Mouse to look • SPACE to interact • ESC to release' : 'Click to start exploring'}</div>
              </div>
              <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-100"><h3 className="text-sm font-bold text-amber-900 mb-2">About This Restaurant</h3><p className="text-sm text-gray-700 leading-relaxed">A cozy, warm restaurant with wooden furniture, candlelight, and friendly staff. Practice ordering food, making small talk, and polite conversation.</p></div>
            </div>
          </motion.div>
        </div>
        <AnimatePresence>{selectedObject && learningContent && (<LearningPanel content={learningContent} onClose={closeLearningPanel} />)}</AnimatePresence>
      </div>
    </div>
  );
}

interface PlayerControlsWrapperProps { isChatting: boolean; onLockChange: (locked: boolean) => void; onProximityChange: (nearestNPC: { id: string; name: string } | null, isInRange: boolean) => void; }