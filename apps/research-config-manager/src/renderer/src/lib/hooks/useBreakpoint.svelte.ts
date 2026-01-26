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

  const isMobile = $derived(width < 640);
  const isTablet = $derived(width >= 640 && width < 1024);
  const isDesktop = $derived(width >= 1024);

  return { isMobile, isTablet, isDesktop, width };
}
