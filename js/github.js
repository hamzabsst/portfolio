// Public data only. No token is shipped to the browser; failures keep static links usable.
export async function setupGitHubActivity() {
  const container = document.querySelector('[data-github-activity]');
  const status = document.querySelector('[data-github-status]');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(
      'https://api.github.com/users/hamzabsst/repos?sort=pushed&per_page=100',
      { signal: controller.signal },
    );
    if (!response.ok) throw new Error('GitHub unavailable');
    const repositories = await response.json();
    const names = new Set(Object.keys(window.portfolioContent.projects));
    names.delete('cub3d');
    names.add('cub3D');
    const selected = repositories.filter((repo) => names.has(repo.name)).slice(0, 4);
    if (!selected.length) throw new Error('No repository data');
    const nodes = selected.map((repo) => {
      const article = document.createElement('article');
      const link = document.createElement('a');
      const meta = document.createElement('p');
      const language = document.createElement('span');
      link.textContent = repo.name;
      link.href = `https://github.com/hamzabsst/${encodeURIComponent(repo.name)}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const date = new Date(repo.pushed_at);
      meta.textContent = Number.isNaN(date.getTime())
        ? 'View repository'
        : `Last push ${date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`;
      language.textContent = `${repo.language || 'Source'} · ${repo.stargazers_count} ${repo.stargazers_count === 1 ? 'star' : 'stars'}`;
      article.append(link, meta, language);
      return article;
    });
    container.replaceChildren(...nodes);
    status.textContent = 'Public repository activity · refreshed when this page opens.';
  } catch {
    status.textContent = 'Live activity is unavailable right now. Explore the repositories below.';
  } finally {
    clearTimeout(timeout);
  }
}
