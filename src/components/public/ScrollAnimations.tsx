'use client';

/**
 * Scroll animation observer — ORIGINAL_DESIGN_SPEC §15
 * Adds .visible class to .animate-on-scroll elements when they enter viewport.
 * threshold: 0.1, rootMargin: '0px 0px -50px 0px'
 */
import { useEffect } from 'react';

export function ScrollAnimations() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => {
      el.classList.add('scroll-ready');
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
