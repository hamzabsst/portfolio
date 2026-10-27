import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const asModule = (source) =>
  `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const searchModule = asModule(read('../js/project-search.js'));
const { matchesProject } = await import(searchModule);
const html = read('../index.html');
const text = (markup) => markup.replace(/<[^>]*>/g, '');
const attribute = (markup, name) =>
  markup.match(new RegExp(`${name}="([^"]*)"`))?.[1];

// Use the actual index so a new label, keyword or broken anchor is exercised.
const projects = [...html.matchAll(/<li\b([^>]*\bdata-project-entry\b[^>]*)>([\s\S]*?)<\/li>/g)].map(
  ([, attributes, body]) => {
    const project = body.match(/<span class="explorer-project">([\s\S]*?)<\/span>\s*<\/span>/)?.[1];
    const tech = body.match(/<span class="explorer-tech">([\s\S]*?)<\/span>/)?.[1];
    assert.ok(project && tech, 'Each indexed project needs a name and technologies');
    return {
      name: text(body.match(/<strong>([\s\S]*?)<\/strong>/)[1]),
      topics: attribute(attributes, 'data-topics').split(/\s+/),
      keywords: attribute(attributes, 'data-keywords'),
      projectText: text(project),
      techText: text(tech),
      text: `${text(project)} ${text(tech)} ${attribute(attributes, 'data-keywords')}`,
      href: attribute(body, 'href'),
      hidden: /\bhidden\b/.test(attributes),
    };
  },
);
assert.equal(projects.length, 5, 'The index exposes all five existing projects');
const allNames = ['LeakLens', 'Afterglow', 'ft_irc', 'push_swap', 'philosophers'];
assert.deepEqual(projects.map((project) => project.name), allNames);
for (const project of projects) {
  assert.equal(project.hidden, false, 'Project links work without JavaScript');
  assert.ok(project.href.startsWith('#'), 'Index links lead into this portfolio');
  assert.ok(html.includes(`id="${project.href.slice(1)}"`), `${project.name} has an existing destination`);
}

const find = (query, topic = 'all') =>
  projects.filter((project) => matchesProject(project, query, topic)).map((project) => project.name);
assert.deepEqual(find(''), allNames);
assert.deepEqual(find('   '), allNames);
assert.deepEqual(find('  rEaCt  '), ['Afterglow']);
assert.deepEqual(find('C'), ['push_swap', 'philosophers']);
assert.deepEqual(find('C++'), ['ft_irc']);
assert.deepEqual(find('cpp'), ['ft_irc']);
assert.deepEqual(find('push swap'), ['push_swap']);
assert.deepEqual(find('push_swap'), ['push_swap']);
assert.deepEqual(find('node.js'), ['Afterglow']);
assert.deepEqual(find('socket.io'), ['Afterglow']);
assert.deepEqual(find('synchronized'), ['Afterglow']);
assert.deepEqual(find('make'), ['LeakLens']);
assert.deepEqual(find('follow'), ['ft_irc']);
assert.deepEqual(find('explore'), ['push_swap']);
assert.deepEqual(find('see'), ['philosophers']);
assert.deepEqual(find('memory valgrind'), ['LeakLens']);
assert.deepEqual(find('threads mutex'), ['philosophers']);
assert.deepEqual(find('React memory'), [], 'Every search term must match the same project');
assert.deepEqual(find('', 'systems'), ['ft_irc', 'push_swap', 'philosophers']);
assert.deepEqual(find('', 'web'), ['LeakLens', 'Afterglow']);
assert.deepEqual(find('', 'tools'), ['LeakLens']);
assert.deepEqual(find('memory', 'tools'), ['LeakLens']);
assert.deepEqual(find('React', 'systems'), [], 'Search and topic filters intersect');
assert.deepEqual(find('does-not-exist'), []);
assert.deepEqual(find('<script>alert(1)</script>'), []);

class Element extends EventTarget {
  constructor(properties = {}) {
    super();
    this.hidden = false;
    this.value = '';
    this.textContent = '';
    this.dataset = {};
    this.attributes = new Map();
    this.focused = false;
    Object.assign(this, properties);
  }
  setAttribute(name, value) {
    this.attributes.set(name, value);
  }
  focus() {
    this.focused = true;
  }
  click() {
    this.dispatchEvent(new Event('click'));
  }
}

