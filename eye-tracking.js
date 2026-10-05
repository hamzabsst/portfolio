/* Full eye-tracking controller for the character-component.html SVG. */
window.setupCharacterEyes = function setupCharacterEyes(svg, isPaused = () => false) {
  if (!svg) return () => {};
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const options = {passive: true, signal: controller.signal};
  const eyes = [...svg.querySelectorAll('[data-eye-pupil]')].map(node => ({
    node, cx: Number(node.dataset.eyeX), cy: Number(node.dataset.eyeY),
    radius: Number(node.dataset.eyeRadius), x: 0, y: 0
  }));
  let pointer = null, lastInput = 0, previousFrame = 0, frame = 0, destroyed = false;
  const move = event => {
    pointer = {x: event.clientX, y: event.clientY};
    lastInput = performance.now();
  };
  const center = () => { pointer = null; };
  const reset = () => {
    center();
    eyes.forEach(eye => {
      eye.x = eye.y = 0;
      eye.node.setAttribute('transform', `translate(${eye.cx} ${eye.cy})`);
    });
  };
  const tick = now => {
    if (destroyed) return;
    // Time-adjusted lerp: 0.12 at 60 Hz, consistent at other refresh rates.
    const dt = previousFrame ? Math.min(now - previousFrame, 50) : 1000 / 60;
    previousFrame = now;
    const alpha = 1 - Math.pow(1 - 0.12, dt / (1000 / 60));
    const active = pointer && now - lastInput < 2500 && !isPaused();
    // getScreenCTM includes responsive sizing, scrolling, bobbing and rotations.
    const matrix = svg.getScreenCTM();
    if (matrix) {
      const cursor = active ? new DOMPoint(pointer.x, pointer.y).matrixTransform(matrix.inverse()) : null;
      for (const eye of eyes) {
        let tx = 0, ty = 0;
        if (cursor) {
          const dx = cursor.x - eye.cx, dy = cursor.y - eye.cy;
          const angle = Math.atan2(dy, dx);
          const distance = Math.min(eye.radius, Math.hypot(dx, dy));
          tx = Math.cos(angle) * distance;
          ty = Math.sin(angle) * distance;
        }
        eye.x += (tx - eye.x) * alpha;
        eye.y += (ty - eye.y) * alpha;
        eye.node.setAttribute('transform', `translate(${eye.cx + eye.x} ${eye.cy + eye.y})`);
      }
    }
    frame = requestAnimationFrame(tick);
  };
  const policy = () => {
    cancelAnimationFrame(frame);
    previousFrame = 0;
    reset();
    if (!media.matches && !document.hidden && !destroyed) frame = requestAnimationFrame(tick);
  };
  // Pointer events cover mouse, pen and touch across the entire page.
  window.addEventListener('pointermove', move, options);
  window.addEventListener('pointerdown', move, options);
  window.addEventListener('pointerup', event => { if (event.pointerType === 'touch') center(); }, options);
  window.addEventListener('pointercancel', center, options);
  window.addEventListener('pointerout', event => { if (!event.relatedTarget) center(); }, options);
  window.addEventListener('blur', center, options);
  document.addEventListener('visibilitychange', policy, options);
  media.addEventListener('change', policy, {signal: controller.signal});
  policy();
  return () => {
    destroyed = true;
    cancelAnimationFrame(frame);
    controller.abort();
    reset();
  };
};
