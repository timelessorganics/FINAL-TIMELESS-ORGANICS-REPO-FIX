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
  const [nextIndex, setNextIndex] = useState(1);
  const [showCurrent, setShowCurrent] = useState(true);
  
  const currentVideoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);
  
  const videoOpacity = intensity === 'full' ? 0.55 : 0.15;

  // Handle video transitions
  useEffect(() => {
    const currentVideo = currentVideoRef.current;
    const nextVideo = nextVideoRef.current;
    
    if (!currentVideo || !nextVideo) return;

    let isTransitioning = false;

    const handleEnded = () => {
      // When current video ends, immediately show next and start playing
      if (!isTransitioning) {
        isTransitioning = true;
        
        // Start next video
        nextVideo.currentTime = 0;
        nextVideo.play().catch(() => {});
        
        // Crossfade
        setShowCurrent(false);
        
        // After fade completes, swap videos
        setTimeout(() => {
          setShowCurrent(true);
          setCurrentIndex(nextIndex);
          setNextIndex((nextIndex + 1) % videos.length);
          isTransitioning = false;
        }, 1500);
      }
    };

    // Use 'ended' event for clean transitions
    currentVideo.addEventListener('ended', handleEnded);
    
    return () => {
      currentVideo.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, nextIndex]);

  return (
    <div className="fixed inset-0 z-40 overflow-hidden pointer-events-none">
      <video
        ref={currentVideoRef}
        src={videos[currentIndex]}
        autoPlay
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          opacity: showCurrent ? videoOpacity : 0,
          mixBlendMode: 'screen',
          transition: 'opacity 1.5s ease-in-out'
        }}
      />
      
      <video
        ref={nextVideoRef}
        src={videos[nextIndex]}
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          opacity: showCurrent ? 0 : videoOpacity,
          mixBlendMode: 'screen',
          transition: 'opacity 1.5s ease-in-out'
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
    </div>
  );
}
