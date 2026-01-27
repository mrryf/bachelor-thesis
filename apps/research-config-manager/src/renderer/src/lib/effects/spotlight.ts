/**
 * Spotlight effect - follows mouse position with a radial gradient
 * Only active on desktop (disabled on mobile/touch devices)
 */

export function spotlight(node: HTMLElement) {
  // Check if device supports hover (desktop only)
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  if (!supportsHover) return;

  const overlay = node.querySelector('.spotlight-overlay') as HTMLElement;
  if (!overlay) return;

  let rafId: number | null = null;

  const handleMouseMove = (e: MouseEvent) => {
    // Throttle with requestAnimationFrame for 60fps
    if (rafId !== null) return;

    rafId = requestAnimationFrame(() => {
      const rect = node.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      node.style.setProperty('--mouse-x', `${x}px`);
      node.style.setProperty('--mouse-y', `${y}px`);

      rafId = null;
    });
  };

  const handleMouseEnter = () => {
    overlay.style.opacity = '1';
  };

  const handleMouseLeave = () => {
    overlay.style.opacity = '0';
  };

  node.addEventListener('mousemove', handleMouseMove);
  node.addEventListener('mouseenter', handleMouseEnter);
  node.addEventListener('mouseleave', handleMouseLeave);

  return {
    destroy() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      node.removeEventListener('mousemove', handleMouseMove);
      node.removeEventListener('mouseenter', handleMouseEnter);
      node.removeEventListener('mouseleave', handleMouseLeave);
    }
  };
}
