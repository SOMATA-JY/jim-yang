// Xianan Jim Yang — personal site. Hash router, sidebar tree, figure zoom. No dependencies.
(function () {
  var pages = Array.prototype.slice.call(document.querySelectorAll('.page'));
  var links = Array.prototype.slice.call(document.querySelectorAll('.tree a'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('.tree .group'));
  var current = null;

  function pageFor(route) {
    for (var i = 0; i < pages.length; i++) if (pages[i].dataset.route === route) return pages[i];
    return null;
  }

  function show() {
    var route = location.hash.replace(/^#\/?/, '') || 'about';
    var page = pageFor(route);
    var anchor = null;
    if (!page) {
      // "section/anchor": a block inside a section page
      var parts = route.split('/');
      page = pageFor(parts[0]);
      if (page && parts[1]) anchor = page.querySelector('[data-anchor="' + parts[1] + '"]');
      if (!page || !anchor) { page = page || pages[0]; route = page.dataset.route; }
    }

    if (page !== current) {
      pages.forEach(function (p) { p.classList.toggle('active', p === page); p.classList.remove('enter'); });
      void page.offsetWidth; // restart the entrance animation
      page.classList.add('enter');
      current = page;
      if (!anchor) window.scrollTo(0, 0);
    }
    if (anchor) anchor.scrollIntoView({ block: 'start' });
    else if (route === page.dataset.route) window.scrollTo(0, 0);

    var section = route.split('/')[0];
    links.forEach(function (a) {
      if (a.getAttribute('href') === '#/' + route) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    groups.forEach(function (g) { if (g.dataset.group === section) g.classList.add('open'); });

    var h1 = page.querySelector('h1');
    document.title = (h1 && section !== 'about' ? h1.textContent.trim() + ' — ' : '') + 'Xianan Jim Yang';
    document.body.classList.remove('nav-open');
    observe(page);
  }

  // Collapse / expand a group without navigating
  groups.forEach(function (g) {
    g.querySelector('.chev').addEventListener('click', function () { g.classList.toggle('open'); });
  });

  // Small-screen menu
  var menu = document.querySelector('.topbar button');
  if (menu) menu.addEventListener('click', function () { document.body.classList.toggle('nav-open'); });

  // Previous / next links on project pages, in sidebar order
  var projects = links.filter(function (a) { return /^#\/projects\/./.test(a.getAttribute('href')); });
  projects.forEach(function (a, i) {
    var page = pageFor(a.getAttribute('href').slice(2));
    if (!page) return;
    var nav = document.createElement('nav');
    nav.className = 'pager';
    var prev = projects[i - 1], next = projects[i + 1];
    nav.innerHTML =
      (prev ? '<a href="' + prev.getAttribute('href') + '"><small>Previous</small>' + prev.textContent + '</a>' : '<span></span>') +
      (next ? '<a href="' + next.getAttribute('href') + '" style="text-align:right"><small>Next</small>' + next.textContent + '</a>' : '<span></span>');
    page.appendChild(nav);
  });

  // Reveal on scroll
  var io = 'IntersectionObserver' in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px' })
    : null;
  function observe(page) {
    Array.prototype.forEach.call(page.querySelectorAll('.reveal:not(.in)'), function (el) {
      if (io) io.observe(el); else el.classList.add('in');
    });
  }

  // Figure zoom
  var box = document.querySelector('.lightbox');
  document.addEventListener('click', function (e) {
    var img = e.target.closest ? e.target.closest('img[data-zoom]') : null;
    if (img) { box.querySelector('img').src = img.currentSrc || img.src; box.hidden = false; }
    else if (!box.hidden && e.target.closest('.lightbox')) box.hidden = true;
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') box.hidden = true; });

  window.addEventListener('hashchange', show);
  show();
})();
