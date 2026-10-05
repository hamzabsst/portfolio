import assert from 'node:assert/strict';
const status = { textContent: '' };
const container = {
  replaceChildren() {
    assert.fail('Fallback links must survive a failed request');
  },
};
globalThis.document = {
  querySelector: (selector) => (selector === '[data-github-status]' ? status : container),
};
globalThis.fetch = async () => ({ ok: false, status: 429 });
const { setupGitHubActivity } = await import('../js/github.js');
await setupGitHubActivity();
assert.match(status.textContent, /unavailable/);
globalThis.fetch = async () => {
  throw new TypeError('Network offline');
};
await setupGitHubActivity();
assert.match(status.textContent, /unavailable/);
console.log('PASS: GitHub rate-limit and offline fallbacks preserve static links.');
