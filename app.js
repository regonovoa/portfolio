/* ============================================================
   pablo — rego · portfolio
   Shared behaviour: scroll reveal + subtle depth parallax.
   ============================================================ */

// Reveal elements as they enter the viewport.
const _io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) { e.target.classList.add('on'); _io.unobserve(e.target); }
  }
}, { threshold: 0.12 });
document.querySelectorAll('.rv').forEach((el) => _io.observe(el));

// Subtle parallax: elements with [data-depth] drift at different speeds.
// Offset is measured against an untransformed ancestor (.plx) so the element
// never reads back its own transform (no feedback loop / jitter).
const _reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const _items = [...document.querySelectorAll('[data-depth]')].map((el) => ({
  el,
  depth: parseFloat(el.dataset.depth) || 0,
  ref: el.closest('.plx') || el.parentElement,
}));

let _ticking = false;
function _parallax() {
  _ticking = false;
  if (window.innerWidth < 860) { _items.forEach((i) => (i.el.style.transform = '')); return; }
  const mid = window.innerHeight / 2;
  for (const it of _items) {
    const r = it.ref.getBoundingClientRect();
    const off = (r.top + r.height / 2 - mid) * it.depth;
    it.el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
  }
}
function _onScroll() {
  if (!_ticking) { requestAnimationFrame(_parallax); _ticking = true; }
}
if (!_reduced) {
  addEventListener('scroll', _onScroll, { passive: true });
  addEventListener('resize', _onScroll);
  _parallax();
}

// about photo → lightbox
const _photo = document.querySelector('.me-photo');
const _lb = document.getElementById('lb');
if (_photo && _lb) {
  const _img = _lb.querySelector('img');
  const open = () => { _img.src = _photo.currentSrc || _photo.src; _lb.hidden = false; };
  _photo.addEventListener('click', open);
  _photo.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  _lb.addEventListener('click', () => { _lb.hidden = true; });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') _lb.hidden = true; });
}

// custom "Coming Soon" cursor over non-clickable work (desktop / hover devices only)
const _soon = document.querySelectorAll('.case.soon, .more');
if (_soon.length && matchMedia('(hover:hover)').matches) {
  const _cur = document.createElement('div');
  _cur.className = 'cs-cursor';
  _cur.innerHTML = 'Coming<br>Soon';
  document.body.appendChild(_cur);
  const _moveCur = (e) => { _cur.style.left = e.clientX + 'px'; _cur.style.top = e.clientY + 'px'; };
  _soon.forEach((el) => {
    el.addEventListener('mouseenter', (e) => { _moveCur(e); _cur.classList.add('on'); });
    el.addEventListener('mousemove', _moveCur);
    el.addEventListener('mouseleave', () => _cur.classList.remove('on'));
  });
}

// screen carousels: a circular "next" button that scrolls the row forward and hides at the end
document.querySelectorAll('.flow-next').forEach((btn) => {
  const flow = btn.parentElement.querySelector('.flow');
  if (!flow) { btn.remove(); return; }
  const update = () => {
    const more = flow.scrollWidth - flow.clientWidth - flow.scrollLeft > 4;
    btn.classList.toggle('off', !more);
  };
  btn.addEventListener('click', () => {
    const phone = flow.querySelector('.phone');
    const step = phone ? phone.getBoundingClientRect().width + 18 : flow.clientWidth * 0.8;
    flow.scrollBy({ left: step, behavior: 'smooth' });
  });
  flow.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
});

// center the home hero in the space below the fixed header (independent of the floating scroll cue)
const _homeHead = document.querySelector('.site-head.home');
if (_homeHead) {
  const _setNavH = () => document.documentElement.style.setProperty('--nav-h', _homeHead.offsetHeight + 'px');
  _setNavH();
  addEventListener('resize', _setNavH);
}
