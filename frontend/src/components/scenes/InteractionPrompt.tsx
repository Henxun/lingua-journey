import { useEffect, useState } from 'react';

export interface InteractionPromptProps {
  isInRange: boolean;
  nearestNPCName: string | null;
}

export function InteractionPrompt({ isInRange, nearestNPCName }: InteractionPromptProps) {
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isInRange && nearestNPCName) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setVisible(true);
      });
    } else {
      setVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isInRange, nearestNPCName]);

  if (!shouldRender) return null;

  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ bottom: '20%' }}
    >
      <div className="px-6 py-3 rounded-xl bg-black/60 backdrop-blur-md shadow-lg border border-white/10">
        <p className="text-white text-base font-medium whitespace-nowrap">
          Press <span className="inline-flex items-center justify-center px-2 py-0.5 mx-1 rounded bg-white/20 text-sm font-semibold">SPACE</span> to talk to {nearestNPCName}
        </p>
      </div>
    </div>
  );
}
