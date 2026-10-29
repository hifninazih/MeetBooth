'use client';

interface CountdownProps {
  currentCount: number | null;
  message?: string;
}

export default function Countdown({ currentCount, message }: CountdownProps) {
  if (currentCount === null) return null;

  const isSnap = currentCount === 0;

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/35 backdrop-blur-[2px] transition-all animate-in fade-in duration-200">
      <div className="relative flex flex-col items-center justify-center">
        {isSnap ? (
          <div className="flex flex-col items-center scale-110 animate-bounce">
            <span className="text-6xl sm:text-7xl">📸</span>
            <span className="mt-3 text-3xl sm:text-4xl font-black tracking-wider text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              {message || 'SMILE!'}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex h-28 w-28 sm:h-36 sm:w-36 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border-4 border-white/80 shadow-2xl animate-pulse">
              <span className="text-6xl sm:text-7xl font-black text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
                {currentCount}
              </span>
            </div>
            <p className="mt-4 text-base sm:text-lg font-bold tracking-widest text-white/90 drop-shadow uppercase">
              Bersiap untuk Pose!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
