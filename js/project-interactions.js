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

export function setupArchitecture() {
  const services = window.portfolioContent.services;
  const buttons = [...document.querySelectorAll('[data-service]')];
  const title = document.querySelector('[data-service-title]');
  const details = document.querySelector('[data-service-details]');
  const code = document.querySelector('[data-service-code]');
  const source = document.querySelector('[data-service-source]');
  const status = document.querySelector('[data-request-status]');
  const run = document.querySelector('[data-run-request]');
  let elapsed = 0;
  let lastStep = -1;
  function select(id) {
    const service = services[id];
    buttons.forEach((button) =>
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.service === id),
      ),
    );
    title.textContent = service.name;
    details.textContent = service.details;
    code.textContent = service.snippet;
    source.href = service.source;
  }
  buttons.forEach((button) =>
    button.addEventListener('click', () => select(button.dataset.service)),
  );
  select('nginx');
  const messages = [
    '443 → NGINX: terminate TLS and route the request.',
    '9000 → PHP-FPM: execute WordPress PHP.',
    '3306 → MariaDB: read application data.',
    'Response returns through PHP-FPM and NGINX.',
  ];
  const timeline = createTimeline((delta) => {
    elapsed += delta;
    const step = Math.min(3, Math.floor(elapsed / 700));
    if (step !== lastStep) {
      lastStep = step;
      buttons.forEach((button, index) => {
        button.dataset.flow = String(index === step);
      });
      status.textContent = messages[step];
    }
    if (elapsed >= 2800) {
      return false;
    }
  });
  run.addEventListener('click', () => {
    timeline.stop();
    lastStep = -1;
    elapsed = 0;
    if (motionAllowed()) {
      timeline.start();
    } else status.textContent = messages.join(' ');
  });
}
