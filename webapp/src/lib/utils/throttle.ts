/**
 * Throttles a function to execute at most once per specified delay period.
 *
 * @param func - The function to throttle
 * @param delay - The minimum time between function executions in milliseconds
 * @returns A throttled version of the function
 *
 * @example
 * const handleScroll = throttle(() => {
 *   console.log('Scrolling...');
 * }, 100);
 *
 * window.addEventListener('scroll', handleScroll);
 */
export function throttle<T extends (...args: any[]) => void>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastRan = 0;

    return function(this: any, ...args: Parameters<T>) {
        const now = Date.now();

        if (now - lastRan >= delay) {
            func.apply(this, args);
            lastRan = now;
        } else {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastRan = Date.now();
            }, delay - (now - lastRan));
        }
    };
}
