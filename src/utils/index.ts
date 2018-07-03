export function debounce(fn: (...args: any[]) => any, time: number) {
  let timeoutId: number | null = null;
  return function(this: any) {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
    const args = arguments;
    timeoutId = window.setTimeout(() => {
      timeoutId = null;
      fn.apply(this, args);
    }, time);
  };
}
