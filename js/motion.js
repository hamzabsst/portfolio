// A single policy for every interactive animation: pause, visibility and reduced motion.
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
export function motionAllowed() {
  return (
    !reducedMotion.matches &&
    !document.hidden &&
    !document.body.classList.contains('motion-paused')
  );
}

export function createTimeline(update) {
  let running = false;
  let frame = 0;
  let previous = 0;
  function tick(now) {
    frame = 0;
    if (!running || !motionAllowed()) return;
    const elapsed = previous ? Math.min(now - previous, 100) : 0;
    previous = now;
    if (update(elapsed) === false) {
      running = false;
      return;
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    if (running && motionAllowed()) frame = requestAnimationFrame(tick);
  }
  const controller = new AbortController();
  const options = { signal: controller.signal };
  document.addEventListener('portfolio-motion-change', sync, options);
  document.addEventListener('visibilitychange', sync, options);
  reducedMotion.addEventListener('change', sync, options);
  window.addEventListener(
    'pagehide',
    () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
    },
    options,
  );
  window.addEventListener('pageshow', sync, options);
  return {
    start() {
      running = true;
      sync();
    },
    stop() {
      running = false;
      sync();
    },
    destroy() {
      running = false;
      sync();
      controller.abort();
    },
  };
}
