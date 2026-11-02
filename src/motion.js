const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const smooth = matchMedia('(hover: hover) and (pointer: fine)');
function animateSafe(el, frames, options) {
  if (document.hidden) return;
  const animation = el.animate(frames, options);
  // Never leave essential content invisible when a background tab or a slow
  // graphics driver delays the animation timeline.
  setTimeout(() => { if (animation.playState !== 'finished') { try { animation.finish(); } catch {} } }, Number(options.duration) + Number(options.delay || 0) + 450);
  return animation;
}

// Real content remains visible if JavaScript or an animation API is unavailable.
if (!reduced.matches && 'animate' in Element.prototype) {
  document.querySelectorAll('.title-line > *').forEach((el, index) => {
    animateSafe(el, [{ transform: 'translateY(112%)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 850, delay: 60 + index * 120, easing: 'cubic-bezier(.16,1,.3,1)' });
  });
  const hero = document.querySelector('.hero-visual');
  if (hero) animateSafe(hero, [{ opacity: 0, transform: 'translateY(35px) rotate(-2deg)' }, { opacity: 1, transform: 'translateY(0) rotate(0)' }], { duration: 1000, delay: 100, easing: 'cubic-bezier(.16,1,.3,1)' });
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target;
      const frames = el.matches('.direction-list,.email') ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'translateY(0)' }];
      animateSafe(el, frames, { duration: 700, easing: 'cubic-bezier(.16,1,.3,1)' });
      observer.unobserve(el);
    }
  }, { threshold: .12, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.approach h2,.directions-heading,.direction-list,.boards-figure,.development-heading,.steps li,.production-heading,.production-main,.production-bottom,.contacts h2,.email').forEach(el => observer.observe(el));
}

let frame = 0;
function readScroll() {
  frame = 0;
  const range = document.documentElement.scrollHeight - innerHeight;
  document.documentElement.style.setProperty('--reading-progress', String(range > 0 ? scrollY / range : 0));
  if (smooth.matches && !reduced.matches) {
    const hero = document.querySelector('.hero-visual');
    if (hero && scrollY < innerHeight) hero.style.translate = `0 ${Math.min(32, scrollY * .045)}px`;
  }
}
addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(readScroll); }, { passive: true });
addEventListener('resize', readScroll, { passive: true });
readScroll();
