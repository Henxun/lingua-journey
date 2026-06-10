'use client';

import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Navbar } from '../../components/Navbar';

interface SceneInfo {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
}

const SCENES: SceneInfo[] = [
  {
    id: 'restaurant',
    name: 'Cozy Restaurant',
    emoji: '🍽️',
    description: 'Practice ordering food, making reservations, and polite dining conversations in a warm restaurant setting.',
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'cafe',
    name: 'Coffee Shop',
    emoji: '☕',
    description: 'Learn to order coffee, make small talk, and practice casual conversations at a cozy cafe.',
    color: 'from-amber-700 to-yellow-600'
  },
  {
    id: 'airport',
    name: 'Airport',
    emoji: '✈️',
    description: 'Navigate through check-in, security, boarding, and asking for directions at the airport.',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'store',
    name: 'Shopping Store',
    emoji: '🛍️',
    description: 'Practice shopping vocabulary, asking about sizes, and handling transactions at a retail store.',
    color: 'from-pink-500 to-rose-600'
  }
];

function SceneCard({ scene, index, onClick }: { scene: SceneInfo; index: number; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl cursor-pointer bg-gradient-to-br ${scene.color} p-6 text-white shadow-xl`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
      
      <div className="relative z-10">
        <div className="text-5xl mb-4">{scene.emoji}</div>
        <h3 className="text-2xl font-bold mb-2">{scene.name}</h3>
        <p className="text-white/90 text-sm leading-relaxed">{scene.description}</p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 px-5 py-2 bg-white text-gray-800 rounded-xl font-semibold text-sm shadow-lg"
        >
          Enter Scene →
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function SceneSelectorPage() {
  const router = useRouter();

  const handleSelectScene = (sceneId: string) => {
    router.push(`/scenes/${sceneId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Head>
        <title>Choose a Scene - Lingua Journey</title>
      </Head>
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎭 Choose Your Learning Scene
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Step into immersive 3D environments to practice real-world conversations. 
            Each scene features interactive characters and vocabulary panels.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SCENES.map((scene, index) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              index={index}
              onClick={() => handleSelectScene(scene.id)}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur rounded-full px-6 py-3 shadow-lg">
            <span className="text-2xl">💡</span>
            <p className="text-gray-700">
              <strong>Tip:</strong> Click on characters to start voice conversations, 
              or click on objects to learn vocabulary!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}