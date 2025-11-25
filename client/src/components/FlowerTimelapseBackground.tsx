
import { useEffect, useState, useRef } from 'react';
import video1 from '@/../../attached_assets/Blue-Lily-Blooming-In-Time-Lapse-On-A-Leaves-And-B-4K-2025-08-28-23-03-13-Utc_1764103216691.mp4';
import video2 from '@/../../attached_assets/Red-Hibiscus-Rosa-Sinensis-Time-Lapse-Of-Floral-Bl-4K-2025-08-28-10-27-22-Utc_1764103216692.mp4';
import video3 from '@/../../attached_assets/Time-Lapse-Of-Beautiful-Red-Lily-Flower-Blossoms-2025-08-28-17-19-50-Utc (1)(1)_1764103216692.mp4';
import video4 from '@/../../attached_assets/Time-Lapse-Of-Beautiful-Red-Lily-Flower-Blossoms-2025-08-28-17-35-06-Utc_1764103216692.mp4';
import video5 from '@/../../attached_assets/Time-Lapse-Of-Opening-Gladiolus-Flower-4K-2025-08-28-09-11-59-Utc_1764103216693.mp4';
import video6 from '@/../../attached_assets/White-Flowers-Blossoms-On-The-Branches-Cherry-Tree-4K-2025-08-29-06-24-57-Utc_1764103216693.mp4';
import video7 from '@/../../attached_assets/Yellow-Lily-Blooming-In-Time-Lapse-On-A-Leaves-And-4K-2025-08-29-04-46-46-Utc_1764103216693.mp4';
import video8 from '@/../../attached_assets/Yellow-Lily-Opening-On-Black-Background-4K-2025-08-29-08-44-48-Utc_1764103216693.mp4';
import video9 from '@/../../attached_assets/Polygala Myrtifolia T Obronze_1764103216692.mp4';

const videos = [video1, video2, video3, video4, video5, video6, video7, video8, video9];

interface FlowerTimelapseBackgroundProps {
  intensity?: 'full' | 'subtle' | 'medium';
}

export function FlowerTimelapseBackground({ intensity = 'medium' }: FlowerTimelapseBackgroundProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Map intensity to opacity
  const videoOpacity = intensity === 'full' ? 0.7 : intensity === 'medium' ? 0.35 : 0.15;

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
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-transparent" />
    </div>
  );
}
