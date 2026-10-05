import assert from 'node:assert/strict';
const media = new EventTarget();
media.matches = false;
const doc = new EventTarget();
doc.hidden = false;
let paused = false;
doc.body = { classList: { contains: () => paused } };
const win = new EventTarget();
const frames = new Map();
let sequence = 0;
globalThis.matchMedia = () => media;
globalThis.document = doc;
globalThis.window = win;
globalThis.requestAnimationFrame = (callback) => {
  frames.set(++sequence, callback);
  return sequence;
};
globalThis.cancelAnimationFrame = (id) => frames.delete(id);
const { createTimeline } = await import('../js/motion.js');
let elapsed = 0;
const timeline = createTimeline((delta) => {
  elapsed += delta;
});
function step(now) {
  const callbacks = [...frames.values()];
  frames.clear();
  callbacks.forEach((fn) => fn(now));
}
timeline.start();
step(100);
step(150);
assert.equal(elapsed, 50);
paused = true;
doc.dispatchEvent(new Event('portfolio-motion-change'));
assert.equal(frames.size, 0);
paused = false;
doc.dispatchEvent(new Event('portfolio-motion-change'));
step(1000);
assert.equal(elapsed, 50);
doc.hidden = true;
doc.dispatchEvent(new Event('visibilitychange'));
assert.equal(frames.size, 0);
doc.hidden = false;
doc.dispatchEvent(new Event('visibilitychange'));
assert.equal(frames.size, 1);
media.matches = true;
media.dispatchEvent(new Event('change'));
assert.equal(frames.size, 0);
media.matches = false;
media.dispatchEvent(new Event('change'));
assert.equal(frames.size, 1);
win.dispatchEvent(new Event('pagehide'));
assert.equal(frames.size, 0);
win.dispatchEvent(new Event('pageshow'));
assert.equal(frames.size, 1);
timeline.destroy();
assert.equal(frames.size, 0);
doc.dispatchEvent(new Event('visibilitychange'));
assert.equal(frames.size, 0);
console.log(
  'PASS: global pause, hidden-page suspension, reduced motion, cached navigation and cleanup.',
);
