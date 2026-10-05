import { setupTheme, setupPalette, copyEmail } from './ui.js';
import { setupTerminal } from './terminal.js';
import { setupShellWalkthrough, setupArchitecture } from './project-interactions.js';
import { setupStackDemo } from './stack-demo.js';
import { setupPhilosophers } from './philosophers-demo.js';
import { setupGitHubActivity } from './github.js';

setupTheme();
setupPalette();
setupTerminal();
setupShellWalkthrough();
setupArchitecture();
setupStackDemo();
setupPhilosophers();
setupGitHubActivity();
document.querySelector('[data-copy-email]').addEventListener('click', copyEmail);
