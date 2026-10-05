/* SVG coordinates keep pupils attached to the animated character. */
window.setupCharacterEyes = function setupCharacterEyes(svg, isPaused = () => false) {
  if (!svg) return () => {};

  const FRAME_DURATION = 1000 / 60;
  const SMOOTHING = 0.12;
  const IDLE_TIMEOUT = 2500;
  const SETTLE_THRESHOLD = 0.001;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = new AbortController();
  const listenerOptions = { passive: true, signal: listeners.signal };
  const eyes = [...svg.querySelectorAll('[data-eye-pupil]')].map((node) => ({
    node,
    centerX: Number(node.dataset.eyeX),
    centerY: Number(node.dataset.eyeY),
    radius: Number(node.dataset.eyeRadius),
    offsetX: 0,
    offsetY: 0,
  }));

  let pointer = null;
  let lastInputTime = 0;
  let previousFrameTime = 0;
  let animationFrame = 0;
  let destroyed = false;

  function rememberPointer(event) {
    pointer = { x: event.clientX, y: event.clientY };
    lastInputTime = performance.now();
  }

  function clearPointer() {
    pointer = null;
  }

  function renderEye(eye) {
    eye.node.setAttribute(
      'transform',
      `translate(${eye.centerX + eye.offsetX} ${eye.centerY + eye.offsetY})`,
    );
  }

  function resetEyes() {
    clearPointer();
    for (const eye of eyes) {
      eye.offsetX = 0;
      eye.offsetY = 0;
      renderEye(eye);
    }
  }

  function getCursorPosition(now) {
    if (!pointer || now - lastInputTime >= IDLE_TIMEOUT || isPaused()) return null;

    // Read the current transform, including scrolling, rotation and breathing.
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;
    return new DOMPoint(pointer.x, pointer.y).matrixTransform(matrix.inverse());
  }

  function getTargetOffset(eye, cursor) {
    if (!cursor) return { x: 0, y: 0 };

    const deltaX = cursor.x - eye.centerX;
    const deltaY = cursor.y - eye.centerY;
    const angle = Math.atan2(deltaY, deltaX);
    const distance = Math.min(eye.radius, Math.hypot(deltaX, deltaY));
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  }

  function easeOffset(current, target, alpha) {
    const next = current + (target - current) * alpha;
    return Math.abs(target - next) < SETTLE_THRESHOLD ? target : next;
  }

  function animateEyes(now) {
    if (destroyed) return;

    const elapsed = previousFrameTime ? Math.min(now - previousFrameTime, 50) : FRAME_DURATION;
    previousFrameTime = now;
    // Preserve the same feel on 60 Hz and high-refresh-rate displays.
    const alpha = 1 - Math.pow(1 - SMOOTHING, elapsed / FRAME_DURATION);
    const cursor = getCursorPosition(now);

    for (const eye of eyes) {
      const target = getTargetOffset(eye, cursor);
      const nextX = easeOffset(eye.offsetX, target.x, alpha);
      const nextY = easeOffset(eye.offsetY, target.y, alpha);
      // Settled pupils need no further DOM writes.
      if (nextX === eye.offsetX && nextY === eye.offsetY) continue;
      eye.offsetX = nextX;
      eye.offsetY = nextY;
      renderEye(eye);
    }
    animationFrame = requestAnimationFrame(animateEyes);
  }

  function updateAnimationPolicy() {
    cancelAnimationFrame(animationFrame);
    previousFrameTime = 0;
    resetEyes();
    if (!reducedMotion.matches && !document.hidden && !destroyed) {
      animationFrame = requestAnimationFrame(animateEyes);
    }
  }

  // Pointer events handle mouse, pen and touch anywhere on the page.
  window.addEventListener('pointermove', rememberPointer, listenerOptions);
  window.addEventListener('pointerdown', rememberPointer, listenerOptions);
  window.addEventListener(
    'pointerup',
    (event) => {
      if (event.pointerType === 'touch') clearPointer();
    },
    listenerOptions,
  );
  window.addEventListener('pointercancel', clearPointer, listenerOptions);
  window.addEventListener(
    'pointerout',
    (event) => {
      if (!event.relatedTarget) clearPointer();
    },
    listenerOptions,
  );
  window.addEventListener('blur', clearPointer, listenerOptions);
  document.addEventListener('visibilitychange', updateAnimationPolicy, listenerOptions);
  reducedMotion.addEventListener('change', updateAnimationPolicy, {
    signal: listeners.signal,
  });
  updateAnimationPolicy();

  return function cleanupEyes() {
    destroyed = true;
    cancelAnimationFrame(animationFrame);
    listeners.abort();
    resetEyes();
  };
};