const input = new Element();
const controls = new Element({ hidden: true });
const count = new Element();
const empty = new Element({ hidden: true });
const reset = new Element({ hidden: true });
const filters = ['all', 'web', 'systems', 'tools'].map((topic, index) =>
  new Element({
    dataset: { projectFilter: topic },
    textContent: ['All work', 'Web', 'Systems', 'Developer tools'][index],
  }),
);
const entries = projects.map((project) => {
  const element = new Element({
    dataset: { topics: project.topics.join(' '), keywords: project.keywords },
    name: project.name,
  });
  element.querySelector = (selector) => ({
    '.explorer-project': { textContent: project.projectText },
    '.explorer-tech': { textContent: project.techText },
  })[selector];
  return element;
});
const root = {
  querySelector: (selector) => ({
    '#project-search': input,
    '[data-explorer-controls]': controls,
    '[data-project-count]': count,
    '[data-project-empty]': empty,
    '[data-project-reset]': reset,
  })[selector],
  querySelectorAll: (selector) => ({
    '[data-project-filter]': filters,
    '[data-project-entry]': entries,
  })[selector],
};

// Import the real controller with only its browser document entry point stubbed.
const previousDocument = globalThis.document;
globalThis.document = { querySelector: () => null };
let setupProjectExplorer;
try {
  ({ setupProjectExplorer } = await import(asModule(
    read('../js/project-explorer.js').replace("'./project-search.js'", JSON.stringify(searchModule)),
  )));
} finally {
  if (previousDocument === undefined) delete globalThis.document;
  else globalThis.document = previousDocument;
}
assert.doesNotThrow(() => setupProjectExplorer(null));
setupProjectExplorer(root);
const visibleNames = () => entries.filter((entry) => !entry.hidden).map((entry) => entry.name);
const selected = () => filters.filter((button) => button.attributes.get('aria-pressed') === 'true');
const type = (value, event = 'input') => {
  input.value = value;
  input.dispatchEvent(new Event(event));
};
assert.equal(controls.hidden, false, 'Enhancement makes working controls available');
assert.deepEqual(visibleNames(), allNames);
assert.match(count.textContent, /^5 of 5 projects/);
assert.equal(empty.hidden, true);
assert.equal(reset.hidden, true);
assert.deepEqual(selected(), [filters[0]]);

filters[2].click();
assert.deepEqual(visibleNames(), ['ft_irc', 'push_swap', 'philosophers']);
assert.deepEqual(selected(), [filters[2]], 'Exactly one filter is announced as selected');
assert.match(count.textContent, /^3 of 5 projects/);
assert.equal(reset.hidden, false);
type('C++');
assert.deepEqual(visibleNames(), ['ft_irc']);
assert.match(count.textContent, /^1 of 5 projects/);
type('React');
assert.deepEqual(visibleNames(), []);
assert.equal(empty.hidden, false);
assert.match(count.textContent, /^0 of 5 projects/);

filters[1].click();
assert.deepEqual(visibleNames(), ['Afterglow'], 'Changing topic preserves the search text');
assert.equal(input.value, 'React');
assert.equal(empty.hidden, true);
type('', 'search');
assert.deepEqual(visibleNames(), ['LeakLens', 'Afterglow'], 'Native search clearing preserves the topic');
assert.equal(reset.hidden, false);
type('unmatched');
reset.click();
assert.equal(input.value, '');
assert.deepEqual(visibleNames(), allNames);
assert.deepEqual(selected(), [filters[0]]);
assert.equal(reset.hidden, true);
assert.equal(empty.hidden, true);
assert.equal(input.focused, true, 'Reset returns keyboard focus to the search field');
assert.match(count.textContent, /^5 of 5 projects/);
type('synchronized');
assert.deepEqual(visibleNames(), ['Afterglow'], 'The first description word stays separate from the project name');
type('memory');
assert.deepEqual(visibleNames(), ['LeakLens']);
type('');
assert.deepEqual(visibleNames(), allNames, 'Ordinary input clearing also restores the results');
assert.equal(reset.hidden, true);

console.log('PASS: Project search, topic intersections, native clear, reset focus, accessible state and static destinations.');
