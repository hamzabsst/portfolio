import { matchesProject } from './project-search.js';

export function setupProjectExplorer(root) {
  if (!root) return;

  const input = root.querySelector('#project-search');
  const controls = root.querySelector('[data-explorer-controls]');
  const count = root.querySelector('[data-project-count]');
  const empty = root.querySelector('[data-project-empty]');
  const reset = root.querySelector('[data-project-reset]');
  const filters = [...root.querySelectorAll('[data-project-filter]')];
  const entries = [...root.querySelectorAll('[data-project-entry]')].map(
    (element) => {
      const description = element.querySelector('.explorer-project').textContent;
      const technology = element.querySelector('.explorer-tech').textContent;
      return {
        element,
        topics: element.dataset.topics.split(/\s+/),
        text: `${description} ${technology} ${element.dataset.keywords}`,
      };
    },
  );
  let topic = 'all';

  function update() {
    let visible = 0;
    entries.forEach((entry) => {
      const matches = matchesProject(entry, input.value, topic);
      entry.element.hidden = !matches;
      if (matches) visible++;
    });
    filters.forEach((button) => {
      button.setAttribute(
        'aria-pressed',
        String(button.dataset.projectFilter === topic),
      );
    });
    const selected = filters.find(
      (button) => button.dataset.projectFilter === topic,
    );
    const topicLabel = topic === 'all' ? '' : ` · ${selected.textContent}`;
    count.textContent = `${visible} of ${entries.length} projects${topicLabel}`;
    empty.hidden = visible !== 0;
    reset.hidden = topic === 'all' && input.value.length === 0;
  }

  input.addEventListener('input', update);
  // Some browsers emit a search event when their native clear button is used.
  input.addEventListener('search', update);
  filters.forEach((button) => {
    button.addEventListener('click', () => {
      topic = button.dataset.projectFilter;
      update();
    });
  });
  reset.addEventListener('click', () => {
    input.value = '';
    topic = 'all';
    update();
    input.focus();
  });

  update();
  controls.hidden = false;
}

setupProjectExplorer(document.querySelector('[data-project-explorer]'));
