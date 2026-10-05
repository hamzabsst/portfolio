import { copyEmail } from './ui.js';
import { setupIrcDemo } from './irc-demo.js';
import { setupStackDemo } from './stack-demo.js';
import { setupPhilosophers } from './philosophers-demo.js';

setupIrcDemo();
setupStackDemo();
setupPhilosophers();

document
  .querySelector('[data-copy-email]')
  .addEventListener('click', copyEmail);
