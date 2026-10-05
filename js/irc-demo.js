import { createTimeline, motionAllowed } from './motion.js';
import { routeChannelMessage } from './irc-model.js';

export function setupIrcDemo() {
  const form = document.getElementById('irc-form');
  const sender = document.getElementById('irc-sender');
  const input = document.getElementById('irc-message');
  const wire = document.querySelector('[data-irc-wire]');
  const status = document.querySelector('[data-irc-status]');
  const connection = document.querySelector('[data-irc-connection]');
  const connect = document.querySelector('[data-irc-connect]');
  const steps = [
    'PASS: supply the server password.',
    'NICK: choose a unique nickname.',
    'USER: complete registration with a username.',
    'JOIN #systems: become a channel member. Ready to chat.',
  ];
  let elapsed = 0;
  let lastStep = -1;

  function appendMessage(client, message, local) {
    const list = document.querySelector(`[data-irc-client="${client}"]`);
    const item = document.createElement('li');
    const name = document.createElement('strong');
    name.textContent = local ? 'you' : message.sender;
    item.append(name, document.createTextNode(message.text));
    item.classList.toggle('irc-local', local);
    list.append(item);
    // Keep the demo bounded even if a visitor sends many messages.
    while (list.children.length > 20) list.firstElementChild.remove();
    list.scrollTop = list.scrollHeight;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      const message = routeChannelMessage(sender.value, input.value);
      appendMessage(message.sender, message, true);
      appendMessage(message.recipient, message, false);
      const visible = (line) => line.replace(/\r\n/g, '\\r\\n');
      wire.textContent = [
        `${message.sender} → server`,
        visible(message.outgoing),
        '',
        `server → ${message.recipient}`,
        visible(message.incoming),
      ].join('\n');
      status.textContent =
        `Delivered to ${message.recipient}. The sender displays a local copy; ` +
        'the server broadcasts to the other channel members.';
      input.value = '';
      input.focus();
    } catch (error) {
      status.textContent = error.message;
    }
  });

  const timeline = createTimeline((delta) => {
    elapsed += delta;
    const step = Math.min(3, Math.floor(elapsed / 900));
    if (step !== lastStep) {
      connection.textContent = steps[step];
      lastStep = step;
    }
    return elapsed < 3600;
  });
  connect.addEventListener('click', () => {
    timeline.stop();
    elapsed = 0;
    lastStep = -1;
    if (motionAllowed()) timeline.start();
    else connection.textContent = steps.join(' ');
  });
}
