import { copyEmail } from './ui.js';
import { setupShellWalkthrough, setupArchitecture } from './project-interactions.js';
import { setupStackDemo } from './stack-demo.js';
import { setupPhilosophers } from './philosophers-demo.js';

setupShellWalkthrough();
setupArchitecture();
setupStackDemo();
setupPhilosophers();

document.querySelector('[data-copy-email]').addEventListener('click', copyEmail);
