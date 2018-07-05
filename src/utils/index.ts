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

export function formatDateTime(d: Date) {
  const datestring =
    d.getFullYear() +
    '-' +
    ('0' + (d.getMonth() + 1)).slice(-2) +
    '-' +
    ('0' + d.getDate()).slice(-2) +
    ' ' +
    ('0' + d.getHours()).slice(-2) +
    ':' +
    ('0' + d.getMinutes()).slice(-2);
  return datestring;
}
