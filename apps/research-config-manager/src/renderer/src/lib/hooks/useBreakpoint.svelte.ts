/**
 * Reactive breakpoint hook for responsive design
 * Breakpoints: mobile (<640px), tablet (640-1024px), desktop (>=1024px)
 */
export function useBreakpoint() {
  let width = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);

  $effect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      width = window.innerWidth;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  return {
    get isMobile() {
      return width < 640;
    },
    get isTablet() {
      return width >= 640 && width < 1024;
    },
    get isDesktop() {
      return width >= 1024;
    },
    get width() {
      return width;
    }
  };
}
