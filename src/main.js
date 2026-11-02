import '@fontsource-variable/manrope';
import '@phosphor-icons/web/regular';
import './style.css';
import './kns.js';

const directions = [
  ['Электропитание', 'Источники питания и зарядные устройства', 'Источники вторичного электропитания серий ИВЭП, КНС, ИПС и ИПТ, зарядные устройства серии ЗСУ. Для подбора исполнения направьте требования по входному и выходному напряжению, мощности и условиям эксплуатации.'],
  ['Связь и передача данных', 'IP-телефония, интерфейсные модули и системы передачи данных', 'IP-АТС AT128-IP, SIP-сервер, многоцелевые интерфейсные модули и оборудование передачи данных. Решения для построения и интеграции телекоммуникационных систем.'],
  ['Электрохимическая защита', 'Катодная защита и коррозионный мониторинг', 'Модульные станции катодной защиты, системы коррозионного мониторинга и контрольно-измерительные пункты «Прорыв».'],
  ['Вычислительные системы', 'Промышленные компьютеры и серверы', 'Стоечные исполнения серверов, одноплатные компьютеры на ARM и промышленные вычислительные устройства на x86.'],
  ['Дисплейные модули', 'Встраиваемые компьютеры и HMI', 'Планшетные и встраиваемые компьютеры, моноблоки, дисплеи и человеко-машинные интерфейсы.'],
  ['Авионика', 'Вычислительные и интерфейсные модули', 'Вычислительный интерфейсный модуль и мезонинный модуль авиационных интерфейсов. Обсудите с нашей командой требования к исполнению и интеграции.'],
];
document.querySelector('#direction-list').innerHTML = directions.map(([title, summary, detail], i) => `<details class="direction"><summary><span class="direction-number">0${i + 1}</span><span class="direction-title">${title}</span><span class="direction-summary">${summary}</span><i class="ph ph-arrow-right" aria-hidden="true"></i></summary><div class="direction-content"><p>${detail}</p><a class="text-link" href="mailto:mail@skitlab.ru?subject=${encodeURIComponent('Запрос: ' + title)}">Запросить информацию <i class="ph ph-arrow-up-right" aria-hidden="true"></i></a></div></details>`).join('');

const menu = document.querySelector('#navigation-dialog');
document.querySelector('.menu-button').addEventListener('click', () => menu.showModal());
document.querySelector('.close-menu').addEventListener('click', () => menu.close());
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.close()));
menu.addEventListener('click', e => { if (e.target === menu) { const r = menu.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) menu.close(); } });

const photos = [
  { src: '/assets/machine.jpg', caption: 'Монтаж электронных компонентов', alt: 'Оборудование для монтажа электронных компонентов' },
  { src: '/assets/workshop.jpg', caption: 'Производственная площадка', alt: 'Рабочие места и оборудование на производстве СКиТ' },
  { src: '/assets/shelves.jpg', caption: 'Платы и электронные модули', alt: 'Серийные платы и модули СКиТ' },
];
let currentPhoto = 0;
function changePhoto(delta) {
  currentPhoto = (currentPhoto + delta + photos.length) % photos.length;
  const photo = photos[currentPhoto];
  const image = document.querySelector('#gallery-image');
  image.src = photo.src; image.alt = photo.alt;
  document.querySelector('#gallery-caption').innerHTML = `${photo.caption}<br>Саратов`;
  document.querySelector('#gallery-count').textContent = `0${currentPhoto + 1} / 03`;
}
document.querySelector('#gallery-prev').addEventListener('click', () => changePhoto(-1));
document.querySelector('#gallery-next').addEventListener('click', () => changePhoto(1));
