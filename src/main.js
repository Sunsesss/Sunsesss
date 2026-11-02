import '@fontsource-variable/manrope';
import '@phosphor-icons/web/regular';
import './style.css';
import { initKns } from './kns.js';
import './motion.js';

// Native <details> provides the basic menu without any JavaScript dependency.
const menu = document.querySelector('#site-menu');
const summary = menu.querySelector('summary');
const main = document.querySelector('main');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let closingMenu = false;
summary.addEventListener('pointerdown', () => {
  document.dispatchEvent(new CustomEvent('site-menu-state', { detail: { open: true } }));
  const finish = () => {
    document.removeEventListener('pointerup', finish);
    document.removeEventListener('pointercancel', finish);
    setTimeout(() => document.dispatchEvent(new CustomEvent('site-menu-state', { detail: { open: menu.open } })), 0);
  };
  document.addEventListener('pointerup', finish, { once: true });
  document.addEventListener('pointercancel', finish, { once: true });
});
menu.addEventListener('toggle', () => {
  document.dispatchEvent(new CustomEvent('site-menu-state', { detail: { open: menu.open } }));
  document.body.classList.toggle('menu-open', menu.open);
  main.inert = menu.open;
  document.querySelector('.desktop-nav').inert = menu.open;
  summary.setAttribute('aria-label', menu.open ? 'Закрыть меню' : 'Открыть меню');
});
async function closeMenu(restoreFocus = false) {
  if (!menu.open || closingMenu) return;
  closingMenu = true;
  if (!reduced.matches) {
    try { await menu.querySelector('.menu-sheet').animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-14px)' }], { duration: 180, easing: 'ease-in' }).finished; } catch {}
  }
  menu.open = false;
  main.inert = false;
  closingMenu = false;
  if (restoreFocus) summary.focus();
}
summary.addEventListener('click', event => { if (menu.open) { event.preventDefault(); closeMenu(true); } });
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', async event => {
  const target = a.getAttribute('href');
  if (target.startsWith('#')) {
    event.preventDefault();
    await closeMenu();
    const section = document.querySelector(target);
    section?.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth' });
    try { history.replaceState(null, '', target); } catch {}
  } else closeMenu();
}));
document.addEventListener('keydown', event => {
  if (!menu.open) return;
  if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); }
  if (event.key === 'Tab') {
    const items = [...menu.querySelectorAll('summary,a,button')].filter(el => el.getClientRects().length);
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

const photos = [
  { src: '/assets/machine.jpg', caption: 'Монтаж электронных компонентов', alt: 'Оборудование для монтажа электронных компонентов' },
  { src: '/assets/workshop.jpg', caption: 'Производственная площадка', alt: 'Рабочие места и оборудование на производстве СКиТ' },
  { src: '/assets/shelves.jpg', caption: 'Платы и электронные модули', alt: 'Серийные платы и модули СКиТ' },
];
let currentPhoto = 0;
async function changePhoto(delta) {
  currentPhoto = (currentPhoto + delta + photos.length) % photos.length;
  const photo = photos[currentPhoto];
  const image = document.querySelector('#gallery-image');
  const preload = new Image(); preload.src = photo.src;
  try { await preload.decode(); } catch {}
  if (photo !== photos[currentPhoto]) return;
  image.src = photo.src; image.alt = photo.alt;
  if (!reduced.matches) image.animate([{ opacity: .25, transform: 'scale(1.025)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 500, easing: 'ease-out' });
  document.querySelector('#gallery-caption').innerHTML = `${photo.caption}<br>Саратов`;
  document.querySelector('#gallery-count').textContent = `0${currentPhoto + 1} / 03`;
}
document.querySelector('#gallery-prev').addEventListener('click', () => changePhoto(-1));
document.querySelector('#gallery-next').addEventListener('click', () => changePhoto(1));

// Enhancement failures cannot prevent the navigation and contact links working.
try { initKns(); } catch { document.querySelector('#kns').dataset.renderMode = 'fallback'; }
