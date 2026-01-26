/**
 * Ripple click effect using GSAP
 * Provides visual feedback on click/tap interactions
 * Works on both desktop and mobile
 */

import { gsap } from 'gsap';

export function ripple(node: HTMLElement) {
  // Respect user's motion preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const handleClick = (e: MouseEvent | TouchEvent) => {
    // Get click/touch position
    const rect = node.getBoundingClientRect();
    let x: number, y: number;

    if (e instanceof MouseEvent) {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    } else {
      // Touch event
      const touch = e.touches[0] || e.changedTouches[0];
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    }

    // Create ripple element
    const rippleEl = document.createElement('div');
    rippleEl.style.cssText = `
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(132, 0, 255, 0.5);
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
      z-index: 1000;
      transform: translate(-50%, -50%);
    `;

    node.appendChild(rippleEl);

    // Animate ripple with GSAP
    gsap.fromTo(
      rippleEl,
      { scale: 0, opacity: 1 },
      {
        scale: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: () => {
          rippleEl.remove();
        }
      }
    );
  };

  // Support both mouse and touch events
  node.addEventListener('click', handleClick);
  node.addEventListener('touchstart', handleClick as EventListener, { passive: true });

  return {
    destroy() {
      node.removeEventListener('click', handleClick);
      node.removeEventListener('touchstart', handleClick as EventListener);
    }
  };
}
