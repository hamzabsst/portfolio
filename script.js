(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function populateContent(content) {
    for (const [id, project] of Object.entries(content.projects)) {
      if (!document.getElementById(`${id}-description`)) continue;
      document.getElementById(`${id}-description`).textContent =
        project.description;
      document.getElementById(`${id}-link`).href = project.url;
    }

    document.querySelectorAll('#resume-link, [data-resume]').forEach((link) => {
      link.href = content.resume;
    });
    document.querySelectorAll('#email-link').forEach((link) => {
      link.textContent = content.email;
      link.href = `mailto:${content.email}`;
    });
  }

  function setupScrollReveals() {
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08 },
    );

    const sections = document.querySelectorAll(
      '.project, .section-head, .contact h2',
    );
    sections.forEach((section) => {
      section.classList.add('reveal-ready');
      observer.observe(section);
    });
  }

  function setupCharacterMotion() {
    const hero = document.querySelector('.hero');
    const character = hero.querySelector('.character-art');
    const control = document.querySelector('.motion-control');
    const label = control.querySelector('.motion-label');
    const icon = control.querySelector('[aria-hidden]');
    let paused = false;
    let pointer = null;
    let portraitFrame = 0;

    function resetPortrait() {
      cancelAnimationFrame(portraitFrame);
      portraitFrame = 0;
      pointer = null;
      hero.style.setProperty('--portrait-x', '0px');
      hero.style.setProperty('--portrait-y', '0px');
      hero.style.setProperty('--portrait-tilt', '0deg');
    }

    function updatePortrait() {
      portraitFrame = 0;
      if (!pointer || paused || reducedMotion.matches) return;

      const bounds = hero.getBoundingClientRect();
      const x = (pointer.x - bounds.left) / bounds.width - 0.5;
      const y = (pointer.y - bounds.top) / bounds.height - 0.5;
      hero.style.setProperty('--portrait-x', `${x * 24}px`);
      hero.style.setProperty('--portrait-y', `${y * 12}px`);
      hero.style.setProperty('--portrait-tilt', `${x * 2}deg`);
    }

    control.addEventListener('click', () => {
      paused = !paused;
      document.body.classList.toggle('motion-paused', paused);
      control.setAttribute('aria-pressed', String(paused));
      control.setAttribute(
        'aria-label',
        paused ? 'Resume animation' : 'Pause animation',
      );
      label.textContent = paused ? 'Resume motion' : 'Pause motion';
      icon.textContent = paused ? '▷' : 'Ⅱ';
      document.dispatchEvent(new Event('portfolio-motion-change'));
      if (paused) resetPortrait();
    });

    // Batch pointer events into one layout read and style update per frame.
    hero.addEventListener(
      'pointermove',
      (event) => {
        if (reducedMotion.matches || paused || event.pointerType !== 'mouse')
          return;
        pointer = { x: event.clientX, y: event.clientY };
        if (!portraitFrame)
          portraitFrame = requestAnimationFrame(updatePortrait);
      },
      { passive: true },
    );
    hero.addEventListener('pointerleave', resetPortrait);
    reducedMotion.addEventListener('change', resetPortrait);

    let cleanupEyes = window.setupCharacterEyes(character, () => paused);
    window.addEventListener('pagehide', () => {
      resetPortrait();
      cleanupEyes();
    });
    // Browsers restore this document without rerunning scripts from their cache.
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        cleanupEyes = window.setupCharacterEyes(character, () => paused);
      }
    });
  }

  populateContent(window.portfolioContent);
  setupScrollReveals();
  setupCharacterMotion();
})();
