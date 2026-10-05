import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

class Element extends EventTarget {
  constructor() {
    super();
    this.attributes = new Map();
    this.properties = new Map();
    this.classes = new Set();
    this.style = {
      setProperty: (name, value) => this.properties.set(name, value),
    };
    this.classList = {
      toggle: (name, enabled) =>
        enabled ? this.classes.add(name) : this.classes.delete(name),
      contains: (name) => this.classes.has(name),
    };
  }
  append(child) {
    child.parentElement = this;
  }
  setAttribute(name, value) {
    this.attributes.set(name, value);
  }
  removeAttribute(name) {
    if (name === 'style') this.properties.clear();
    else this.attributes.delete(name);
  }
}
const story = new Element();
const hero = new Element();
const layout = new Element();
const about = new Element();
const role = new Element();
const cue = new Element();
cue.lastChild = { textContent: '' };
const doc = new Element();
doc.hidden = false;
doc.body = new Element();
doc.querySelector = () => story;
doc.getElementById = () => about;
story.querySelector = () => hero;
hero.querySelector = (selector) =>
  ({
    '.hero-layout': layout,
    '.hero-role': role,
    '.scroll-cue': cue,
  })[selector];
story.append(about);
const desktop = new EventTarget();
desktop.matches = true;
const reduced = new EventTarget();
reduced.matches = false;
const win = new EventTarget();
const frames = new Map();
let frameId = 0;
const context = vm.createContext({
  document: doc,
  window: win,
  AbortController,
  innerHeight: 900,
  scrollY: 0,
  location: { hash: '' },
  history: { pushState: (_, __, hash) => (context.location.hash = hash) },
  matchMedia: (query) => (query.includes('min-width') ? desktop : reduced),
  requestAnimationFrame: (fn) => {
    frames.set(++frameId, fn);
    return frameId;
  },
  cancelAnimationFrame: (id) => frames.delete(id),
  scrollTo: ({ top }) => {
    context.scrollY = top;
    win.dispatchEvent(new Event('scroll'));
  },
});
story.getBoundingClientRect = () => ({ top: -context.scrollY });
vm.runInContext(
  readFileSync(new URL('../intro-story.js', import.meta.url), 'utf8'),
  context,
);
function settle() {
  for (let i = 1; frames.size && i < 200; i++) {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((fn) => fn(i * 17));
  }
  assert.equal(frames.size, 0, 'Animation should stop when settled');
}
settle();
assert.equal(about.parentElement, layout);
assert.equal(about.inert, true, 'Hidden About links must not receive focus');
const click = new Event('click', { cancelable: true });
Object.defineProperty(click, 'target', {
  value: { closest: () => ({ href: '#about' }) },
});
doc.dispatchEvent(click);
settle();
assert.equal(context.scrollY, 900);
assert.equal(story.properties.get('--scene-progress'), 1);
assert.equal(about.inert, false);
assert.equal(role.inert, true);
assert.equal(cue.href, '#work');

// Reduced motion restores readable, keyboard-accessible document flow.
reduced.matches = true;
reduced.dispatchEvent(new Event('change'));
assert.equal(about.parentElement, story);
assert.equal(story.classes.has('story-active'), false);
assert.equal(about.inert, false);
assert.equal(role.inert, false);
assert.equal(about.attributes.has('aria-hidden'), false);
reduced.matches = false;
desktop.matches = false;
reduced.dispatchEvent(new Event('change'));
assert.equal(
  about.parentElement,
  story,
  'Mobile must use normal section order',
);
console.log(
  'PASS: About navigation, settled frames, focus visibility and reduced-motion/mobile fallback.',
);
