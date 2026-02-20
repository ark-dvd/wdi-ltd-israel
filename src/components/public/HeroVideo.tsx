'use client';

/**
 * Hero video background — ORIGINAL_DESIGN_SPEC §4, DOC-070 §3.1
 * Autoplay muted loop, 50% opacity. Falls back to gradient if no video.
 */

interface HeroVideoProps {
  videoUrl?: string | null;
}

export function HeroVideo({ videoUrl }: HeroVideoProps) {
  if (!videoUrl) return null;

  return (
    <video
      className="hero-video"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    >
      <source src={videoUrl} type="video/mp4" />
    </video>
  );
}
