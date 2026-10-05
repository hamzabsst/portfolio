(() => {
  const story = document.querySelector('.intro-story');
  const hero = story.querySelector('.hero');
  const layout = hero.querySelector('.hero-layout');
  const about = document.getElementById('about');
  const role = hero.querySelector('.hero-role');
  const cue = hero.querySelector('.scroll-cue');
  const desktop = matchMedia('(min-width: 1000px) and (min-height: 720px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false;
  let current = 0;
  let target = 0;
  let frame = 0;
  let previousTime = 0;

  const clamp = (value) => Math.max(0, Math.min(1, value));

  function render(progress) {
    const eased = progress * progress * (3 - 2 * progress);
    const introOpacity = clamp(1 - eased * 2.4);
    const aboutOpacity = clamp((eased - 0.3) / 0.55);
    story.style.setProperty('--scene-progress', eased);
    story.style.setProperty('--intro-opacity', introOpacity);
    story.style.setProperty('--about-opacity', aboutOpacity);
    about.inert = aboutOpacity < 0.95;
    role.inert = introOpacity < 0.2;
    about.setAttribute('aria-hidden', String(aboutOpacity < 0.1));
    const inAbout = eased > 0.6;
    cue.href = inAbout ? '#work' : '#about';
    cue.lastChild.textContent = inAbout ? 'EXPLORE MY WORK' : 'SCROLL TO ABOUT';
  }

  function tick(now) {
    frame = 0;
    if (!active || document.hidden) return;
    const elapsed = previousTime ? Math.min(now - previousTime, 50) : 16.67;
    previousTime = now;
    const paused = document.body.classList.contains('motion-paused');
    const alpha = 1 - Math.pow(0.86, elapsed / 16.67);
    current = paused
      ? target > 0.5
        ? 1
        : 0
      : current + (target - current) * alpha;
    if (Math.abs(target - current) < 0.001) current = target;
    render(current);
    if (!paused && current !== target) frame = requestAnimationFrame(tick);
  }

  function update() {
    if (!active) return;
    const distance = -story.getBoundingClientRect().top / innerHeight;
    target = clamp((distance - 0.08) / 0.72);
    if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
  }

  function syncLayout() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    active = desktop.matches && !reducedMotion.matches;
    story.classList.toggle('story-active', active);
    if (active) {
      if (about.parentElement !== layout) layout.append(about);
      update();
    } else {
      if (about.parentElement !== story) story.append(about);
      story.removeAttribute('style');
      about.inert = false;
      role.inert = false;
      about.removeAttribute('aria-hidden');
      cue.href = '#about';
      cue.lastChild.textContent = 'SCROLL TO ABOUT';
    }
  }

  // The About panel shares a sticky viewport with the hero. Its anchor maps
  // to the completed second screen rather than the panel's DOM position.
  function navigate(event) {
    const link = event.target.closest('a[href="#about"]');
    if (!active || !link || event.metaKey || event.ctrlKey || event.shiftKey)
      return;
    event.preventDefault();
    history.pushState(null, '', '#about');
    const top = scrollY + story.getBoundingClientRect().top + innerHeight;
    scrollTo({
      top,
      behavior: document.body.classList.contains('motion-paused')
        ? 'instant'
        : 'smooth',
    });
  }

  function restoreAboutAnchor() {
    if (active && location.hash === '#about') {
      const top = scrollY + story.getBoundingClientRect().top + innerHeight;
      scrollTo({ top, behavior: 'instant' });
    }
    update();
  }

  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  window.addEventListener('scroll', update, { ...options, passive: true });
  window.addEventListener('resize', syncLayout, options);
  desktop.addEventListener('change', syncLayout, options);
  reducedMotion.addEventListener('change', syncLayout, options);
  document.addEventListener('click', navigate, options);
  document.addEventListener('portfolio-motion-change', update, options);
  document.addEventListener(
    'visibilitychange',
    () => {
      previousTime = 0;
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else update();
    },
    options,
  );
  window.addEventListener('hashchange', restoreAboutAnchor, options);
  window.addEventListener(
    'pageshow',
    () => requestAnimationFrame(restoreAboutAnchor),
    options,
  );
  window.addEventListener(
    'pagehide',
    (event) => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (!event.persisted) listeners.abort();
    },
    options,
  );
  syncLayout();
})();
