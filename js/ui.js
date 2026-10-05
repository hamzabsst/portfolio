export function announce(message) {
  const status = document.querySelector('#site-status');
  if (status) status.textContent = message;
}

export async function copyEmail() {
  try {
    await navigator.clipboard.writeText(window.portfolioContent.email);
    announce('Email copied to clipboard.');
    return true;
  } catch {
    announce('Copy unavailable. Select the email address or use the email link.');
    return false;
  }
}

export function setupTheme() {
  const button = document.querySelector('[data-theme-toggle]');
  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    button.setAttribute('aria-pressed', String(theme === 'light'));
    button.textContent = theme === 'light' ? 'Dark mode' : 'Light mode';
  }
  apply(document.documentElement.dataset.theme || 'dark');
  button.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    apply(theme);
    try {
      localStorage.setItem('portfolio-theme', theme);
    } catch {
      /* Storage may be disabled. */
    }
  });
}

export function setupPalette() {
  const dialog = document.querySelector('#command-palette');
  const search = dialog.querySelector('input');
  const list = dialog.querySelector('[data-command-results]');
  const commands = [
    { label: 'Selected work', detail: 'Jump to projects', href: '#work' },
    { label: 'Interactive lab', detail: 'Try the browser demos', href: '#lab' },
    { label: 'About Hamza', detail: 'Education and background', href: '#about' },
    { label: 'Technical notes', detail: 'Pipes and Docker secrets', href: '#notes' },
    { label: 'Contact', detail: 'Get in touch', href: '#contact' },
    { label: 'View résumé', detail: 'Open the PDF', href: window.portfolioContent.resume },
    { label: 'Copy email', detail: window.portfolioContent.email, action: copyEmail },
    {
      label: 'LinkedIn',
      detail: 'Open professional profile',
      href: window.portfolioContent.linkedin,
    },
    ...Object.entries(window.portfolioContent.projects).map(([id, project]) => ({
      label: project.name,
      detail: 'Project study',
      href: `projects/${id}.html`,
    })),
  ];
  let matches = [];
  let selected = 0;
  function render() {
    const query = search.value.trim().toLowerCase();
    matches = commands.filter((command) =>
      `${command.label} ${command.detail}`.toLowerCase().includes(query),
    );
    selected = Math.min(selected, Math.max(0, matches.length - 1));
    list.replaceChildren();
    if (!matches.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No matching commands.';
      list.append(empty);
    }
    matches.forEach((command, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'palette-result';
      button.dataset.selected = String(index === selected);
      const name = document.createElement('strong');
      const detail = document.createElement('span');
      name.textContent = command.label;
      detail.textContent = command.detail;
      button.append(name, detail);
      button.addEventListener('click', () => run(command));
      list.append(button);
    });
  }
  function run(command) {
    if (!command) return;
    dialog.close();
    if (command.action) command.action();
    else window.location.assign(command.href);
  }
  function open() {
    if (dialog.open) return dialog.close();
    search.value = '';
    selected = 0;
    render();
    dialog.showModal();
    search.focus();
  }
  document.querySelector('[data-open-palette]').addEventListener('click', open);
  dialog.querySelector('[data-close-palette]').addEventListener('click', () => dialog.close());
  search.addEventListener('input', () => {
    selected = 0;
    render();
  });
  search.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      selected = Math.max(
        0,
        Math.min(matches.length - 1, selected + (event.key === 'ArrowDown' ? 1 : -1)),
      );
      render();
      list.children[selected]?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      run(matches[selected]);
    }
  });
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      open();
    }
  });
}
