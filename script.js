// ============================================================
// BLOG — SCRIPT.JS
// Loads posts.json → renders all cards, tag filters, sitemap
// Also handles: nav scroll, mobile menu, reading progress, TOC
// ============================================================

(function () {
  'use strict';

  // ── SVG icons (shared) ──────────────────────────────────
  const ICON_CAL  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
  const ICON_CLOCK= `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

  // ── Format date "2026-07-29" → "Jul 29, 2026" ───────────
  function fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T12:00:00Z');
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  }

  // ── Build a post card element ────────────────────────────
  function buildCard(post, opts) {
    const showExcerpt = opts && opts.showExcerpt;
    const rootPrefix  = (opts && opts.rootPrefix) || '';
    const tags = Array.isArray(post.tags) ? post.tags : [];
    const a    = document.createElement('a');
    a.href          = rootPrefix + 'posts/' + post.slug + '.html';
    a.className     = 'post-card';
    a.dataset.tags  = tags.join(',');
    a.innerHTML = `
      <div class="post-card-tags">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <h2 class="post-card-title">${post.title}</h2>
      ${showExcerpt && post.excerpt ? `<p class="post-card-excerpt">${post.excerpt}</p>` : ''}
      <div class="post-card-meta">
        <span class="post-meta-item">${ICON_CAL} ${fmtDate(post.date)}</span>
        <span class="post-meta-item">${ICON_CLOCK} ${post.readtime || ''}</span>
      </div>`;
    return a;
  }

  // ── Render index.html grids ──────────────────────────────
  function renderIndex(posts) {
    const featuredGrid = document.getElementById('featured-grid');
    const recentGrid   = document.getElementById('recent-grid');

    const featured = posts.filter(p => p.featured);
    const recent   = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

    if (featuredGrid) {
      featuredGrid.innerHTML = '';
      (featured.length ? featured : recent.slice(0, 2))
        .forEach(p => featuredGrid.appendChild(buildCard(p, { showExcerpt: true })));
    }
    if (recentGrid) {
      recentGrid.innerHTML = '';
      recent.forEach(p => recentGrid.appendChild(buildCard(p)));
    }
  }

  // ── Render blog.html grid + auto tag filter ──────────────
  function renderBlog(posts) {
    const grid      = document.getElementById('blog-grid');
    const tagFilter = document.getElementById('tag-filter');
    if (!grid) return;

    // Collect all unique tags, sorted alphabetically
    const allTags = [...new Set(posts.flatMap(p => p.tags || []))].sort();

    if (tagFilter) {
      allTags.forEach(tag => {
        if (!tagFilter.querySelector('[data-tag="' + tag + '"]')) {
          const btn = document.createElement('button');
          btn.className   = 'tag-btn';
          btn.dataset.tag = tag;
          btn.textContent = tag;
          tagFilter.appendChild(btn);
        }
      });
    }

    grid.innerHTML = '';
    [...posts]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .forEach(p => grid.appendChild(buildCard(p, { showExcerpt: true })));

    initTagFilter();
  }

  // ── Load posts.json and kick off rendering ───────────────
  const onIndex = !!document.getElementById('featured-grid');
  const onBlog  = !!document.getElementById('blog-grid');

  if (onIndex || onBlog) {
    const jsonPath = (location.pathname.includes('/posts/') ? '../' : '') + 'posts.json';

    fetch(jsonPath)
      .then(function(r) { return r.json(); })
      .then(function(posts) {
        if (onIndex) renderIndex(posts);
        if (onBlog)  renderBlog(posts);
      })
      .catch(function() {
        // fetch() doesn't work on file:// — show a helpful message
        const hint = document.createElement('p');
        hint.style.cssText = 'font-family:var(--font-mono);font-size:13px;color:var(--text-faint);padding:48px 0;text-align:center;grid-column:1/-1;';
        hint.innerHTML = 'Posts need a local server to load.<br>Run: <code style="background:var(--bg-code);color:#ff8c69;padding:2px 6px;border-radius:4px;">python3 -m http.server 8080</code> then open <code style="background:var(--bg-code);color:#ff8c69;padding:2px 6px;border-radius:4px;">localhost:8080</code>';
        const g = document.getElementById('featured-grid') || document.getElementById('blog-grid');
        if (g) g.appendChild(hint);
      });
  }

  // ── Tag filter ───────────────────────────────────────────
  function initTagFilter() {
    const tagBtns  = document.querySelectorAll('.tag-btn');
    const noResult = document.getElementById('no-results');

    tagBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        tagBtns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var tag     = btn.dataset.tag;
        var cards   = document.querySelectorAll('.post-card[data-tags]');
        var visible = 0;
        cards.forEach(function(card) {
          var tags = card.dataset.tags.split(',').map(function(t) { return t.trim(); });
          var show = tag === 'all' || tags.indexOf(tag) !== -1;
          card.classList.toggle('hidden', !show);
          if (show) visible++;
        });
        if (noResult) noResult.classList.toggle('visible', visible === 0);
      });
    });
  }

  // ── Nav scroll opacity ───────────────────────────────────
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function() { nav.classList.toggle('scrolled', window.scrollY > 20); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Mobile menu ──────────────────────────────────────────
  var hamburger  = document.querySelector('.nav-hamburger');
  var mobileMenu = document.querySelector('.nav-mobile');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function() {
      var open = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);
      var spans = hamburger.querySelectorAll('span');
      if (open) {
        spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
      } else {
        spans.forEach(function(s) { s.style.transform = ''; s.style.opacity = ''; });
      }
    });
    document.addEventListener('click', function(e) {
      if (!nav.contains(e.target) && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.querySelectorAll('span').forEach(function(s) { s.style.transform = ''; s.style.opacity = ''; });
      }
    });
  }

  // ── Reading progress bar ─────────────────────────────────
  var progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    window.addEventListener('scroll', function() {
      var pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
      progressBar.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });
  }

  // ── Table of contents ────────────────────────────────────
  var tocContainer = document.getElementById('toc');
  var article      = document.querySelector('.prose');
  if (tocContainer && article) {
    var headings = article.querySelectorAll('h2, h3');
    if (headings.length > 1) {
      var list = document.createElement('ul');
      list.className = 'toc-list';
      headings.forEach(function(h, i) {
        if (!h.id) h.id = 'h-' + i + '-' + h.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        var a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        a.className = 'toc-link' + (h.tagName === 'H3' ? ' toc-h3' : '');
        var li = document.createElement('li');
        li.appendChild(a);
        list.appendChild(li);
      });
      tocContainer.appendChild(list);

      var tocLinks = list.querySelectorAll('.toc-link');
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting)
            tocLinks.forEach(function(l) {
              l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id);
            });
        });
      }, { rootMargin: '-64px 0px -60% 0px' });
      headings.forEach(function(h) { obs.observe(h); });
    } else {
      var sidebar = document.querySelector('.toc-sidebar');
      if (sidebar) sidebar.style.display = 'none';
    }
  }

  // ── Active nav link ──────────────────────────────────────
  var currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(function(link) {
    var href = link.getAttribute('href').split('/').pop();
    if (href === currentPage) link.classList.add('active');
    if (currentPage.endsWith('.html') && currentPage !== 'index.html' &&
        currentPage !== 'blog.html' && currentPage !== 'notes.html' &&
        currentPage !== 'about.html' && href === 'blog.html') {
      link.classList.add('active');
    }
  });

})();
