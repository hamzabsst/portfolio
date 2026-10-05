import { createTable, stepTable } from './philosopher-model.js';
import { createTimeline, motionAllowed } from './motion.js';

export function setupPhilosophers() {
  const form = document.querySelector('#philosopher-form');
  const canvas = document.querySelector('#philosopher-canvas');
  const context = canvas.getContext('2d');
  const status = document.querySelector('#philosopher-status');
  const list = document.querySelector('[data-philosopher-states]');
  const play = document.querySelector('[data-philosopher-play]');
  const colors = {
    thinking: '#aaa5b6',
    waiting: '#edbc75',
    eating: '#bb92fa',
    sleeping: '#75cbb1',
    dead: '#ef7e91',
  };
  let table;
  let playing = false;
  let textElapsed = 0;
  let width = 400;
  function stop() {
    playing = false;
    timeline.stop();
    play.textContent = 'Start';
  }
  function draw() {
    if (!table || !context) return;
    context.clearRect(0, 0, width, 280);
    const centerX = width / 2;
    const centerY = 140;
    const radius = Math.min(85, width / 3);
    context.strokeStyle = '#665579';
    context.lineWidth = 2;
    context.beginPath();
    context.arc(centerX, centerY, radius - 22, 0, Math.PI * 2);
    context.stroke();
    table.philosophers.forEach((person) => {
      const angle = (person.id / table.philosophers.length) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      context.fillStyle = colors[person.state];
      context.beginPath();
      context.arc(x, y, 19, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#09080c';
      context.font = 'bold 14px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(String(person.id + 1), x, y);
      const forkAngle = angle + Math.PI / table.philosophers.length;
      context.fillStyle =
        table.forks[(person.id + 1) % table.philosophers.length] === null ? '#7e768c' : '#bb92fa';
      context.fillRect(
        centerX + Math.cos(forkAngle) * radius - 3,
        centerY + Math.sin(forkAngle) * radius - 8,
        6,
        16,
      );
    });
  }
  function describe() {
    list.replaceChildren(
      ...table.philosophers.map((person) => {
        const item = document.createElement('li');
        item.textContent = `P${person.id + 1}: ${person.state} · ${person.meals} meals`;
        return item;
      }),
    );
    status.textContent =
      table.dead === null
        ? `Simulated ${(table.time / 1000).toFixed(1)}s · eating needs two free forks.`
        : `P${table.dead + 1} died at ${(table.time / 1000).toFixed(1)}s. Increase time to die or reduce meal/sleep time.`;
  }
  function advance(delta) {
    stepTable(table, delta);
    draw();
    textElapsed += delta;
    if (textElapsed >= 200 || table.dead !== null) {
      describe();
      textElapsed = 0;
    }
    if (table.dead !== null) stop();
  }
  const timeline = createTimeline((delta) => {
    advance(delta);
    return playing;
  });
  function reset() {
    stop();
    const data = new FormData(form);
    table = createTable(
      Number(data.get('count')),
      Number(data.get('die')),
      Number(data.get('eat')),
      Number(data.get('sleep')),
    );
    textElapsed = 0;
    draw();
    describe();
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    reset();
  });
  play.addEventListener('click', () => {
    if (playing) return stop();
    if (!motionAllowed()) {
      status.textContent = 'Motion is paused. Use Step to advance the simulation.';
      return;
    }
    if (table.dead !== null) reset();
    playing = true;
    play.textContent = 'Pause';
    timeline.start();
  });
  document.querySelector('[data-philosopher-step]').addEventListener('click', () => {
    stop();
    advance(250);
    describe();
  });
  const observer = new ResizeObserver((entries) => {
    width = entries[0].contentRect.width;
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = 280 * scale;
    context?.setTransform(scale, 0, 0, scale, 0, 0);
    draw();
  });
  observer.observe(canvas);
  reset();
}
