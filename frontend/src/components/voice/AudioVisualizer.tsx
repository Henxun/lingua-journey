import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface AudioVisualizerProps {
  isRecording: boolean;
  isPlaying: boolean;
}

export function AudioVisualizer({ isRecording, isPlaying }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (!isRecording) {
      setAudioLevel(0);
      return;
    }

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new AudioContext();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        source.connect(analyserRef.current);

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

        const updateLevel = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            setAudioLevel(average / 255);
          }
          animationRef.current = requestAnimationFrame(updateLevel);
        };

        updateLevel();
      } catch (err) {
        console.warn('Audio visualization not available:', err);
      }
    };

    initAudio();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isRecording]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bars = 32;
    const barWidth = canvas.width / bars - 2;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < bars; i++) {
        const barHeight = isRecording
          ? Math.random() * canvas.height * 0.8 + 10
          : Math.sin(Date.now() / 500 + i * 0.3) * 20 + 30;

        const x = i * (barWidth + 2);
        const y = canvas.height - barHeight;

        const gradient = ctx.createLinearGradient(x, y, x, canvas.height);
        if (isPlaying) {
          gradient.addColorStop(0, '#22c55e');
          gradient.addColorStop(1, '#16a34a');
        } else if (isRecording) {
          gradient.addColorStop(0, '#ef4444');
          gradient.addColorStop(1, '#dc2626');
        } else {
          gradient.addColorStop(0, '#94a3b8');
          gradient.addColorStop(1, '#64748b');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 4);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    };

    draw();
  }, [isRecording, isPlaying, audioLevel]);

  const getStatusText = () => {
    if (isRecording) return 'Recording...';
    if (isPlaying) return 'Speaking...';
    return 'Ready';
  };

  const getStatusColor = () => {
    if (isRecording) return 'bg-red-500';
    if (isPlaying) return 'bg-green-500';
    return 'bg-gray-400';
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={200}
        height={60}
        className="w-full max-w-[200px] h-[60px] rounded-lg bg-gray-50"
      />
      
      <div className="flex items-center gap-2">
        {isRecording && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className={`w-3 h-3 rounded-full ${getStatusColor()}`}
          />
        )}
        {isPlaying && (
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className={`w-3 h-3 rounded-full ${getStatusColor()}`}
          />
        )}
        <span className="text-sm font-medium text-gray-600">
          {getStatusText()}
        </span>
      </div>
    </div>
  );
}