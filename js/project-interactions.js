import { createTimeline, motionAllowed } from './motion.js';

export function setupShellWalkthrough() {
  const command = document.querySelector('[data-shell-command]');
  const stages = [...document.querySelectorAll('[data-shell-stage]')];
  const explanation = document.querySelector('[data-shell-explanation]');
  const button = document.querySelector('[data-run-shell]');
  const text = 'ls -l | grep ".c" > files.txt';
  const messages = [
    'PARSE: two commands, one pipe, one output redirection.',
    'EXPAND: resolve variables and quoted arguments before execution.',
    'EXECUTE: connect stdout to stdin; send the final output to files.txt.',
  ];
  let elapsed = 0;
  let lastStage = -2;
  function render() {
    command.textContent = text.slice(
      0,
      Math.min(text.length, Math.floor(elapsed / 35)),
    );
    const stage = Math.min(2, Math.floor((elapsed - 1100) / 900));
    if (stage !== lastStage) {
      lastStage = stage;
      stages.forEach((node, index) => {
        node.dataset.active = String(index === stage);
      });
      explanation.textContent =
        stage >= 0 ? messages[stage] : 'Typing a sample pipeline…';
    }
  }
  const timeline = createTimeline((delta) => {
    elapsed += delta;
    render();
    if (elapsed >= 3800) {
      return false;
    }
  });
  button.addEventListener('click', () => {
    timeline.stop();
    elapsed = motionAllowed() ? 0 : 3800;
    lastStage = -2;
    render();
    if (motionAllowed()) {
      timeline.start();
    }
  });
}
