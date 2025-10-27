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
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const currentVideoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);
  
  const videoOpacity = intensity === 'full' ? 0.55 : 0.15;

  useEffect(() => {
    const currentVideo = currentVideoRef.current;
    const nextVideo = nextVideoRef.current;
    if (!currentVideo || !nextVideo) return;

    const handleTimeUpdate = () => {
      const duration = currentVideo.duration;
      const currentTime = currentVideo.currentTime;
      
      if (duration - currentTime <= 0.5) {
        if (!isTransitioning) {
          setIsTransitioning(true);
          nextVideo.currentTime = 0;
          nextVideo.play();
          setTimeout(() => {
            setCurrentIndex(nextIndex);
            setNextIndex((nextIndex + 1) % videos.length);
            setIsTransitioning(false);
          }, 500);
        }
      }
    };

    currentVideo.addEventListener('timeupdate', handleTimeUpdate);
    return () => currentVideo.removeEventListener('timeupdate', handleTimeUpdate);
  }, [currentIndex, nextIndex, isTransitioning]);

  return (
    <div className="fixed inset-0 z-40 overflow-hidden pointer-events-none">
      <video
        ref={currentVideoRef}
        key={`current-${currentIndex}`}
        autoPlay
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        style={{ 
          opacity: isTransitioning ? 0 : videoOpacity,
          mixBlendMode: 'screen'
        }}
      >
        <source src={videos[currentIndex]} type="video/mp4" />
      </video>
      
      <video
        ref={nextVideoRef}
        key={`next-${nextIndex}`}
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        style={{ 
          opacity: isTransitioning ? videoOpacity : 0,
          mixBlendMode: 'screen'
        }}
      >
        <source src={videos[nextIndex]} type="video/mp4" />
      </video>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
    </div>
  );
}
