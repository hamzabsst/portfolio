import { parseNumbers, buildStackTrace } from './stack-model.js';
import { createTimeline, motionAllowed } from './motion.js';

export function setupStackDemo() {
  const form = document.querySelector('#stack-form');
  const input = form.querySelector('input');
  const status = document.querySelector('#stack-status');
  const stacks = [
    document.querySelector('[data-stack="a"]'),
    document.querySelector('[data-stack="b"]'),
  ];
  const step = document.querySelector('[data-stack-step]');
  const play = document.querySelector('[data-stack-play]');
  const reset = document.querySelector('[data-stack-reset]');
  let frames = [];
  let index = 0;
  let elapsed = 0;
  let playing = false;
  let ranks = [];
  function stop() {
    timeline.stop();
    playing = false;
    play.textContent = 'Play';
  }
  function render() {
    const frame = frames[index];
    if (!frame) return;
    [frame.a, frame.b].forEach((values, stackIndex) => {
      const nodes = values.map((value) => {
        const node = document.createElement('div');
        node.className = 'stack-bar';
        node.style.setProperty(
          '--bar-width',
          `${25 + (75 * (ranks.indexOf(value) + 1)) / ranks.length}%`,
        );
        node.textContent = String(value);
        return node;
      });
      if (!nodes.length) {
        const empty = document.createElement('span');
        empty.className = 'muted';
        empty.textContent = 'empty';
        nodes.push(empty);
      }
      stacks[stackIndex].replaceChildren(...nodes);
    });
    status.textContent = `${index} / ${frames.length - 1} moves · ${frame.operation}${index === frames.length - 1 ? ' · sorted ✓' : ''}`;
    step.disabled = index === frames.length - 1;
  }
  function advance() {
    if (index < frames.length - 1) index++;
    render();
    if (index === frames.length - 1) stop();
  }
  const timeline = createTimeline((delta) => {
    elapsed += delta;
    if (elapsed >= 180) {
      elapsed = 0;
      advance();
    }
    return playing;
  });
  function load() {
    stop();
    try {
      const values = parseNumbers(input.value);
      ranks = [...values].sort((a, b) => a - b);
      frames = buildStackTrace(values);
      index = 0;
      input.setAttribute('aria-invalid', 'false');
      play.disabled = false;
      render();
      return true;
    } catch (error) {
      input.setAttribute('aria-invalid', 'true');
      play.disabled = true;
      step.disabled = true;
      status.textContent = error.message;
      return false;
    }
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (load() && motionAllowed()) {
      playing = true;
      play.textContent = 'Pause';
      elapsed = 0;
      timeline.start();
    }
  });
  step.addEventListener('click', () => {
    stop();
    advance();
  });
  play.addEventListener('click', () => {
    if (playing) return stop();
    if (!motionAllowed()) {
      status.textContent =
        'Motion is paused. Use Step, or enable motion to play.';
      return;
    }
    if (index >= frames.length - 1) index = 0;
    render();
    playing = true;
    play.textContent = 'Pause';
    elapsed = 0;
    timeline.start();
  });
  reset.addEventListener('click', load);
  load();
}
