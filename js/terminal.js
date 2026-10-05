export function setupTerminal() {
  const form = document.querySelector('#hero-terminal-form');
  const input = form.querySelector('input');
  const output = document.querySelector('#hero-terminal-output');
  const history = [];
  const commands = ['help', 'whoami', 'ls projects/', 'cat resume', 'contact', 'clear'];
  let historyIndex = 0;
  let draft = '';

  function write(text, href) {
    const line = document.createElement('div');
    if (href) {
      const link = document.createElement('a');
      link.textContent = text;
      link.href = href;
      line.append(link);
    } else line.textContent = text;
    output.append(line);
    while (output.children.length > 40) output.firstElementChild.remove();
    output.scrollTop = output.scrollHeight;
  }
  function execute(raw) {
    const command = raw.trim().replace(/\s+/g, ' ').toLowerCase();
    if (!command) return;
    history.push(raw.trim());
    if (history.length > 50) history.shift();
    historyIndex = history.length;
    draft = '';
    write(`hamza $ ${raw.trim()}`);
    switch (command) {
      case 'help':
        write('whoami · ls projects/ · cat resume · contact · clear');
        write('↑ / ↓ history · Tab autocomplete');
        break;
      case 'whoami':
        write('Hamza Boussetta — software engineering student at 1337.');
        write('C/C++ · Unix systems · Docker. Seeking roles and internships.');
        break;
      case 'ls projects':
      case 'ls projects/':
        Object.entries(window.portfolioContent.projects).forEach(([id, project]) => {
          write(`${project.name}/`, `projects/${id}.html`);
        });
        break;
      case 'cat resume':
      case 'cat résumé':
        write('Open résumé PDF ↗', window.portfolioContent.resume);
        break;
      case 'contact':
        write(window.portfolioContent.email, `mailto:${window.portfolioContent.email}`);
        write('LinkedIn ↗', window.portfolioContent.linkedin);
        break;
      case 'clear':
        output.replaceChildren();
        break;
      default:
        write(`Command not found: ${raw.trim()}. Try help.`);
    }
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    execute(input.value);
    input.value = '';
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex === history.length) draft = input.value;
      historyIndex = Math.max(
        0,
        Math.min(history.length, historyIndex + (event.key === 'ArrowUp' ? -1 : 1)),
      );
      input.value = historyIndex === history.length ? draft : history[historyIndex];
    } else if (event.key === 'Tab') {
      const match = commands.filter((command) =>
        command.startsWith(input.value.trim().toLowerCase()),
      );
      if (match.length === 1) {
        event.preventDefault();
        input.value = match[0];
      }
    }
  });
  document.querySelectorAll('[data-terminal-command]').forEach((button) => {
    button.addEventListener('click', () => {
      execute(button.dataset.terminalCommand);
      input.focus();
    });
  });
}
