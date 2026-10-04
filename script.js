const content = window.portfolioContent;
for (const [id, project] of Object.entries(content.projects)) {
  document.getElementById(`${id}-description`).textContent = project.description;
  document.getElementById(`${id}-link`).href = project.url;
}
document.getElementById('resume-link').href = content.resume;
document.querySelectorAll('[data-resume]').forEach(link => link.href = content.resume);
const emailLink = document.getElementById('email-link');
emailLink.textContent = content.email;
emailLink.href = `mailto:${content.email}`;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.08});
  document.querySelectorAll('.project, .about > div, .section-head, .contact h2').forEach(element => {
    element.classList.add('reveal-ready');
    observer.observe(element);
  });
}
const hero = document.querySelector('.hero');
const motionControl = document.querySelector('.motion-control');
let motionPaused = false;
const resetPortrait = () => {
  hero.style.setProperty('--portrait-x', '0px');
  hero.style.setProperty('--portrait-y', '0px');
  hero.style.setProperty('--portrait-tilt', '0deg');
};
motionControl.addEventListener('click', () => {
  motionPaused = !motionPaused;
  document.body.classList.toggle('motion-paused', motionPaused);
  motionControl.setAttribute('aria-pressed', String(motionPaused));
  motionControl.setAttribute('aria-label', motionPaused ? 'Resume animation' : 'Pause animation');
  motionControl.querySelector('.motion-label').textContent = motionPaused ? 'Resume motion' : 'Pause motion';
  motionControl.querySelector('[aria-hidden]').textContent = motionPaused ? '▷' : 'Ⅱ';
  if (motionPaused) resetPortrait();
});
hero.addEventListener('pointermove', event => {
  if (reduceMotion.matches || motionPaused || event.pointerType !== 'mouse') return;
  const rect = hero.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  hero.style.setProperty('--portrait-x', `${x * 24}px`);
  hero.style.setProperty('--portrait-y', `${y * 12}px`);
  hero.style.setProperty('--portrait-tilt', `${x * 2}deg`);
});
hero.addEventListener('pointerleave', resetPortrait);
reduceMotion.addEventListener('change', resetPortrait);
