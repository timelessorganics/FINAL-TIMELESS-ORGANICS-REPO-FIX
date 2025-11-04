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
  const [activeVideo, setActiveVideo] = useState<'A' | 'B'>('A');
  const [videoAIndex, setVideoAIndex] = useState(0);
  const [videoBIndex, setVideoBIndex] = useState(1);
  
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const transitioningRef = useRef(false);
  
  const videoOpacity = intensity === 'full' ? 0.55 : 0.15;

  useEffect(() => {
    const activeRef = activeVideo === 'A' ? videoARef : videoBRef;
    const inactiveRef = activeVideo === 'A' ? videoBRef : videoARef;
    const currentVideo = activeRef.current;
    const nextVideo = inactiveRef.current;
    
    if (!currentVideo || !nextVideo) return;

    const handleTimeUpdate = () => {
      const duration = currentVideo.duration;
      const currentTime = currentVideo.currentTime;
      
      // Start crossfade 2 seconds before end for seamless transition
      if (duration - currentTime <= 2.0 && !transitioningRef.current) {
        transitioningRef.current = true;
        
        // Prepare and play next video
        nextVideo.currentTime = 0;
        nextVideo.play().catch(() => {});
        
        // Swap active video after 1.5 second fade
        setTimeout(() => {
          setActiveVideo(activeVideo === 'A' ? 'B' : 'A');
          
          // Update the index of the video that just became inactive
          if (activeVideo === 'A') {
            setVideoAIndex((videoBIndex + 1) % videos.length);
          } else {
            setVideoBIndex((videoAIndex + 1) % videos.length);
          }
          
          transitioningRef.current = false;
        }, 1500);
      }
    };

    currentVideo.addEventListener('timeupdate', handleTimeUpdate);
    return () => currentVideo.removeEventListener('timeupdate', handleTimeUpdate);
  }, [activeVideo, videoAIndex, videoBIndex]);

  return (
    <div className="fixed inset-0 z-40 overflow-hidden pointer-events-none">
      <video
        ref={videoARef}
        key={`video-a-${videoAIndex}`}
        autoPlay={activeVideo === 'A'}
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          opacity: activeVideo === 'A' ? videoOpacity : 0,
          mixBlendMode: 'screen',
          transition: 'opacity 1.5s ease-in-out'
        }}
      >
        <source src={videos[videoAIndex]} type="video/mp4" />
      </video>
      
      <video
        ref={videoBRef}
        key={`video-b-${videoBIndex}`}
        autoPlay={activeVideo === 'B'}
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          opacity: activeVideo === 'B' ? videoOpacity : 0,
          mixBlendMode: 'screen',
          transition: 'opacity 1.5s ease-in-out'
        }}
      >
        <source src={videos[videoBIndex]} type="video/mp4" />
      </video>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
    </div>
  );
}
