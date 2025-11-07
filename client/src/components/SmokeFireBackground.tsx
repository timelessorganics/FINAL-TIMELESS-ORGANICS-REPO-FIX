import { useEffect, useState, useRef } from 'react';
import video1 from '@assets/1 SMOKE HOVERS BOTTOM OF SCREEN_1761435915769.mp4';
import video2 from '@assets/2 SMOKE HOVERS IN BACKGROUND_1761435915770.mp4';
import video3 from '@assets/3 SMOKE HOVERS TINY SPARKS7_1761435915770.mp4';
import video4 from '@assets/4 SMOKE HOVERS FLAMES STSRT_1761435915771.mp4';
import video5 from '@assets/5 SMOKE HOVERS BIGGER SPARKS_1761435915772.mp4';
import video6 from '@assets/6 SMOKE HOVERS BIGGER SPARKS_1761435915771.mp4';

const videos = [video1, video2, video3, video4, video5, video6];

interface SmokeFireBackgroundProps {
  intensity?: 'full' | 'subtle';
}

export function SmokeFireBackground({ intensity = 'full' }: SmokeFireBackgroundProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoOpacity = intensity === 'full' ? 0.55 : 0.15;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      const nextIndex = (currentIndex + 1) % videos.length;
      video.src = videos[nextIndex];
      video.load();
      video.play().catch(() => {});
      setCurrentIndex(nextIndex);
    };

    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('ended', handleEnded);
      video.pause();
      video.src = '';
    };
  }, [currentIndex]);

  return (
    <div className="fixed inset-0 z-40 overflow-hidden pointer-events-none">
      <video
        ref={videoRef}
        src={videos[currentIndex]}
        autoPlay
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          opacity: videoOpacity,
          mixBlendMode: 'screen'
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
    </div>
  );
}
