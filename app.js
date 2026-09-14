/* ============================================================
   TerOS — Application
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    attrs = attrs || {};
    for (const k in attrs) {
      const v = attrs[k];
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
      else if (k.indexOf('on') === 0 && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    kids.forEach(c => {
      if (c == null) return;
      n.appendChild(c.nodeType ? c : document.createTextNode(c));
    });
    return n;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function svgIcon(name, size) {
    size = size || 16;
    const paths = ICONS[name] || ICONS.file;
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
  }

  function relativeTime(ts) {
    const diff = Date.now() - ts;
    const sec = Math.floor(diff / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    if (sec < 60) return 'just now';
    if (min < 60) return min + ' min ago';
    if (hr < 24) return hr + ' hr ago';
    if (day < 7) return day + (day === 1 ? ' day ago' : ' days ago');
    return new Date(ts).toLocaleDateString();
  }

  function formatBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / (1024 * 1024)).toFixed(2) + ' MB';
  }

  let toastTimer;
  function toast(msg, type) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'show ' + (type || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.className = ''; }, 2200);
  }

  /* ---------- Icons ---------- */
  const ICONS = {
    calculator: '<rect x="5" y="3" width="14" height="18" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><circle cx="9" cy="12" r="0.6"/><circle cx="12" cy="12" r="0.6"/><circle cx="15" cy="12" r="0.6"/><circle cx="9" cy="16" r="0.6"/><circle cx="12" cy="16" r="0.6"/><circle cx="15" cy="16" r="0.6"/>',
    terminal:   '<rect x="3" y="4" width="18" height="16" rx="2"/><polyline points="7,10 10,12.5 7,15"/><line x1="12" y1="15" x2="16" y2="15"/>',
    notes:      '<path d="M5 3 h11 l5 5 v13 a1 1 0 0 1 -1 1 h-15 a1 1 0 0 1 -1 -1 v-17 a1 1 0 0 1 1 -1 Z"/><polyline points="16,3 16,8 21,8"/><line x1="8" y1="13" x2="17" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/>',
    files:      '<path d="M3 6 a2 2 0 0 1 2 -2 h4 l2 2 h8 a2 2 0 0 1 2 2 v9 a2 2 0 0 1 -2 2 h-14 a2 2 0 0 1 -2 -2 Z"/>',
    garden:     '<path d="M12 22 V14"/><path d="M12 14 C8 14 5 11 5 7 C9 7 12 10 12 14 Z"/><path d="M12 14 C16 14 19 11 19 7 C15 7 12 10 12 14 Z"/>',
    settings:   '<circle cx="12" cy="12" r="3"/><path d="M12 1 v3 M12 20 v3 M4.2 4.2 l2.1 2.1 M17.7 17.7 l2.1 2.1 M1 12 h3 M20 12 h3 M4.2 19.8 l2.1 -2.1 M17.7 6.3 l2.1 -2.1"/>',
    devlog:     '<path d="M4 4 h12 l4 4 v12 a2 2 0 0 1 -2 2 H4 a2 2 0 0 1 -2 -2 V6 a2 2 0 0 1 2 -2 Z"/><line x1="7" y1="9" x2="15" y2="9"/><line x1="7" y1="13" x2="17" y2="13"/><line x1="7" y1="17" x2="13" y2="17"/>',
    info:       '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="17"/><circle cx="12" cy="7.5" r="0.8" fill="currentColor"/>',
    folder:     '<path d="M3 6 a2 2 0 0 1 2 -2 h4 l2 2 h8 a2 2 0 0 1 2 2 v9 a2 2 0 0 1 -2 2 h-14 a2 2 0 0 1 -2 -2 Z"/>',
    file:       '<path d="M5 3 h11 l5 5 v13 a1 1 0 0 1 -1 1 h-15 a1 1 0 0 1 -1 -1 v-17 a1 1 0 0 1 1 -1 Z"/><polyline points="16,3 16,8 21,8"/>',
    plus:       '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    trash:      '<polyline points="3,6 5,6 21,6"/><path d="M19 6 l-1 14 a2 2 0 0 1 -2 2 H8 a2 2 0 0 1 -2 -2 L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
    arrow_left: '<polyline points="15,18 9,12 15,6"/>',
    arrow_right:'<polyline points="9,18 15,12 9,6"/>',
    refresh:    '<polyline points="23,4 23,10 17,10"/><path d="M20.49 15 a9 9 0 1 1 -2.12 -9.36 L23 10"/>',
    drop:       '<path d="M12 2 L6 11 a6 6 0 1 0 12 0 Z"/>',
    image:      '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>',
    x:          '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
    minimize:   '<line x1="6" y1="12" x2="18" y2="12"/>',
    maximize:   '<rect x="5" y="5" width="14" height="14" rx="1"/>',
    restore:    '<rect x="4" y="8" width="12" height="12" rx="1"/><path d="M8 8 V6 a2 2 0 0 1 2 -2 h8 a2 2 0 0 1 2 2 v8 a2 2 0 0 1 -2 2 h-2"/>',
    system:     '<rect x="4" y="4" width="16" height="12" rx="2"/><line x1="8" y1="20" x2="16" y2="20"/><line x1="12" y1="16" x2="12" y2="20"/>',
    search:     '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    upload:     '<path d="M21 15 v4 a2 2 0 0 1 -2 2 H5 a2 2 0 0 1 -2 -2 v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>'
  };

  /* ---------- Storage ---------- */
  const Store = {
    KEY: 'teros.v1',
    data: null,

    defaults() {
      return {
        settings: {
          wallpaper: 'misty',
          customWallpaper: null,
          theme: 'dark',
          accent: 'sage',
          clock24: true,
          showWidgets: true
        },
        files: {
          '/':               { type: 'folder', children: ['home'] },
          '/home':           { type: 'folder', children: ['Documents', 'Projects', 'Pictures'] },
          '/home/Documents': { type: 'folder', children: ['welcome.txt', 'notes.txt'] },
          '/home/Projects':  { type: 'folder', children: ['teros.txt'] },
          '/home/Pictures':  { type: 'folder', children: [] },
          '/home/Documents/welcome.txt': { type: 'file', content: 'Welcome to TerOS.\n\nThis simulated filesystem lives in your browser localStorage.\nCreate folders, write notes, explore the terminal.' },
          '/home/Documents/notes.txt':   { type: 'file', content: 'Groceries\n- moss tea\n- pine nuts\n- cedar honey' },
          '/home/Projects/teros.txt':    { type: 'file', content: 'TerOS — a nature-themed desktop OS in the browser.' }
        },
        notes: [
          { id: 'n1', title: 'Welcome note', body: 'TerOS saves your notes automatically.\nTry creating a new one with the + button.', updated: Date.now() }
        ],
        plant: { name: 'Mossy', growth: 12, lastWater: Date.now(), planted: Date.now() },
        tree:  { name: 'Oakley', growth: 30, lastWater: Date.now() }
      };
    },

    load() {
      try {
        const raw = localStorage.getItem(this.KEY);
        if (!raw) { this.data = this.defaults(); return this.data; }
        const parsed = JSON.parse(raw);
        const d = this.defaults();
        this.data = {
          settings: Object.assign({}, d.settings, parsed.settings || {}),
          files: (parsed.files && typeof parsed.files === 'object') ? parsed.files : d.files,
          notes: Array.isArray(parsed.notes) ? parsed.notes : d.notes,
          plant: Object.assign({}, d.plant, parsed.plant || {}),
          tree: Object.assign({}, d.tree, parsed.tree || {})
        };
        return this.data;
      } catch (e) {
        console.warn('TerOS storage corrupted, resetting.', e);
        this.data = this.defaults();
        return this.data;
      }
    },

    save() {
      try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); }
      catch (e) {
        console.warn('TerOS save failed', e);
        toast('Storage full — try a smaller image', 'error');
      }
    },

    reset() {
      try { localStorage.removeItem(this.KEY); } catch (e) {}
      this.data = this.defaults();
    }
  };

  /* ---------- Wallpaper ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = a;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function generateWallpaper(kind) {
    const palettes = {
      misty: { sky1: '#2a4a35', sky2: '#142a1e', sky3: '#060c08', far: '#0e1e15', mid: '#1a3424', near: '#050b07', mist: '#a8c4a8' },
      dawn:  { sky1: '#7a5f4a', sky2: '#3b4530', sky3: '#0e1408', far: '#1a2015', mid: '#141c10', near: '#080c06', mist: '#e8c9a0' },
      dusk:  { sky1: '#4a3a52', sky2: '#2a2438', sky3: '#0a0812', far: '#14101c', mid: '#0e0a16', near: '#060410', mist: '#b39fc4' },
      night: { sky1: '#0e2030', sky2: '#08141e', sky3: '#02060a', far: '#08121a', mid: '#061018', near: '#02060a', mist: '#7fa0c0' }
    };
    const p = palettes[kind] || palettes.misty;
    const rand = mulberry32(kind === 'dawn' ? 1 : kind === 'dusk' ? 2 : kind === 'night' ? 3 : 4);

    function pines(count, baseY, minH, maxH, opacity, blurPx) {
      let out = '';
      for (let i = 0; i < count; i++) {
        const x = (i / Math.max(1, count - 1)) * 1920 + (rand() * 60 - 30);
        const h = minH + rand() * (maxH - minH);
        const w = h * 0.36;
        const topY = baseY - h;
        out += '<g opacity="' + opacity + '">';
        out += '<polygon points="' + x + ',' + topY + ' ' + (x - w*0.4) + ',' + (topY + h*0.35) + ' ' + (x + w*0.4) + ',' + (topY + h*0.35) + '"/>';
        out += '<polygon points="' + x + ',' + (topY + h*0.15) + ' ' + (x - w*0.55) + ',' + (topY + h*0.6) + ' ' + (x + w*0.55) + ',' + (topY + h*0.6) + '"/>';
        out += '<polygon points="' + x + ',' + (topY + h*0.35) + ' ' + (x - w*0.7) + ',' + (topY + h*0.85) + ' ' + (x + w*0.7) + ',' + (topY + h*0.85) + '"/>';
        out += '<polygon points="' + x + ',' + (topY + h*0.55) + ' ' + (x - w*0.9) + ',' + baseY + ' ' + (x + w*0.9) + ',' + baseY + '"/>';
        out += '</g>';
      }
      return '<g filter="url(#wblur' + blurPx + ')">' + out + '</g>';
    }

    let stars = '';
    if (kind === 'night') {
      stars = '<g fill="#e8e4d8">';
      for (let i = 0; i < 60; i++) {
        stars += '<circle cx="' + (rand() * 1920) + '" cy="' + (rand() * 500) + '" r="' + (rand() * 1.2 + 0.3) + '" opacity="' + (rand() * 0.7 + 0.2) + '"/>';
      }
      stars += '</g>';
    }

    return '<svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">'
      + '<defs>'
      +   '<linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + p.sky1 + '"/><stop offset="55%" stop-color="' + p.sky2 + '"/><stop offset="100%" stop-color="' + p.sky3 + '"/></linearGradient>'
      +   '<radialGradient id="wsun" cx="50%" cy="22%" r="45%"><stop offset="0%" stop-color="' + p.mist + '" stop-opacity="0.28"/><stop offset="100%" stop-color="' + p.mist + '" stop-opacity="0"/></radialGradient>'
      +   '<linearGradient id="wmist" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + p.mist + '" stop-opacity="0"/><stop offset="50%" stop-color="' + p.mist + '" stop-opacity="0.12"/><stop offset="100%" stop-color="' + p.mist + '" stop-opacity="0"/></linearGradient>'
      +   '<filter id="wblur0"><feGaussianBlur stdDeviation="0.6"/></filter>'
      +   '<filter id="wblur2"><feGaussianBlur stdDeviation="0.8"/></filter>'
      +   '<filter id="wblur6"><feGaussianBlur stdDeviation="1"/></filter>'
      + '</defs>'
      + '<rect width="1920" height="1080" fill="url(#wsky)"/>'
      + '<rect width="1920" height="1080" fill="url(#wsun)"/>' + stars
      + '<g fill="' + p.far + '">'  + pines(20, 980,  260, 420, 0.55, 0) + '</g>'
      + '<rect width="1920" height="1080" fill="url(#wmist)"/>'
      + '<g fill="' + p.mid + '">'  + pines(14, 1080, 320, 520, 0.75, 2) + '</g>'
      + '<rect width="1920" height="1080" fill="url(#wmist)" opacity="0.5"/>'
      + '<g fill="' + p.near + '">' + pines(9,  1180, 420, 680, 0.9,  6) + '</g>'
      + '<rect width="1920" height="1080" fill="url(#wsky)" opacity="0.35"/>'
      + '</svg>';
  }

  const ACCENTS = {
    sage:   { accent: '#7fa87f', bright: '#b3d9b3', glow: 'rgba(127,168,127,0.35)' },
    forest: { accent: '#4a7c59', bright: '#8fbf94', glow: 'rgba(74,124,89,0.35)' },
    amber:  { accent: '#fadc9c', bright: '#e2c179', glow: 'rgba(155, 114, 26, 0.35)' },
    mist:   { accent: '#a0b8b0', bright: '#c8dcd4', glow: 'rgba(160,184,176,0.35)' }
  };

  const WALLPAPERS = [
    { key: 'misty', label: 'Misty Forest' },
    { key: 'dawn',  label: 'Dawn' },
    { key: 'dusk',  label: 'Dusk' },
    { key: 'night', label: 'Night' }
  ];

  function applySettings() {
    const s = Store.data.settings;
    const wp = $('#wallpaper');
    if (wp) {
      if (s.wallpaper === 'custom' && s.customWallpaper) {
        wp.innerHTML = '';
        wp.style.backgroundImage = 'url("' + s.customWallpaper + '")';
      } else {
        wp.style.backgroundImage = '';
        wp.innerHTML = generateWallpaper(s.wallpaper);
      }
    }
    document.body.classList.toggle('light', s.theme === 'light');
    const a = ACCENTS[s.accent] || ACCENTS.sage;
    document.documentElement.style.setProperty('--accent', a.accent);
    document.documentElement.style.setProperty('--accent-bright', a.bright);
    document.documentElement.style.setProperty('--accent-glow', a.glow);
    const wg = $('#widgets');
    if (wg) wg.style.display = s.showWidgets ? 'grid' : 'none';
  }

  /* Window Manager */
  const WM = {
    zTop: 100,
    windows: {},
    order: [],

    open(appId, opts) {
      opts = opts || {};
      if (this.windows[appId]) {
        this.restore(appId); this.focus(appId);
        return this.windows[appId].el;
      }
      const title  = opts.title  || appId;
      const width  = opts.width  || 460;
      const height = opts.height || 340;
      const icon   = opts.icon   || svgIcon('file');

      const cascade = (this.order.length % 6) * 24;
      const win = el('div', { class: 'window' });
      win.dataset.winId = appId;
      win.style.left   = (140 + cascade) + 'px';
      win.style.top    = (100 + cascade) + 'px';
      win.style.width  = width + 'px';
      win.style.height = height + 'px';

      win.innerHTML =
        '<div class="win-header">' +
          '<div class="win-title">' + icon + '<span>' + title + '</span></div>' +
          '<div class="win-controls">' +
            '<button class="win-btn" data-act="min" title="Minimize">' + svgIcon('minimize', 12) + '</button>' +
            '<button class="win-btn" data-act="max" title="Maximize">' + svgIcon('maximize', 12) + '</button>' +
            '<button class="win-btn" data-act="close" title="Close">' + svgIcon('x', 12) + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="win-body"></div>';

      const body = $('.win-body', win);
      if (typeof opts.render === 'function') {
        try { opts.render(body, win); }
        catch (err) {
          console.error('App render error:', err);
          body.innerHTML = '<div class="empty">This app failed to load.</div>';
        }
      }

      $('#windows-layer').appendChild(win);
      this.windows[appId] = {
        el: win, title: title, appId: appId, icon: icon,
        minimized: false, maximized: false, snapped: null, prevRect: null
      };
      this.order.push(appId);
      this.focus(appId);
      this.addTask(appId);
      this._makeDraggable(win, $('.win-header', win), appId);
      this._makeResizable(win, appId);
      this._wire(win, appId);
      return win;
    },

    _wire(win, appId) {
      const self = this;
      win.addEventListener('mousedown', function () { self.focus(appId); }, true);
      $('[data-act="min"]', win).addEventListener('click', function (e) { e.stopPropagation(); self.minimize(appId); });
      $('[data-act="max"]', win).addEventListener('click', function (e) { e.stopPropagation(); self.toggleMaximize(appId); });
      $('[data-act="close"]', win).addEventListener('click', function (e) { e.stopPropagation(); self.close(appId); });
    },

    _makeDraggable(win, handle, appId) {
      const self = this;
      handle.addEventListener('mousedown', function (e) {
        if (e.target.closest('.win-btn') || e.target.closest('.rz')) return;
        e.preventDefault();
        const w = self.windows[appId];
        if (!w) return;
        if (w.maximized || w.snapped) {
          const prevW = (w.prevRect && parseInt(w.prevRect.width, 10)) || 460;
          self.restoreSize(appId);
          win.style.left = Math.max(0, e.clientX - prevW / 2) + 'px';
          win.style.top  = Math.max(0, e.clientY - 20) + 'px';
        }
        const r = win.getBoundingClientRect();
        const dx = e.clientX - r.left;
        const dy = e.clientY - r.top;
        const desk = $('#desktop').getBoundingClientRect();
        let snapSide = null;
        function move(ev) {
          let nx = ev.clientX - dx;
          let ny = ev.clientY - dy;
          nx = Math.max(-(r.width - 80), Math.min(nx, desk.width - 60));
          ny = Math.max(0, Math.min(ny, desk.height - 40));
          win.style.left = nx + 'px';
          win.style.top  = ny + 'px';
          const EDGE = 16;
          let side = null;
          if (ev.clientY < desk.top + EDGE) side = 'max';
          else if (ev.clientX < desk.left + EDGE) side = 'left';
          else if (ev.clientX > desk.right - EDGE) side = 'right';
          if (side !== snapSide) {
            snapSide = side;
            if (side) showSnapPreview(side); else hideSnapPreview();
          }
        }
        function up() {
          document.removeEventListener('mousemove', move);
          document.removeEventListener('mouseup', up);
          document.body.style.userSelect = '';
          hideSnapPreview();
          if (snapSide === 'max') self.maximize(appId);
          else if (snapSide === 'left')  self.snap(appId, 'left');
          else if (snapSide === 'right') self.snap(appId, 'right');
        }
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
      });
      handle.addEventListener('dblclick', function (e) {
        if (e.target.closest('.win-btn') || e.target.closest('.rz')) return;
        self.toggleMaximize(appId);
      });
    },

    _makeResizable(win, appId) {
      const self = this;
      const dirs = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'];
      const MIN_W = 240, MIN_H = 160;
      dirs.forEach(function (d) {
        const h = el('div', { class: 'rz rz-' + d, 'data-dir': d });
        win.appendChild(h);
        h.addEventListener('mousedown', function (e) {
          e.preventDefault(); e.stopPropagation();
          self.focus(appId);
          const w = self.windows[appId];
          if (!w || w.maximized || w.snapped) return;
          const startX = e.clientX, startY = e.clientY;
          const rect = win.getBoundingClientRect();
          const startL = rect.left, startT = rect.top, startW = rect.width, startH = rect.height;
          function move(ev) {
            const mx = ev.clientX - startX, my = ev.clientY - startY;
            let nl = startL, nt = startT, nw = startW, nh = startH;
            if (d.indexOf('e') !== -1) nw = Math.max(MIN_W, startW + mx);
            if (d.indexOf('s') !== -1) nh = Math.max(MIN_H, startH + my);
            if (d.indexOf('w') !== -1) { nw = Math.max(MIN_W, startW - mx); nl = startL + (startW - nw); if (nl < 0) { nw += nl; nl = 0; } }
            if (d.indexOf('n') !== -1) { nh = Math.max(MIN_H, startH - my); nt = startT + (startH - nh); if (nt < 0) { nh += nt; nt = 0; } }
            win.style.left = nl + 'px'; win.style.top = nt + 'px';
            win.style.width = nw + 'px'; win.style.height = nh + 'px';
          }
          function up() {
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', up);
            document.body.style.userSelect = '';
          }
          document.body.style.userSelect = 'none';
          document.addEventListener('mousemove', move);
          document.addEventListener('mouseup', up);
        });
      });
    },

    maximize(appId) {
      const w = this.windows[appId]; if (!w) return;
      if (!w.maximized && !w.snapped) w.prevRect = { left: w.el.style.left, top: w.el.style.top, width: w.el.style.width, height: w.el.style.height };
      w.maximized = true; w.snapped = null;
      w.el.classList.add('maximized');
      w.el.classList.remove('snapped-left', 'snapped-right');
      w.el.style.left = '0px'; w.el.style.top = '0px';
      w.el.style.width = '100%'; w.el.style.height = '100%';
      this._updateMaxIcon(appId);
    },

    snap(appId, side) {
      const w = this.windows[appId]; if (!w) return;
      if (!w.maximized && !w.snapped) w.prevRect = { left: w.el.style.left, top: w.el.style.top, width: w.el.style.width, height: w.el.style.height };
      w.maximized = false; w.snapped = side;
      w.el.classList.remove('maximized', 'snapped-left', 'snapped-right');
      w.el.classList.add(side === 'left' ? 'snapped-left' : 'snapped-right');
      w.el.style.left = side === 'left' ? '0px' : '50%';
      w.el.style.top = '0px';
      w.el.style.width = '50%'; w.el.style.height = '100%';
      this._updateMaxIcon(appId);
    },

    restoreSize(appId) {
      const w = this.windows[appId]; if (!w) return;
      w.maximized = false; w.snapped = null;
      w.el.classList.remove('maximized', 'snapped-left', 'snapped-right');
      if (w.prevRect) {
        w.el.style.left = w.prevRect.left; w.el.style.top = w.prevRect.top;
        w.el.style.width = w.prevRect.width; w.el.style.height = w.prevRect.height;
      }
      this._updateMaxIcon(appId);
    },

    toggleMaximize(appId) {
      const w = this.windows[appId]; if (!w) return;
      if (w.maximized || w.snapped) this.restoreSize(appId);
      else this.maximize(appId);
    },

    _updateMaxIcon(appId) {
      const w = this.windows[appId]; if (!w) return;
      const btn = $('[data-act="max"]', w.el); if (!btn) return;
      const isMax = w.maximized || w.snapped;
      btn.innerHTML = isMax ? svgIcon('restore', 12) : svgIcon('maximize', 12);
      btn.title = isMax ? 'Restore' : 'Maximize';
    },

    cycleFocus() {
      const ids = this.order.filter(function (id) { return WM.windows[id] && !WM.windows[id].minimized; });
      if (ids.length < 2) return;
      let current = -1;
      for (let i = 0; i < ids.length; i++) {
        if (WM.windows[ids[i]].el.style.zIndex === String(WM.zTop)) { current = i; break; }
      }
      const next = (current + 1) % ids.length;
      this.focus(ids[next]);
    },

    focus(appId) {
      const w = this.windows[appId]; if (!w) return;
      if (w.minimized) this.restore(appId);
      this.zTop += 1;
      w.el.style.zIndex = this.zTop;
      Object.keys(this.windows).forEach(function (k) { WM.windows[k].el.classList.remove('is-focused'); });
      w.el.classList.add('is-focused');
      this._refreshTasks();
    },

    minimize(appId) {
      const w = this.windows[appId]; if (!w) return;
      w.minimized = true; w.el.style.display = 'none';
      this._refreshTasks();
    },

    restore(appId) {
      const w = this.windows[appId]; if (!w) return;
      w.minimized = false; w.el.style.display = 'flex';
      this._refreshTasks();
    },

    close(appId) {
      const w = this.windows[appId]; if (!w) return;
      const self = this;
      w.el.classList.add('closing');
      function kill() {
        if (w.el.parentNode) w.el.parentNode.removeChild(w.el);
        delete self.windows[appId];
        self.order = self.order.filter(function (x) { return x !== appId; });
        self._refreshTasks();
      }
      w.el.addEventListener('animationend', kill, { once: true });
      setTimeout(kill, 300);
    },

    addTask(appId) {
      if ($('.task[data-app="' + appId + '"]')) return;
      const w = this.windows[appId];
      const self = this;
      const t = el('button', { class: 'task', 'data-app': appId, html: w.icon + '<span>' + w.title + '</span>' });
      t.addEventListener('click', function () {
        const cur = self.windows[appId]; if (!cur) return;
        const isFocused = cur.el.classList.contains('is-focused') && !cur.minimized;
        if (isFocused) self.minimize(appId);
        else { self.restore(appId); self.focus(appId); }
      });
      $('#tasks').appendChild(t);
    },

    _refreshTasks() {
      const self = this;
      Object.keys(this.windows).forEach(function (id) {
        const w = self.windows[id];
        const t = $('.task[data-app="' + id + '"]');
        if (!t) return;
        t.classList.toggle('focused', w.el.classList.contains('is-focused') && !w.minimized);
        t.classList.toggle('minimized', w.minimized);
      });
    }
  };

  /* Snap preview + context menu */
  function showSnapPreview(side) {
    let p = $('#snap-preview');
    if (!p) { p = el('div', { id: 'snap-preview' }); document.body.appendChild(p); }
    const desk = $('#desktop').getBoundingClientRect();
    if (side === 'max') { p.style.left = '0px'; p.style.top = '0px'; p.style.width = desk.width + 'px'; p.style.height = desk.height + 'px'; }
    else if (side === 'left') { p.style.left = '0px'; p.style.top = '0px'; p.style.width = (desk.width / 2) + 'px'; p.style.height = desk.height + 'px'; }
    else if (side === 'right') { p.style.left = (desk.width / 2) + 'px'; p.style.top = '0px'; p.style.width = (desk.width / 2) + 'px'; p.style.height = desk.height + 'px'; }
    p.classList.add('show');
  }
  function hideSnapPreview() {
    const p = $('#snap-preview'); if (p) p.classList.remove('show');
  }

  const ContextMenu = {
    el: null,
    build() {
      if (this.el) return;
      this.el = el('div', { id: 'context-menu' });
      document.body.appendChild(this.el);
      const self = this;
      document.addEventListener('click', function (e) { if (!self.el.contains(e.target)) self.hide(); });
      document.addEventListener('contextmenu', function (e) {
        if (!e.target.closest('#desktop')) return;
        e.preventDefault();
        self.show(e.clientX, e.clientY);
      });
    },
    show(x, y) {
      const self = this;
      this.el.innerHTML =
        '<button class="ctx-item" data-act="refresh">' + svgIcon('refresh', 14) + ' Refresh</button>' +
        '<button class="ctx-item" data-act="new-folder">' + svgIcon('plus', 14) + ' New Folder</button>' +
        '<div class="ctx-sep"></div>' +
        '<button class="ctx-item" data-act="garden">' + svgIcon('garden', 14) + ' Garden</button>' +
        '<button class="ctx-item" data-act="tree">' + svgIcon('garden', 14) + ' Tree</button>' +
        '<button class="ctx-item" data-act="settings">' + svgIcon('settings', 14) + ' Settings</button>' +
        '<button class="ctx-item" data-act="systeminfo">' + svgIcon('system', 14) + ' System Info</button>' +
        '<div class="ctx-sep"></div>' +
        '<button class="ctx-item" data-act="about">' + svgIcon('info', 14) + ' About TerOS</button>';

      this.el.querySelectorAll('.ctx-item').forEach(function (b) {
        b.addEventListener('click', function () {
          const act = b.dataset.act;
          self.hide();
          if (act === 'refresh') { refreshWidgets(); toast('Desktop refreshed', 'success'); }
          else if (act === 'new-folder') {
            const name = prompt('Folder name:', 'New Folder');
            if (!name || !name.trim()) return;
            const path = '/home/' + name.trim();
            if (Store.data.files[path]) return toast('Name already exists', 'error');
            Store.data.files[path] = { type: 'folder', children: [] };
            Store.data.files['/home'].children.push(name.trim());
            Store.save();
            toast('Folder created in /home', 'success');
          }
          else if (act === 'garden') launchApp('garden');
          else if (act === 'tree') launchApp('tree');
          else if (act === 'settings') launchApp('settings');
          else if (act === 'systeminfo') launchApp('systeminfo');
          else if (act === 'about') $('#about-modal').classList.add('open');
        });
      });

      this.el.classList.add('open');
      this.el.style.left = Math.min(x, window.innerWidth - 220) + 'px';
      this.el.style.top = Math.min(y, window.innerHeight - 320) + 'px';
    },
    hide() { if (this.el) this.el.classList.remove('open'); }
  };

  /* Apps registry */
  const APPS = {
    calculator: { title: 'Calculator',  icon: ICONS.calculator, launch: launchCalculator },
    terminal:   { title: 'Terminal',    icon: ICONS.terminal,   launch: launchTerminal },
    notes:      { title: 'Notes',       icon: ICONS.notes,      launch: launchNotes },
    files:      { title: 'Files',       icon: ICONS.files,      launch: launchFiles },
    garden:     { title: 'Garden',      icon: ICONS.garden,     launch: launchGarden },
    tree:       { title: 'Tree',        icon: ICONS.garden,     launch: launchTree },
    settings:   { title: 'Settings',    icon: ICONS.settings,   launch: launchSettings },
    devlog:     { title: 'Devlog',      icon: ICONS.devlog,     launch: launchDevlog },
    systeminfo: { title: 'System Info', icon: ICONS.system,     launch: launchSystemInfo }
  };

  function launchApp(id) {
    const app = APPS[id];
    if (!app) { console.warn('Unknown app:', id); return; }
    try { app.launch(); }
    catch (e) { console.error('Failed to launch', id, e); toast('Could not open ' + id, 'error'); }
  }

  /* Calculator */
  function launchCalculator() {
    WM.open('calculator', {
      title: 'Calculator', width: 300, height: 440,
      icon: svgIcon('calculator', 14),
      render: function (body) {
        body.classList.add('calc');
        body.innerHTML =
          '<div class="calc-display" id="cd">0</div>' +
          '<div class="calc-grid" id="cg">' +
            '<button class="calc-btn clear" data-k="C">C</button>' +
            '<button class="calc-btn op" data-k="+/-">±</button>' +
            '<button class="calc-btn op" data-k="/">÷</button>' +
            '<button class="calc-btn op" data-k="*">×</button>' +
            '<button class="calc-btn" data-k="7">7</button>' +
            '<button class="calc-btn" data-k="8">8</button>' +
            '<button class="calc-btn" data-k="9">9</button>' +
            '<button class="calc-btn op" data-k="-">−</button>' +
            '<button class="calc-btn" data-k="4">4</button>' +
            '<button class="calc-btn" data-k="5">5</button>' +
            '<button class="calc-btn" data-k="6">6</button>' +
            '<button class="calc-btn op" data-k="+">+</button>' +
            '<button class="calc-btn" data-k="1">1</button>' +
            '<button class="calc-btn" data-k="2">2</button>' +
            '<button class="calc-btn" data-k="3">3</button>' +
            '<button class="calc-btn eq" data-k="=">=</button>' +
            '<button class="calc-btn" data-k="0">0</button>' +
            '<button class="calc-btn" data-k=".">.</button>' +
          '</div>';
        const disp = $('#cd', body);
        let cur = '0', prev = null, op = null, fresh = true;
        function refresh() { disp.textContent = cur; disp.classList.toggle('small', cur.length > 10); }
        function compute() {
          if (op === null || prev === null) return Number(cur);
          const a = prev, b = Number(cur);
          if (op === '+') return a + b;
          if (op === '-') return a - b;
          if (op === '*') return a * b;
          if (op === '/') return b === 0 ? NaN : a / b;
          return b;
        }
        function digit(d) { if (fresh) { cur = d; fresh = false; } else { cur = cur === '0' ? d : cur + d; } }
        function dot() { if (fresh) { cur = '0.'; fresh = false; return; } if (cur.indexOf('.') === -1) cur += '.'; }
        function chooseOp(nextOp) {
          if (op !== null && !fresh) {
            const r = compute();
            if (!isFinite(r)) { cur = 'Error'; fresh = true; op = null; prev = null; refresh(); return; }
            cur = String(+r.toFixed(10)); prev = Number(cur);
          } else prev = Number(cur);
          op = nextOp; fresh = true; refresh();
        }
        function equals() {
          if (op === null) return;
          const r = compute();
          cur = !isFinite(r) ? 'Error' : String(+r.toFixed(10));
          prev = null; op = null; fresh = true; refresh();
        }
        function clear() { cur = '0'; prev = null; op = null; fresh = true; refresh(); }
        $('#cg', body).addEventListener('click', function (e) {
          const b = e.target.closest('.calc-btn'); if (!b) return;
          const k = b.dataset.k;
          if (/^\d$/.test(k)) digit(k);
          else if (k === '.') dot();
          else if (k === '+/-') cur = cur.charAt(0) === '-' ? cur.slice(1) : (cur === '0' ? '0' : '-' + cur);
          else if (k === 'C') clear();
          else if (k === '=') equals();
          else if ('+-*/'.indexOf(k) !== -1) chooseOp(k);
          refresh();
        });
        body.tabIndex = 0;
        body.addEventListener('keydown', function (e) {
          const w = WM.windows['calculator'];
          if (!w || w.minimized || w.el.style.zIndex !== String(WM.zTop)) return;
          const k = e.key;
          if (/^\d$/.test(k)) digit(k);
          else if (k === '.') dot();
          else if ('+-*/'.indexOf(k) !== -1) chooseOp(k);
          else if (k === 'Enter' || k === '=') equals();
          else if (k === 'Escape') clear();
          else if (k === 'Backspace') cur = (fresh || cur.length <= 1) ? '0' : cur.slice(0, -1);
          else return;
          e.preventDefault(); refresh();
        });
        setTimeout(function () { body.focus(); }, 50);
      }
    });
  }

  /* Terminal */
  function launchTerminal() {
    WM.open('terminal', {
      title: 'Terminal', width: 640, height: 420,
      icon: svgIcon('terminal', 14),
      render: function (body) {
        body.classList.add('term');
        body.innerHTML =
          '<div class="term-output" id="to"></div>' +
          '<div class="term-input-row">' +
            '<span class="term-prompt">teros@forest:<span class="path" id="tp">~</span>$</span>' +
            '<input id="term-input" autocomplete="off" spellcheck="false">' +
          '</div>';
        const out = $('#to', body);
        const input = $('#term-input', body);
        const pathEl = $('#tp', body);
        let cwd = '/home';
        const HOME = '/home';
        const short = function (p) { return p === HOME ? '~' : p.replace(HOME, '~'); };
        function updatePrompt() { pathEl.textContent = short(cwd); }
        function print(text, cls) {
          const d = el('div', { class: 'term-line ' + (cls || '') });
          d.textContent = text; out.appendChild(d); out.scrollTop = out.scrollHeight;
        }
        function printRaw(html) {
          const d = el('div', { class: 'term-line', html: html });
          out.appendChild(d); out.scrollTop = out.scrollHeight;
        }
        function resolve(p) {
          if (!p) return cwd;
          if (p === '~') return HOME;
          if (p.indexOf('~/') === 0) return HOME + p.slice(1);
          if (p.charAt(0) === '/') return p;
          if (p === '..') return cwd === '/' ? '/' : (cwd.replace(/\/[^/]+$/, '') || '/');
          if (p === '.') return cwd;
          return (cwd === '/' ? '' : cwd) + '/' + p;
        }
        const CMDS = {
          help: function () {
            printRaw('<span class="hl">TerOS Terminal — available commands</span>');
            print('  help            This message');
            print('  clear           Clear the terminal');
            print('  about           About TerOS');
            print('  echo <text>     Echo text');
            print('  date / time     Current date / time');
            print('  pwd             Print working directory');
            print('  ls [path]       List directory');
            print('  cd <path>       Change directory');
            print('  tree            Filesystem tree');
            print('  mkdir <name>    Create folder');
            print('  touch <name>    Create file');
            print('  cat <file>      Show file contents');
            print('  rm <name>       Delete file/folder');
            print('  neofetch        System information');
            print('  coffee          Try it.');
            print('  moss            A quiet moment.');
            print('  sudo forest     Try it.');
          },
          clear: function () { out.innerHTML = ''; },
          about: function () {
            printRaw('<span class="hl">TerOS v1.0 — Forest</span>');
            print('A retro-inspired nature desktop OS.');
            print('Everything here is simulated.');
          },
          echo: function (a) { print(a.join(' ')); },
          date: function () { print(new Date().toDateString()); },
          time: function () { print(new Date().toLocaleTimeString()); },
          pwd: function () { print(cwd); },
          ls: function (a) {
            const target = resolve(a[0] || cwd);
            const node = Store.data.files[target];
            if (!node) return print('ls: ' + (a[0] || target) + ': No such file or directory', 'err');
            if (node.type === 'file') return print(target.split('/').pop());
            if (node.children.length === 0) return print('(empty)', 'dim');
            node.children.forEach(function (c) {
              const childPath = (target === '/' ? '/' : target + '/') + c;
              const child = Store.data.files[childPath];
              print(c + (child && child.type === 'folder' ? '/' : ''));
            });
          },
          cd: function (a) {
            const target = resolve(a[0] || HOME);
            const node = Store.data.files[target];
            if (!node) return print('cd: ' + a[0] + ': No such file or directory', 'err');
            if (node.type !== 'folder') return print('cd: ' + a[0] + ': Not a directory', 'err');
            cwd = target; updatePrompt();
          },
          tree: function () {
            print('~/');
            (function walk(path, prefix) {
              const node = Store.data.files[path];
              if (!node || node.type !== 'folder') return;
              node.children.forEach(function (name, i) {
                const isLast = i === node.children.length - 1;
                const branch = isLast ? '└── ' : '├── ';
                const childPath = (path === '/' ? '/' : path + '/') + name;
                const child = Store.data.files[childPath];
                const isDir = child && child.type === 'folder';
                print(prefix + branch + name + (isDir ? '/' : ''));
                if (isDir) walk(childPath, prefix + (isLast ? '    ' : '│   '));
              });
            })('/home', '');
          },
          mkdir: function (a) {
            if (!a[0]) return print('mkdir: missing operand', 'err');
            const target = resolve(a[0]);
            if (Store.data.files[target]) return print('mkdir: ' + a[0] + ': File exists', 'err');
            const parent = target.replace(/\/[^/]+$/, '') || '/';
            const parentNode = Store.data.files[parent];
            if (!parentNode || parentNode.type !== 'folder') return print('mkdir: ' + a[0] + ': No such directory', 'err');
            const name = target.split('/').pop();
            Store.data.files[target] = { type: 'folder', children: [] };
            parentNode.children.push(name);
            Store.save(); toast('Folder "' + name + '" created', 'success');
          },
          touch: function (a) {
            if (!a[0]) return print('touch: missing operand', 'err');
            const target = resolve(a[0]);
            if (Store.data.files[target]) return print('touch: ' + a[0] + ': File exists', 'err');
            const parent = target.replace(/\/[^/]+$/, '') || '/';
            const parentNode = Store.data.files[parent];
            if (!parentNode || parentNode.type !== 'folder') return print('touch: ' + a[0] + ': No such directory', 'err');
            const name = target.split('/').pop();
            Store.data.files[target] = { type: 'file', content: '' };
            parentNode.children.push(name);
            Store.save();
          },
          cat: function (a) {
            if (!a[0]) return print('cat: missing operand', 'err');
            const target = resolve(a[0]);
            const node = Store.data.files[target];
            if (!node) return print('cat: ' + a[0] + ': No such file', 'err');
            if (node.type === 'folder') return print('cat: ' + a[0] + ': Is a directory', 'err');
            print(node.content || '(empty file)', node.content ? '' : 'dim');
          },
          rm: function (a) {
            if (!a[0]) return print('rm: missing operand', 'err');
            const target = resolve(a[0]);
            const node = Store.data.files[target];
            if (!node) return print('rm: ' + a[0] + ': No such file', 'err');
            if (target === HOME || target === '/') return print('rm: ' + a[0] + ': Permission denied', 'err');
            const parent = target.replace(/\/[^/]+$/, '') || '/';
            const parentNode = Store.data.files[parent];
            if (parentNode) parentNode.children = parentNode.children.filter(function (c) { return c !== target.split('/').pop(); });
            Object.keys(Store.data.files).forEach(function (p) {
              if (p === target || p.indexOf(target + '/') === 0) delete Store.data.files[p];
            });
            Store.save(); toast('Removed "' + a[0] + '"', 'success');
          },
          neofetch: function () {
            printRaw('<span class="hl">      /\\      </span>  <span class="hl">teros@forest</span>');
            printRaw('<span class="hl">     /  \\     </span>  ------------');
            printRaw('<span class="hl">    /    \\    </span>  OS: TerOS 1.0');
            printRaw('<span class="hl">   /  /\\  \\   </span>  Kernel: TerKernel');
            printRaw('<span class="hl">  /  /  \\  \\  </span>  Shell: tsh');
            printRaw('<span class="hl"> /__/    \\__\\ </span>  WM: TerWM');
            printRaw('                Resolution: ' + window.innerWidth + 'x' + window.innerHeight);
            printRaw('                Uptime: ' + Math.floor(performance.now() / 60000) + ' min');
          },
          coffee: function () {
            print('Brewing...');
            setTimeout(function () { print('☕ Error: coffee module not installed.'); }, 400);
            setTimeout(function () { print('   Try: sudo apt-get install caffeine', 'dim'); }, 800);
            setTimeout(function () { print('   (or just go make one yourself)', 'dim'); }, 1100);
          },
          moss: function () {
            const quotes = [
              'The forest is not a resource. It is a conversation.',
              'Moss does not hurry, yet it covers the stone.',
              'To plant a tree is to believe in tomorrow.',
              'The clearest way into the universe is through a forest.',
              'A tree\'s roots go deep in silence.',
              'In every walk with nature, one receives far more than he seeks.',
              'The best time to plant a tree was 20 years ago. The second best time is now.'
            ];
            const q = quotes[Math.floor(Math.random() * quotes.length)];
            print('');
            printRaw('<span class="dim">  ' + q + '</span>');
            print('');
            print('— from the TerOS garden', 'dim');
          },
          sudo: function (a) {
            if ((a[0] || '').toLowerCase() === 'forest') {
              print('Entering the forest...', 'dim');
              setTimeout(function () {
                printRaw('<span class="hl">Trees: 8,421</span>');
                printRaw('<span class="hl">Moss: growing</span>');
                printRaw('<span class="hl">Air:  clean</span>');
                printRaw('<span class="hl">You:  welcome</span>');
                document.body.style.transition = 'filter 1.5s';
                document.body.style.filter = 'hue-rotate(20deg) saturate(1.3)';
                setTimeout(function () { document.body.style.filter = ''; }, 2500);
              }, 500);
            } else {
              print('teros is not in the sudoers file. This incident has been logged.', 'err');
            }
          }
        };
        input.addEventListener('keydown', function (e) {
          if (e.key !== 'Enter') return;
          const raw = input.value;
          input.value = '';
          print('teros@forest:' + short(cwd) + '$ ' + raw, 'in');
          const trimmed = raw.trim();
          if (!trimmed) return;
          const parts = trimmed.split(/\s+/);
          const cmd = parts[0].toLowerCase();
          const args = parts.slice(1);
          const fn = CMDS[cmd];
          if (typeof fn === 'function') {
            try { fn(args); }
            catch (err) { print('Error: ' + err.message, 'err'); }
          } else {
            print('teros: command not found: ' + cmd, 'err');
            print("Type 'help' for available commands.", 'dim');
            const suggestions = ['help', 'ls', 'tree', 'neofetch', 'moss'].filter(function (c) {
              return cmd.charAt(0) && c.charAt(0) === cmd.charAt(0);
            });
            if (suggestions.length) print('Did you mean: ' + suggestions.join(', ') + '?', 'dim');
          }
        });
        body.addEventListener('mousedown', function (e) {
          if (!e.target.closest('button, input, a')) setTimeout(function () { input.focus(); }, 0);
        });
        printRaw('<span class="hl">TerOS Terminal — v1.0</span>');
        print('Type "help" to get started. Try "neofetch".', 'dim');
        print('');
        updatePrompt();
        setTimeout(function () { input.focus(); }, 80);
      }
    });
  }

  /* Notes */
  function launchNotes() {
    WM.open('notes', {
      title: 'Notes', width: 700, height: 480,
      icon: svgIcon('notes', 14),
      render: function (body) {
        body.classList.add('notes');
        body.innerHTML =
          '<div class="notes-side">' +
            '<div class="notes-toolbar">' +
              '<button class="btn primary" id="n-new" style="width:100%;justify-content:center;">' + svgIcon('plus', 12) + ' New</button>' +
              '<input class="notes-search" id="n-search" placeholder="Search notes..." autocomplete="off">' +
            '</div>' +
            '<div class="notes-list" id="n-list"></div>' +
          '</div>' +
          '<div class="notes-editor" id="n-editor"></div>';

        const list = $('#n-list', body);
        const editorPane = $('#n-editor', body);
        const searchInput = $('#n-search', body);
        let activeId = null;
        let searchTerm = '';

        function filteredNotes() {
          const all = Store.data.notes.slice().sort(function (a, b) { return b.updated - a.updated; });
          if (!searchTerm) return all;
          const q = searchTerm.toLowerCase();
          return all.filter(function (n) {
            return (n.title || '').toLowerCase().indexOf(q) !== -1 ||
                   (n.body || '').toLowerCase().indexOf(q) !== -1;
          });
        }

        function renderList() {
          list.innerHTML = '';
          const notes = filteredNotes();
          if (notes.length === 0) {
            list.innerHTML = '<div class="empty" style="padding:20px 8px;font-size:11.5px;">' + (searchTerm ? 'No matches' : 'No notes yet') + '</div>';
            return;
          }
          notes.forEach(function (n) {
            const item = el('div', {
              class: 'note-item' + (n.id === activeId ? ' active' : ''),
              html: escapeHtml(n.title || 'Untitled') + '<span class="date">' + relativeTime(n.updated) + '</span>'
            });
            item.addEventListener('click', function () { activeId = n.id; renderList(); renderEditor(); });
            list.appendChild(item);
          });
        }

        function renderEditor() {
          const note = Store.data.notes.find(function (n) { return n.id === activeId; });
          if (!note) {
            editorPane.innerHTML = '<div class="empty-state">' + svgIcon('notes', 36) + '<div>Select or create a note</div></div>';
            return;
          }
          editorPane.innerHTML =
            '<div class="notes-title-row">' +
              '<input class="notes-title-input" id="n-title" placeholder="Untitled" value="' + escapeHtml(note.title) + '">' +
              '<button class="btn danger" id="n-del">' + svgIcon('trash', 12) + '</button>' +
            '</div>' +
            '<textarea class="notes-text" id="n-body" placeholder="Start writing...">' + escapeHtml(note.body) + '</textarea>';

          const titleInput = $('#n-title', editorPane);
          const bodyInput = $('#n-body', editorPane);
          let t;
          function autosave() {
            note.title = titleInput.value;
            note.body = bodyInput.value;
            note.updated = Date.now();
            Store.save(); renderList();
          }
          function debounced() { clearTimeout(t); t = setTimeout(autosave, 400); }
          titleInput.addEventListener('input', debounced);
          bodyInput.addEventListener('input', debounced);

          $('#n-del', editorPane).addEventListener('click', function () {
            if (!confirm('Delete this note?')) return;
            Store.data.notes = Store.data.notes.filter(function (n) { return n.id !== activeId; });
            activeId = Store.data.notes[0] ? Store.data.notes[0].id : null;
            Store.save(); renderList(); renderEditor();
            toast('Note deleted', 'success');
          });
          setTimeout(function () { bodyInput.focus(); }, 30);
        }

        searchInput.addEventListener('input', function () {
          searchTerm = searchInput.value.trim(); renderList();
        });

        $('#n-new', body).addEventListener('click', function () {
          const id = 'n' + Date.now();
          Store.data.notes.unshift({ id: id, title: 'New note', body: '', updated: Date.now() });
          activeId = id;
          Store.save(); renderList(); renderEditor();
        });

        if (Store.data.notes.length > 0) activeId = Store.data.notes[0].id;
        renderList(); renderEditor();
      }
    });
  }

  /* Files */
  function launchFiles() {
    WM.open('files', {
      title: 'Files', width: 660, height: 460,
      icon: svgIcon('files', 14),
      render: function (body) {
        body.classList.add('files');
        body.innerHTML =
          '<div class="files-toolbar">' +
            '<button class="btn" id="f-back">' + svgIcon('arrow_left', 12) + '</button>' +
            '<input class="file-search" id="f-search" placeholder="Search this folder..." autocomplete="off">' +
            '<select class="sort-select" id="f-sort">' +
              '<option value="name">Name</option>' +
              '<option value="kind">Kind</option>' +
              '<option value="size">Size</option>' +
            '</select>' +
            '<button class="btn" id="f-refresh">' + svgIcon('refresh', 12) + '</button>' +
          '</div>' +
          '<div class="breadcrumb" id="f-crumb"></div>' +
          '<div class="files-list" id="f-list"></div>' +
          '<div class="files-actions">' +
            '<button class="btn" id="f-folder">' + svgIcon('plus', 12) + ' Folder</button>' +
            '<button class="btn" id="f-file">' + svgIcon('plus', 12) + ' File</button>' +
          '</div>';

        let cwd = '/home';
        let searchTerm = '';
        let sortMode = 'name';
        const searchInput = $('#f-search', body);
        const sortSelect = $('#f-sort', body);
        function getNode(p) { return Store.data.files[p]; }

        function deletePath(path) {
          const parent = path.replace(/\/[^/]+$/, '') || '/';
          const parentNode = Store.data.files[parent];
          if (parentNode) parentNode.children = parentNode.children.filter(function (c) { return c !== path.split('/').pop(); });
          Object.keys(Store.data.files).forEach(function (p) {
            if (p === path || p.indexOf(path + '/') === 0) delete Store.data.files[p];
          });
          Store.save();
        }

        function renamePath(path, newName) {
          const parent = path.replace(/\/[^/]+$/, '') || '/';
          const parentNode = Store.data.files[parent];
          const oldName = path.split('/').pop();
          const newNodePath = (parent === '/' ? '' : parent) + '/' + newName;
          if (Store.data.files[newNodePath]) { toast('Name already exists', 'error'); return false; }
          Store.data.files[newNodePath] = Store.data.files[path];
          delete Store.data.files[path];
          if (parentNode) parentNode.children = parentNode.children.map(function (c) { return c === oldName ? newName : c; });
          Object.keys(Store.data.files).forEach(function (p) {
            if (p.indexOf(path + '/') === 0) {
              const np = newNodePath + p.slice(path.length);
              Store.data.files[np] = Store.data.files[p];
              delete Store.data.files[p];
            }
          });
          Store.save(); return true;
        }

        function movePath(srcPath, destDir) {
          const srcName = srcPath.split('/').pop();
          if (!Store.data.files[destDir] || Store.data.files[destDir].type !== 'folder') { toast('Destination is not a folder', 'error'); return false; }
          if (destDir === srcPath || destDir.indexOf(srcPath + '/') === 0) { toast('Cannot move a folder into itself', 'error'); return false; }
          const destPath = (destDir === '/' ? '' : destDir) + '/' + srcName;
          if (Store.data.files[destPath]) { toast('A file with that name already exists there', 'error'); return false; }
          const oldParent = srcPath.replace(/\/[^/]+$/, '') || '/';
          const oldParentNode = Store.data.files[oldParent];
          if (oldParentNode) oldParentNode.children = oldParentNode.children.filter(function (c) { return c !== srcName; });
          Store.data.files[destDir].children.push(srcName);
          const toMove = [];
          Object.keys(Store.data.files).forEach(function (p) { if (p === srcPath || p.indexOf(srcPath + '/') === 0) toMove.push(p); });
          toMove.forEach(function (p) {
            const newPath = destPath + p.slice(srcPath.length);
            Store.data.files[newPath] = Store.data.files[p];
            delete Store.data.files[p];
          });
          Store.save(); return true;
        }

        function renderCrumbs() {
          const crumbs = $('#f-crumb', body);
          crumbs.innerHTML = '';
          const parts = cwd === '/' ? [''] : cwd.split('/');
          parts.forEach(function (p, i) {
            const isLast = i === parts.length - 1;
            const path = i === 0 ? '/' : '/' + parts.slice(1, i + 1).join('/');
            const label = i === 0 ? 'Home' : (p || 'Home');
            const c = el('span', { class: 'crumb' + (isLast ? ' last' : ''), html: escapeHtml(label) });
            c.addEventListener('click', function () { cwd = path; searchInput.value = ''; searchTerm = ''; render(); });
            crumbs.appendChild(c);
            if (!isLast) crumbs.appendChild(el('span', { class: 'sep', html: '/' }));
          });
        }

        function render() {
          const node = getNode(cwd);
          if (!node || node.type !== 'folder') { cwd = '/home'; return render(); }
          renderCrumbs();
          const listEl = $('#f-list', body);
          listEl.innerHTML = '';
          let items = node.children.slice();
          if (searchTerm) {
            const q = searchTerm.toLowerCase();
            items = items.filter(function (name) { return name.toLowerCase().indexOf(q) !== -1; });
          }
          if (items.length === 0) {
            listEl.innerHTML = '<div class="empty-state">' + svgIcon('folder', 36) + '<div>' + (searchTerm ? 'No matches in this folder' : 'This folder is empty') + '</div></div>';
            return;
          }
          items.sort(function (a, b) {
            const ap = (cwd === '/' ? '/' : cwd + '/') + a;
            const bp = (cwd === '/' ? '/' : cwd + '/') + b;
            const an = getNode(ap), bn = getNode(bp);
            const aDir = an && an.type === 'folder';
            const bDir = bn && bn.type === 'folder';
            if (aDir !== bDir) return aDir ? -1 : 1;
            if (sortMode === 'kind') {
              const ak = aDir ? 'folder' : (a.split('.').pop() || '');
              const bk = bDir ? 'folder' : (b.split('.').pop() || '');
              return ak.localeCompare(bk) || a.localeCompare(b);
            }
            if (sortMode === 'size') {
              const as = an && an.type === 'file' ? (an.content || '').length : -1;
              const bs = bn && bn.type === 'file' ? (bn.content || '').length : -1;
              return bs - as;
            }
            return a.localeCompare(b);
          });

          items.forEach(function (name) {
            const childPath = (cwd === '/' ? '/' : cwd + '/') + name;
            const child = getNode(childPath);
            if (!child) return;
            const isDir = child.type === 'folder';
            const row = el('div', { class: 'file-row' + (isDir ? ' folder' : '') });
            row.innerHTML = svgIcon(isDir ? 'folder' : 'file', 18) +
              '<span>' + escapeHtml(name) + '</span>' +
              '<span class="meta">' + (isDir ? (child.children.length + ' items') : ((child.content || '').length + ' chars')) + '</span>';

            row.addEventListener('dblclick', function () {
              if (isDir) { cwd = childPath; searchInput.value = ''; searchTerm = ''; render(); }
              else {
                if (!WM.windows.notes) launchNotes();
                setTimeout(function () {
                  const id = 'n' + Date.now();
                  Store.data.notes.unshift({ id: id, title: name.replace(/\.txt$/i, ''), body: child.content || '', updated: Date.now() });
                  Store.save();
                  WM.close('notes');
                  setTimeout(function () { launchNotes(); }, 150);
                }, 100);
              }
            });

            row.addEventListener('contextmenu', function (e) {
              e.preventDefault();
              const action = prompt('Rename, "move", or "delete":', name);
              if (action === null) return;
              const a = action.trim().toLowerCase();
              if (a === 'delete') {
                if (!confirm('Delete "' + name + '"?')) return;
                deletePath(childPath); render(); toast('Deleted', 'success');
              } else if (a === 'move') {
                const dest = prompt('Move "' + name + '" to which folder?', '/home');
                if (!dest || !dest.trim()) return;
                if (movePath(childPath, dest.trim())) { render(); toast('Moved to ' + dest.trim(), 'success'); }
              } else if (action && action.trim() !== name) {
                if (renamePath(childPath, action.trim())) { render(); toast('Renamed', 'success'); }
              }
            });
            listEl.appendChild(row);
          });
        }

        searchInput.addEventListener('input', function () { searchTerm = searchInput.value.trim(); render(); });
        sortSelect.addEventListener('change', function () { sortMode = sortSelect.value; render(); });
        $('#f-back', body).addEventListener('click', function () {
          if (cwd === '/' || cwd === '/home') return;
          cwd = cwd.replace(/\/[^/]+$/, '') || '/';
          searchInput.value = ''; searchTerm = ''; render();
        });
        $('#f-refresh', body).addEventListener('click', render);
        $('#f-folder', body).addEventListener('click', function () {
          const name = prompt('Folder name:', 'New Folder');
          if (!name || !name.trim()) return;
          const path = (cwd === '/' ? '' : cwd) + '/' + name.trim();
          if (Store.data.files[path]) return toast('Name already exists', 'error');
          Store.data.files[path] = { type: 'folder', children: [] };
          Store.data.files[cwd].children.push(name.trim());
          Store.save(); render(); toast('Folder created', 'success');
        });
        $('#f-file', body).addEventListener('click', function () {
          const name = prompt('File name:', 'untitled.txt');
          if (!name || !name.trim()) return;
          const path = (cwd === '/' ? '' : cwd) + '/' + name.trim();
          if (Store.data.files[path]) return toast('Name already exists', 'error');
          Store.data.files[path] = { type: 'file', content: '' };
          Store.data.files[cwd].children.push(name.trim());
          Store.save(); render(); toast('File created', 'success');
        });

        render();
      }
    });
  }

  /* Garden */
  const GARDEN_STAGES = [
    { key: 'seed',      name: 'Seed',         threshold: 0 },
    { key: 'sprout',    name: 'Sprout',       threshold: 20 },
    { key: 'young',     name: 'Young Plant',  threshold: 45 },
    { key: 'mature',    name: 'Mature Plant', threshold: 75 },
    { key: 'flowering', name: 'Flowering',    threshold: 95 }
  ];

  function stageOf(growth) {
    let s = GARDEN_STAGES[0];
    GARDEN_STAGES.forEach(function (st) { if (growth >= st.threshold) s = st; });
    return s;
  }

  function applyNaturalGrowth() {
    if (!Store.data || !Store.data.plant) return;
    const p = Store.data.plant;
    const minutes = Math.floor((Date.now() - p.lastWater) / 60000);
    if (minutes > 0) {
      p.growth = Math.min(100, p.growth + minutes);
      p.lastWater = Date.now();
      Store.save();
    }
  }


  function plantSVG(growth) {
    const stage = stageOf(growth);
    const cx = 100;
    const groundY = 178;

    const defs =
      '<defs>' +
        '<radialGradient id="psoil" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#3d2a1a"/><stop offset="100%" stop-color="#150c06"/></radialGradient>' +
        '<linearGradient id="pleaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a8d8a8"/><stop offset="40%" stop-color="#6db075"/><stop offset="100%" stop-color="#2a4a30"/></linearGradient>' +
        '<linearGradient id="pleafDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7fa87f"/><stop offset="100%" stop-color="#1e3422"/></linearGradient>' +
        '<linearGradient id="pleafBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4a7c59"/><stop offset="100%" stop-color="#16281a"/></linearGradient>' +
        '<linearGradient id="pstem" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#2e5536"/><stop offset="45%" stop-color="#8fbf94"/><stop offset="100%" stop-color="#1e3a24"/></linearGradient>' +
        '<linearGradient id="pbark" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#1e1208"/><stop offset="25%" stop-color="#5a3d24"/><stop offset="55%" stop-color="#a8885a"/><stop offset="75%" stop-color="#6b4a2a"/><stop offset="100%" stop-color="#150c06"/></linearGradient>' +
        '<radialGradient id="ppetal" cx="50%" cy="30%" r="70%"><stop offset="0%" stop-color="#fff2f7"/><stop offset="45%" stop-color="#eab8ce"/><stop offset="100%" stop-color="#9c5e7c"/></radialGradient>' +
        '<radialGradient id="ppetal2" cx="50%" cy="30%" r="70%"><stop offset="0%" stop-color="#fff8e8"/><stop offset="45%" stop-color="#f4c88a"/><stop offset="100%" stop-color="#a86a28"/></radialGradient>' +
        '<radialGradient id="pcenter" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffeaa0"/><stop offset="100%" stop-color="#b8801a"/></radialGradient>' +
        '<radialGradient id="pground" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#1a1006" stop-opacity="0.75"/><stop offset="100%" stop-color="#1a1006" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="pdew" cx="30%" cy="30%" r="70%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="100%" stop-color="#a8c8a8" stop-opacity="0.4"/></radialGradient>' +
      '</defs>';

    const ground =
      '<ellipse cx="' + cx + '" cy="' + groundY + '" rx="76" ry="14" fill="url(#psoil)"/>' +
      '<ellipse cx="' + (cx - 22) + '" cy="' + (groundY - 4) + '" rx="26" ry="3" fill="#4a3420" opacity="0.5"/>' +
      '<ellipse cx="' + (cx + 16) + '" cy="' + (groundY - 3) + '" rx="18" ry="2" fill="#4a3420" opacity="0.4"/>' +
      '<ellipse cx="' + (cx - 42) + '" cy="' + (groundY + 2) + '" rx="4" ry="1.8" fill="#6b4a2a" opacity="0.55"/>' +
      '<ellipse cx="' + (cx + 36) + '" cy="' + (groundY + 4) + '" rx="3" ry="1.4" fill="#5a3d24" opacity="0.55"/>' +
      '<ellipse cx="' + (cx - 12) + '" cy="' + (groundY + 5) + '" rx="2.5" ry="1" fill="#4a3420" opacity="0.5"/>' +
      '<ellipse cx="' + (cx - 30) + '" cy="' + (groundY + 6) + '" rx="8" ry="2" fill="#5f9d6a" opacity="0.35"/>' +
      '<ellipse cx="' + (cx + 30) + '" cy="' + (groundY + 5) + '" rx="6" ry="1.6" fill="#4a7c59" opacity="0.3"/>' +
      '<ellipse cx="' + cx + '" cy="' + (groundY + 7) + '" rx="62" ry="8" fill="url(#pground)"/>';

    function detailedLeaf(px, py, len, angle, gradId, light) {
      const half = len * 0.42;
      let veins = '';
      for (let i = 1; i <= 3; i++) {
        const t = i / 4, vx = len * t, vy = half * 0.7 * (1 - t * 0.5);
        veins += '<path d="M' + (len * t) + ' 0 L' + (vx - len * 0.1) + ' ' + (-vy) + '" stroke="#1e3a24" stroke-width="0.3" opacity="0.45"/>';
        veins += '<path d="M' + (len * t) + ' 0 L' + (vx - len * 0.1) + ' ' + vy + '" stroke="#1e3a24" stroke-width="0.3" opacity="0.45"/>';
      }
      return '<g transform="translate(' + px + ' ' + py + ') rotate(' + angle + ')">' +
        '<path d="M0 0 Q' + (len * 0.3) + ' ' + (-half) + ' ' + (len * 0.7) + ' ' + (-half * 0.7) + ' Q' + len + ' ' + (-half * 0.2) + ' ' + len + ' 0 Q' + len + ' ' + half + ' ' + (len * 0.5) + ' ' + half + ' Q' + (len * 0.2) + ' ' + (half * 0.6) + ' 0 0 Z" fill="url(#' + gradId + ')"/>' +
        '<path d="M0 0 L' + len + ' 0" stroke="#1e3a24" stroke-width="0.5" opacity="0.55"/>' + veins +
        (light ? '<ellipse cx="' + (len * 0.35) + '" cy="' + (-half * 0.3) + '" rx="' + (len * 0.28) + '" ry="' + (half * 0.25) + '" fill="#d8efd8" opacity="0.35"/>' : '') +
        '</g>';
    }

    function dewDrop(px, py, r) {
      return '<circle cx="' + px + '" cy="' + py + '" r="' + r + '" fill="url(#pdew)"/>' +
        '<circle cx="' + (px - r * 0.35) + '" cy="' + (py - r * 0.35) + '" r="' + (r * 0.35) + '" fill="#ffffff" opacity="0.85"/>';
    }

    if (stage.key === 'seed') {
      return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">' + defs + ground +
        '<ellipse cx="' + cx + '" cy="' + (groundY - 6) + '" rx="14" ry="4" fill="#1a1006" opacity="0.5"/>' +
        '<ellipse cx="' + cx + '" cy="' + (groundY - 9) + '" rx="11" ry="8" fill="#3d2a1a" transform="rotate(-15 ' + cx + ' ' + (groundY - 9) + ')"/>' +
        '<ellipse cx="' + cx + '" cy="' + (groundY - 10) + '" rx="10.5" ry="7.5" fill="#8a6a3a" transform="rotate(-15 ' + cx + ' ' + (groundY - 10) + ')"/>' +
        '<ellipse cx="' + (cx - 3) + '" cy="' + (groundY - 13) + '" rx="4.5" ry="2.8" fill="#d8b878" opacity="0.7"/>' +
        '<path d="M' + (cx - 7) + ' ' + (groundY - 6) + ' Q' + cx + ' ' + (groundY - 3) + ' ' + (cx + 6) + ' ' + (groundY - 9) + '" stroke="#3d2a1a" stroke-width="0.7" fill="none" opacity="0.55"/>' +
        '<path d="M' + (cx + 1) + ' ' + (groundY - 15) + ' q -1 -4 1 -8" stroke="#7fa87f" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="' + (cx + 2) + '" cy="' + (groundY - 24) + '" rx="3" ry="2" fill="url(#pleaf)" transform="rotate(20 ' + (cx + 2) + ' ' + (groundY - 24) + ')"/>' +
        dewDrop(cx + 3, groundY - 25, 1.1) +
        '</svg>';
    }
    if (stage.key === 'sprout') {
      const h = 22 + (growth - 20) * 0.7;
      const topY = groundY - h;
      return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">' + defs + ground +
        '<path d="M' + cx + ' ' + groundY + ' Q' + (cx - 2.5) + ' ' + (groundY - h / 2) + ' ' + cx + ' ' + topY + '" stroke="url(#pstem)" stroke-width="2.8" fill="none" stroke-linecap="round"/>' +
        '<path d="M' + (cx - 0.8) + ' ' + (groundY - 4) + ' Q' + (cx - 3) + ' ' + (groundY - h / 2) + ' ' + (cx - 0.8) + ' ' + (topY + 2) + '" stroke="#e8f4e8" stroke-width="0.7" fill="none" opacity="0.55"/>' +
        detailedLeaf(cx - 1, topY + 7, 14, -158, 'pleaf', true) +
        detailedLeaf(cx + 1, topY + 5, 13, -22, 'pleaf', true) +
        detailedLeaf(cx - 1, topY + 14, 10, -170, 'pleafDark', false) +
        detailedLeaf(cx + 1, topY + 16, 9, -10, 'pleafDark', false) +
        '<ellipse cx="' + cx + '" cy="' + (topY - 2) + '" rx="4.5" ry="3" fill="url(#pleafDark)"/>' +
        dewDrop(cx + 9, topY + 4, 1.5) +
        dewDrop(cx - 8, topY + 8, 1.2) +
        '</svg>';
    }
    if (stage.key === 'young') {
      const h = 64 + (growth - 45) * 1.6;
      const topY = groundY - h;
      const layout = [
        { x: cx - 3, y: groundY - 22, len: 18, ang: -160, grad: 'pleafBack', light: false },
        { x: cx + 3, y: groundY - 26, len: 17, ang: -20,  grad: 'pleafBack', light: false },
        { x: cx - 3, y: groundY - 40, len: 17, ang: -168, grad: 'pleafDark', light: false },
        { x: cx + 3, y: groundY - 44, len: 16, ang: -12,  grad: 'pleaf',     light: true },
        { x: cx - 2, y: groundY - 56, len: 15, ang: -172, grad: 'pleaf',     light: true },
        { x: cx + 2, y: groundY - 60, len: 14, ang: -8,   grad: 'pleafDark', light: false },
        { x: cx - 1, y: topY + 8,    len: 12, ang: -155, grad: 'pleaf',     light: true },
        { x: cx + 1, y: topY + 6,    len: 12, ang: -25,  grad: 'pleaf',     light: true }
      ];
      let leaves = '';
      layout.forEach(function (l) { leaves += detailedLeaf(l.x, l.y, l.len, l.ang, l.grad, l.light); });
      return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">' + defs + ground +
        '<path d="M' + cx + ' ' + groundY + ' Q' + (cx - 3.5) + ' ' + (groundY - h / 2) + ' ' + cx + ' ' + topY + '" stroke="url(#pstem)" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        '<path d="M' + (cx - 1.2) + ' ' + (groundY - 4) + ' Q' + (cx - 4.5) + ' ' + (groundY - h / 2) + ' ' + (cx - 1.2) + ' ' + (topY + 3) + '" stroke="#e8f4e8" stroke-width="0.9" fill="none" opacity="0.5"/>' +
        leaves +
        '<ellipse cx="' + cx + '" cy="' + (topY - 3) + '" rx="4" ry="2.6" fill="url(#pleafDark)"/>' +
        dewDrop(cx + 11, groundY - 24, 1.6) +
        dewDrop(cx - 10, groundY - 42, 1.4) +
        '</svg>';
    }
    if (stage.key === 'mature') {
      const h = 94 + (growth - 75) * 1.8;
      const topY = groundY - h;
      const trunkW = 7;
      const b1Y = groundY - h * 0.42;
      const b2Y = groundY - h * 0.58;
      const b3Y = groundY - h * 0.74;
      const b4Y = groundY - h * 0.86;
      function foliage(cx0, cy0, r, baseGrad) {
        let out = '';
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + 0.3;
          out += detailedLeaf(cx0 + Math.cos(a) * r * 0.9, cy0 + Math.sin(a) * r * 0.7, r * 0.75, a * 180 / Math.PI, 'pleafBack', false);
        }
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + 1.1;
          out += detailedLeaf(cx0 + Math.cos(a) * r * 0.65, cy0 + Math.sin(a) * r * 0.5, r * 0.75, a * 180 / Math.PI, baseGrad, i % 2 === 0);
        }
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2 + 2.3;
          out += detailedLeaf(cx0 + Math.cos(a) * r * 0.4, cy0 + Math.sin(a) * r * 0.35, r * 0.7, a * 180 / Math.PI, 'pleaf', true);
        }
        return out;
      }
      return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">' + defs + ground +
        '<path d="M' + (cx - trunkW / 2) + ' ' + groundY + ' Q' + (cx - trunkW / 2 - 1.5) + ' ' + (groundY - h / 2) + ' ' + (cx - 2.5) + ' ' + topY + '" stroke="url(#pbark)" stroke-width="' + trunkW + '" fill="none" stroke-linecap="round"/>' +
        '<path d="M' + (cx - trunkW / 2 - 1) + ' ' + groundY + ' Q' + (cx - trunkW - 3) + ' ' + (groundY - 3) + ' ' + (cx - trunkW / 2 - 1) + ' ' + (groundY - 6) + '" stroke="url(#pbark)" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<path d="M' + (cx + trunkW / 2 + 1) + ' ' + groundY + ' Q' + (cx + trunkW + 3) + ' ' + (groundY - 3) + ' ' + (cx + trunkW / 2 + 1) + ' ' + (groundY - 6) + '" stroke="url(#pbark)" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="' + cx + '" cy="' + groundY + '" rx="' + (trunkW * 0.95) + '" ry="3.5" fill="#2c1c10"/>' +
        '<ellipse cx="' + (cx - 1) + '" cy="' + (groundY - h * 0.4) + '" rx="1.5" ry="2" fill="#1e1208" opacity="0.7"/>' +
        '<ellipse cx="' + (cx + 1) + '" cy="' + (groundY - h * 0.62) + '" rx="1.2" ry="1.6" fill="#1e1208" opacity="0.6"/>' +
        '<path d="M' + (cx - 1.5) + ' ' + (groundY - 6) + ' Q' + (cx - 2.5) + ' ' + (groundY - h * 0.5) + ' ' + (cx - 1) + ' ' + topY + '" stroke="#c9a878" stroke-width="0.8" fill="none" opacity="0.45"/>' +
        '<path d="M' + (cx - 1) + ' ' + b1Y + ' Q' + (cx - 15) + ' ' + (b1Y - 6) + ' ' + (cx - 26) + ' ' + (b1Y - 14) + '" stroke="url(#pbark)" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
        '<path d="M' + (cx + 1) + ' ' + b2Y + ' Q' + (cx + 15) + ' ' + (b2Y - 6) + ' ' + (cx + 26) + ' ' + (b2Y - 13) + '" stroke="url(#pbark)" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
        '<path d="M' + (cx - 0.5) + ' ' + b3Y + ' Q' + (cx - 10) + ' ' + (b3Y - 8) + ' ' + (cx - 18) + ' ' + (b3Y - 15) + '" stroke="url(#pbark)" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<path d="M' + (cx + 0.5) + ' ' + b4Y + ' Q' + (cx + 9) + ' ' + (b4Y - 6) + ' ' + (cx + 15) + ' ' + (b4Y - 12) + '" stroke="url(#pbark)" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        foliage(cx - 28, b1Y - 20, 14, 'pleafDark') +
        foliage(cx + 28, b2Y - 18, 14, 'pleafDark') +
        foliage(cx - 20, b3Y - 20, 11, 'pleaf') +
        foliage(cx + 16, b4Y - 16, 10, 'pleaf') +
        foliage(cx, topY - 4, 16, 'pleaf') +
        foliage(cx - 8, topY + 4, 11, 'pleafDark') +
        foliage(cx + 9, topY - 1, 11, 'pleafDark') +
        dewDrop(cx + 12, groundY - 30, 1.4) +
        '</svg>';
    }

    // flowering
    const h = 114 + (growth - 95) * 2.4;
    const topY = groundY - h;
    const trunkW = 9;
    function flower(fx, fy, size, hue) {
      let out = '<g transform="translate(' + fx + ' ' + fy + ')">';
      const grad = hue === 'gold' ? 'ppetal2' : 'ppetal';
      for (let a = 0; a < 5; a++) {
        const angle = a * 72 + 15;
        out += '<g transform="rotate(' + angle + ')">' +
          '<path d="M0 0 Q-' + (size * 0.55) + ' ' + (-size * 0.85) + ' 0 ' + (-size * 1.5) + ' Q' + (size * 0.55) + ' ' + (-size * 0.85) + ' 0 0 Z" fill="url(#' + grad + ')"/>' +
          '<path d="M0 -' + (size * 0.15) + ' L0 -' + (size * 1.35) + '" stroke="#a1205c" stroke-width="0.4" opacity="0.55"/>' +
        '</g>';
      }
      out += '<circle cx="0" cy="0" r="' + (size * 0.5) + '" fill="url(#pcenter)"/>';
      out += '<circle cx="0" cy="0" r="' + (size * 0.22) + '" fill="#99580e"/>';
      for (let s = 0; s < 6; s++) {
        const a = s * 60 * Math.PI / 180;
        out += '<circle cx="' + (Math.cos(a) * size * 0.32) + '" cy="' + (Math.sin(a) * size * 0.32) + '" r="' + (size * 0.08) + '" fill="#ffeaa0"/>';
      }
      out += '</g>';
      return out;
    }
    function denseFoliage(cx0, cy0, r) {
      let out = '';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        out += detailedLeaf(cx0 + Math.cos(a) * r * 0.9, cy0 + Math.sin(a) * r * 0.7, r * 0.7, a * 180 / Math.PI, 'pleafBack', false);
      }
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + 0.5;
        out += detailedLeaf(cx0 + Math.cos(a) * r * 0.6, cy0 + Math.sin(a) * r * 0.5, r * 0.7, a * 180 / Math.PI, 'pleafDark', i % 2 === 0);
      }
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + 1.4;
        out += detailedLeaf(cx0 + Math.cos(a) * r * 0.35, cy0 + Math.sin(a) * r * 0.3, r * 0.65, a * 180 / Math.PI, 'pleaf', true);
      }
      return out;
    }
    const c1 = { x: cx - 36, y: groundY - h * 0.52 };
    const c2 = { x: cx + 38, y: groundY - h * 0.62 };
    const c3 = { x: cx - 22, y: groundY - h * 0.78 };
    const c4 = { x: cx + 20, y: groundY - h * 0.86 };
    const c5 = { x: cx,      y: topY - 2 };
    const c6 = { x: cx - 8,  y: topY + 10 };
    const c7 = { x: cx + 10, y: topY + 12 };
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">' + defs + ground +
      '<path d="M' + (cx - trunkW / 2) + ' ' + groundY + ' Q' + (cx - trunkW / 2 - 2) + ' ' + (groundY - h / 2) + ' ' + (cx - 2.5) + ' ' + topY + '" stroke="url(#pbark)" stroke-width="' + trunkW + '" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="' + cx + '" cy="' + groundY + '" rx="' + (trunkW * 1.15) + '" ry="4" fill="#1b120b"/>' +
      '<ellipse cx="' + (cx - 1.5) + '" cy="' + (groundY - h * 0.3) + '" rx="1.8" ry="2.4" fill="#46270e" opacity="0.65"/>' +
      '<ellipse cx="' + (cx + 2) + '" cy="' + (groundY - h * 0.58) + '" rx="1.4" ry="2" fill="#291504" opacity="0.55"/>' +
      '<path d="M' + (cx - 2) + ' ' + (groundY - h * 0.42) + ' Q' + (cx - 17) + ' ' + (groundY - h * 0.5) + ' ' + (cx - 32) + ' ' + (groundY - h * 0.55) + '" stroke="url(#pbark)" stroke-width="3.8" fill="none" stroke-linecap="round"/>' +
      '<path d="M' + (cx + 2) + ' ' + (groundY - h * 0.55) + ' Q' + (cx + 17) + ' ' + (groundY - h * 0.6) + ' ' + (cx + 34) + ' ' + (groundY - h * 0.65) + '" stroke="url(#pbark)" stroke-width="3.8" fill="none" stroke-linecap="round"/>' +
      '<path d="M' + (cx - 1) + ' ' + (groundY - h * 0.7) + ' Q' + (cx - 12) + ' ' + (groundY - h * 0.78) + ' ' + (cx - 20) + ' ' + (groundY - h * 0.8) + '" stroke="url(#pbark)" stroke-width="2.8" fill="none" stroke-linecap="round"/>' +
      '<path d="M' + (cx + 1) + ' ' + (groundY - h * 0.78) + ' Q' + (cx + 12) + ' ' + (groundY - h * 0.85) + ' ' + (cx + 18) + ' ' + (groundY - h * 0.88) + '" stroke="url(#pbark)" stroke-width="2.8" fill="none" stroke-linecap="round"/>' +
      denseFoliage(c1.x, c1.y, 15) + denseFoliage(c2.x, c2.y, 15) +
      denseFoliage(c3.x, c3.y, 12) + denseFoliage(c4.x, c4.y, 12) +
      denseFoliage(c5.x, c5.y, 16) + denseFoliage(c6.x, c6.y, 11) + denseFoliage(c7.x, c7.y, 11) +
      flower(c1.x - 10, c1.y - 8, 4.2, 'pink') + flower(c1.x + 12, c1.y + 6, 3.6, 'pink') + flower(c1.x + 2, c1.y - 14, 3.4, 'gold') +
      flower(c2.x + 10, c2.y - 5, 4.2, 'pink') + flower(c2.x - 8, c2.y + 8, 3.6, 'pink') +
      flower(c3.x + 7, c3.y + 3, 3.6, 'pink') + flower(c4.x - 5, c4.y + 5, 3.6, 'pink') +
      flower(c5.x + 6, c5.y + 4, 4.4, 'pink') + flower(c5.x - 10, c5.y + 8, 3.2, 'pink') +
      flower(c6.x + 9, c6.y - 1, 3.6, 'pink') + flower(c7.x - 6, c7.y + 3, 3.4, 'pink') +
      '<ellipse cx="' + (cx - 46) + '" cy="' + (groundY - 16) + '" rx="2.6" ry="1.3" fill="#f796c0" opacity="0.75" transform="rotate(30 ' + (cx - 46) + ' ' + (groundY - 16) + ')"/>' +
      '<ellipse cx="' + (cx + 44) + '" cy="' + (groundY - 24) + '" rx="2.6" ry="1.3" fill="#dfb376" opacity="0.65" transform="rotate(-20 ' + (cx + 44) + ' ' + (groundY - 24) + ')"/>' +
      '<circle cx="' + (cx - 48) + '" cy="' + (groundY - 2) + '" r="1.5" fill="#ff006f" opacity="0.7"/>' +
      '<circle cx="' + (cx + 50) + '" cy="' + (groundY + 1) + '" r="1.5" fill="#e08cb1" opacity="0.7"/>' +
      '</svg>';
  }

  function treeSVG(growth) {
    const cx = 100;
    const groundY = 186;
    const defs =
      '<defs>' +
        '<radialGradient id="tsoil" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#2e1c0f"/><stop offset="100%" stop-color="#310b21"/></radialGradient>' +
        '<linearGradient id="tbark" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#0d051a"/><stop offset="20%" stop-color="#37204a"/><stop offset="45%" stop-color="#8b6a44"/><stop offset="65%" stop-color="#a8885a"/><stop offset="85%" stop-color="#5a3d24"/><stop offset="100%" stop-color="#150c06"/></linearGradient>' +
        '<linearGradient id="tbarkDark" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#09030a"/><stop offset="50%" stop-color="#361a3d"/><stop offset="100%" stop-color="#0a0603"/></linearGradient>' +
        '<linearGradient id="tleafDeep" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4a7c59"/><stop offset="100%" stop-color="#190e1e"/></linearGradient>' +
        '<linearGradient id="tleafMid" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#64ad5c"/><stop offset="100%" stop-color="#3e2a4a"/></linearGradient>' +
        '<linearGradient id="tleafBright" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#386825"/><stop offset="100%" stop-color="#685f9d"/></linearGradient>' +
        '<radialGradient id="tglow" cx="50%" cy="40%" r="55%"><stop offset="0%" stop-color="#7bda63" stop-opacity="0.22"/><stop offset="100%" stop-color="#b185c2" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="tground" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#18061a" stop-opacity="0.8"/><stop offset="100%" stop-color="#17061a" stop-opacity="0"/></radialGradient>' +
      '</defs>';

    const ground =
      '<ellipse cx="' + cx + '" cy="' + groundY + '" rx="88" ry="14" fill="url(#tsoil)"/>' +
      '<ellipse cx="' + (cx - 30) + '" cy="' + (groundY - 4) + '" rx="30" ry="3" fill="#4a3420" opacity="0.55"/>' +
      '<ellipse cx="' + (cx + 24) + '" cy="' + (groundY - 3) + '" rx="22" ry="2.4" fill="#4a3420" opacity="0.45"/>' +
      '<ellipse cx="' + (cx - 60) + '" cy="' + (groundY + 2) + '" rx="5" ry="2" fill="#664321" opacity="0.6"/>' +
      '<ellipse cx="' + (cx + 58) + '" cy="' + (groundY + 4) + '" rx="4" ry="1.6" fill="#5a3d24" opacity="0.6"/>' +
      '<ellipse cx="' + (cx - 40) + '" cy="' + (groundY + 7) + '" rx="10" ry="2.4" fill="#4d8658" opacity="0.4"/>' +
      '<ellipse cx="' + (cx + 34) + '" cy="' + (groundY + 6) + '" rx="8" ry="2" fill="#3b6848" opacity="0.35"/>' +
      '<ellipse cx="' + cx + '" cy="' + (groundY + 9) + '" rx="70" ry="9" fill="url(#tground)"/>' +
      '<g transform="translate(' + (cx - 68) + ' ' + (groundY - 2) + ')"><rect x="-0.8" y="-3" width="1.6" height="3" fill="#e8dfc8"/><ellipse cx="0" cy="-3" rx="3.4" ry="1.8" fill="#c97a6a"/><circle cx="-1" cy="-3.4" r="0.5" fill="#f4efe4" opacity="0.8"/></g>' +
      '<g transform="translate(' + (cx + 62) + ' ' + (groundY - 1) + ')"><rect x="-0.6" y="-2.4" width="1.2" height="2.4" fill="#e8dfc8"/><ellipse cx="0" cy="-2.4" rx="2.6" ry="1.4" fill="#c97a6a"/></g>';

    function oakLeaf(px, py, size, angle, gradId, light) {
      const s = size;
      const path = 'M0 0 ' +
        'Q' + (-s * 0.35) + ' ' + (-s * 0.15) + ' ' + (-s * 0.4) + ' ' + (-s * 0.35) +
        'Q' + (-s * 0.55) + ' ' + (-s * 0.4) + ' ' + (-s * 0.35) + ' ' + (-s * 0.55) +
        'Q' + (-s * 0.5) + ' ' + (-s * 0.6) + ' ' + (-s * 0.3) + ' ' + (-s * 0.75) +
        'Q' + (-s * 0.4) + ' ' + (-s * 0.85) + ' ' + (-s * 0.15) + ' ' + (-s * 0.95) +
        'Q0 ' + (-s * 1.05) + ' ' + (s * 0.15) + ' ' + (-s * 0.95) +
        'Q' + (s * 0.4) + ' ' + (-s * 0.85) + ' ' + (s * 0.3) + ' ' + (-s * 0.75) +
        'Q' + (s * 0.5) + ' ' + (-s * 0.6) + ' ' + (s * 0.35) + ' ' + (-s * 0.55) +
        'Q' + (s * 0.55) + ' ' + (-s * 0.4) + ' ' + (s * 0.4) + ' ' + (-s * 0.35) +
        'Q' + (s * 0.35) + ' ' + (-s * 0.15) + ' 0 0 Z';
      return '<g transform="translate(' + px + ' ' + py + ') rotate(' + angle + ')">' +
        '<path d="' + path + '" fill="url(#' + gradId + ')"/>' +
        '<path d="M0 0 L0 -' + (s * 1.0) + '" stroke="#1e3a24" stroke-width="' + (s * 0.06) + '" opacity="0.6"/>' +
        (light ? '<ellipse cx="-' + (s * 0.15) + '" cy="-' + (s * 0.5) + '" rx="' + (s * 0.2) + '" ry="' + (s * 0.3) + '" fill="#e8f4e8" opacity="0.35"/>' : '') +
        '</g>';
    }

    function canopy(cx0, cy0, r, seed) {
      let out = '';
      let s = seed || 1;
      const rand = function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        const rr = r * (0.75 + rand() * 0.35);
        out += oakLeaf(cx0 + Math.cos(a) * rr, cy0 + Math.sin(a) * rr * 0.85, r * (0.4 + rand() * 0.15), a * 180 / Math.PI + 90, 'tleafDeep', false);
      }
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2 + 0.5;
        const rr = r * (0.5 + rand() * 0.35);
        out += oakLeaf(cx0 + Math.cos(a) * rr, cy0 + Math.sin(a) * rr * 0.85, r * (0.42 + rand() * 0.18), a * 180 / Math.PI + 90, 'tleafMid', rand() > 0.5);
      }
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + 1.2;
        const rr = r * (0.2 + rand() * 0.35);
        out += oakLeaf(cx0 + Math.cos(a) * rr, cy0 + Math.sin(a) * rr * 0.85, r * (0.4 + rand() * 0.15), a * 180 / Math.PI + 90, 'tleafBright', true);
      }
      out += '<ellipse cx="' + cx0 + '" cy="' + (cy0 - r * 0.25) + '" rx="' + (r * 0.8) + '" ry="' + (r * 0.6) + '" fill="url(#tglow)"/>';
      return out;
    }

    function barkLines(x, y1, y2, w) {
      let out = '';
      for (let i = 0; i < 7; i++) {
        const lx = x + (i - 3) * (w / 6);
        out += '<path d="M' + lx + ' ' + y1 + ' Q' + (lx + Math.sin(i * 1.3) * 1.5) + ' ' + ((y1 + y2) / 2) + ' ' + (lx + Math.cos(i * 0.9) * 1.5) + ' ' + y2 + '" stroke="' + (i % 2 === 0 ? '#1e1208' : '#c9a878') + '" stroke-width="' + (i % 2 === 0 ? 0.7 : 0.5) + '" fill="none" opacity="' + (i % 2 === 0 ? 0.5 : 0.35) + '"/>';
      }
      return out;
    }

    const t = Math.max(0, Math.min(1, growth / 100));
    const canopyRadius = 20 + t * 32;
    const trunkHeight = 60 + t * 60;
    const trunkWidth = 10 + t * 8;
    const topY = groundY - trunkHeight;
    const crownY = topY - 6;

    const trunk =
      '<path d="M' + (cx - trunkWidth / 2) + ' ' + groundY +
        ' Q' + (cx - trunkWidth / 2 - 3) + ' ' + (groundY - trunkHeight * 0.3) +
        ' ' + (cx - trunkWidth / 2 + 1) + ' ' + (groundY - trunkHeight * 0.55) +
        ' Q' + (cx - trunkWidth / 2 + 3) + ' ' + (groundY - trunkHeight * 0.75) +
        ' ' + (cx - 3) + ' ' + topY + ' L' + (cx + 3) + ' ' + topY +
        ' Q' + (cx + trunkWidth / 2 - 3) + ' ' + (groundY - trunkHeight * 0.75) +
        ' ' + (cx + trunkWidth / 2 - 1) + ' ' + (groundY - trunkHeight * 0.55) +
        ' Q' + (cx + trunkWidth / 2 + 3) + ' ' + (groundY - trunkHeight * 0.3) +
        ' ' + (cx + trunkWidth / 2) + ' ' + groundY + ' Z" fill="url(#tbark)"/>' +
      barkLines(cx, groundY - 4, topY + 2, trunkWidth) +
      '<ellipse cx="' + (cx - 1) + '" cy="' + (groundY - trunkHeight * 0.25) + '" rx="2" ry="2.8" fill="#150c06" opacity="0.75"/>' +
      '<ellipse cx="' + (cx + 2) + '" cy="' + (groundY - trunkHeight * 0.5) + '" rx="1.6" ry="2.2" fill="#150c06" opacity="0.7"/>' +
      '<path d="M' + (cx - trunkWidth / 2) + ' ' + groundY + ' Q' + (cx - trunkWidth - 5) + ' ' + (groundY - 4) + ' ' + (cx - trunkWidth / 2 - 1) + ' ' + (groundY - 8) + '" stroke="url(#tbarkDark)" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M' + (cx + trunkWidth / 2) + ' ' + groundY + ' Q' + (cx + trunkWidth + 5) + ' ' + (groundY - 4) + ' ' + (cx + trunkWidth / 2 + 1) + ' ' + (groundY - 8) + '" stroke="url(#tbarkDark)" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="' + cx + '" cy="' + groundY + '" rx="' + (trunkWidth * 1.1) + '" ry="4.5" fill="#150c06"/>';

    const branchTop = groundY - trunkHeight * 0.75;
    const branches =
      '<path d="M' + (cx - 2) + ' ' + branchTop + ' Q' + (cx - 22) + ' ' + (branchTop - 6) + ' ' + (cx - 40) + ' ' + (branchTop - 4) + '" stroke="url(#tbark)" stroke-width="' + (trunkWidth * 0.5) + '" fill="none" stroke-linecap="round"/>' +
      '<path d="M' + (cx - 40) + ' ' + (branchTop - 4) + ' Q' + (cx - 48) + ' ' + (branchTop - 12) + ' ' + (cx - 52) + ' ' + (branchTop - 22) + '" stroke="url(#tbark)" stroke-width="' + (trunkWidth * 0.32) + '" fill="none" stroke-linecap="round"/>' +
      '<path d="M' + (cx + 2) + ' ' + branchTop + ' Q' + (cx + 22) + ' ' + (branchTop - 8) + ' ' + (cx + 40) + ' ' + (branchTop - 6) + '" stroke="url(#tbark)" stroke-width="' + (trunkWidth * 0.5) + '" fill="none" stroke-linecap="round"/>' +
      '<path d="M' + (cx + 40) + ' ' + (branchTop - 6) + ' Q' + (cx + 48) + ' ' + (branchTop - 14) + ' ' + (cx + 52) + ' ' + (branchTop - 24) + '" stroke="url(#tbark)" stroke-width="' + (trunkWidth * 0.32) + '" fill="none" stroke-linecap="round"/>' +
      '<path d="M' + (cx - 1) + ' ' + (branchTop - 12) + ' Q' + (cx - 16) + ' ' + (branchTop - 22) + ' ' + (cx - 28) + ' ' + (branchTop - 24) + '" stroke="url(#tbark)" stroke-width="' + (trunkWidth * 0.4) + '" fill="none" stroke-linecap="round"/>' +
      '<path d="M' + (cx + 1) + ' ' + (branchTop - 16) + ' Q' + (cx + 16) + ' ' + (branchTop - 26) + ' ' + (cx + 28) + ' ' + (branchTop - 28) + '" stroke="url(#tbark)" stroke-width="' + (trunkWidth * 0.4) + '" fill="none" stroke-linecap="round"/>' +
      '<path d="M' + cx + ' ' + (branchTop - 20) + ' L' + cx + ' ' + topY + '" stroke="url(#tbark)" stroke-width="' + (trunkWidth * 0.35) + '" fill="none" stroke-linecap="round"/>';

    const crown =
      canopy(cx, crownY, canopyRadius, 1) +
      canopy(cx - canopyRadius * 0.7, crownY + canopyRadius * 0.35, canopyRadius * 0.72, 17) +
      canopy(cx + canopyRadius * 0.72, crownY + canopyRadius * 0.3, canopyRadius * 0.72, 41) +
      canopy(cx - canopyRadius * 0.45, crownY - canopyRadius * 0.4, canopyRadius * 0.6, 73) +
      canopy(cx + canopyRadius * 0.5, crownY - canopyRadius * 0.35, canopyRadius * 0.6, 91) +
      canopy(cx, crownY - canopyRadius * 0.55, canopyRadius * 0.55, 113);

    const falling =
      oakLeaf(cx - 60, groundY - 40, 3.5, 40, 'tleafMid', false) +
      oakLeaf(cx + 58, groundY - 55, 3.2, -35, 'tleafBright', true) +
      oakLeaf(cx + 30, groundY - 20, 2.8, 60, 'tleafMid', false) +
      oakLeaf(cx - 40, groundY - 15, 2.6, -50, 'tleafDeep', false);

    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">' + defs + ground +
      trunk + branches + crown + falling +
      '<ellipse cx="' + (cx - 20) + '" cy="' + (groundY + 4) + '" rx="1.8" ry="0.9" fill="#5f9d6a" opacity="0.5"/>' +
      '<ellipse cx="' + (cx + 26) + '" cy="' + (groundY + 6) + '" rx="1.5" ry="0.8" fill="#4a7c59" opacity="0.5"/>' +
      '</svg>';
  }

  function launchGarden() {
    WM.open('garden', {
      title: 'Garden', width: 420, height: 560,
      icon: svgIcon('garden', 14),
      render: function (body) {
        body.classList.add('garden');
        body.innerHTML =
          '<div class="garden-stage" id="g-stage"></div>' +
          '<div class="garden-stats">' +
            '<div class="gstat"><div class="label">Name</div><div class="value" id="g-name">—</div></div>' +
            '<div class="gstat"><div class="label">Stage</div><div class="value" id="g-stage-t">—</div></div>' +
            '<div class="gstat"><div class="label">Growth</div><div class="value" id="g-pct">0%</div></div>' +
          '</div>' +
          '<div class="garden-progress"><div class="bar"><span id="g-bar"></span></div></div>' +
          '<div class="garden-actions">' +
            '<button class="btn primary" id="g-water">' + svgIcon('drop', 13) + ' Water</button>' +
            '<button class="btn" id="g-rename">Rename</button>' +
          '</div>';
        function refresh() {
          const p = Store.data.plant;
          $('#g-stage', body).innerHTML = plantSVG(p.growth);
          $('#g-name', body).textContent = p.name;
          $('#g-stage-t', body).textContent = stageOf(p.growth).name;
          $('#g-pct', body).textContent = Math.floor(p.growth) + '%';
          $('#g-bar', body).style.width = p.growth + '%';
        }
        $('#g-water', body).addEventListener('click', function () {
          const p = Store.data.plant;
          const before = stageOf(p.growth).key;
          p.growth = Math.min(100, p.growth + 8);
          p.lastWater = Date.now();
          const after = stageOf(p.growth).key;
          Store.save(); refresh(); refreshGardenWidget();
          if (before !== after && after !== 'seed') toast('Your plant became a ' + stageOf(p.growth).name + '!', 'success');
          else if (p.growth >= 100) toast('Fully grown — beautifully flowering.', 'success');
          else toast('Watered. +8 growth', 'success');
        });
        $('#g-rename', body).addEventListener('click', function () {
          const name = prompt('Plant name:', Store.data.plant.name);
          if (!name || !name.trim()) return;
          Store.data.plant.name = name.trim().slice(0, 20);
          Store.save(); refresh(); refreshGardenWidget();
        });
        refresh();
      }
    });
  }

  function launchTree() {
    if (!Store.data.tree) { Store.data.tree = { name: 'Oakley', growth: 30, lastWater: Date.now() }; Store.save(); }
    WM.open('tree', {
      title: 'Tree', width: 420, height: 600,
      icon: svgIcon('garden', 14),
      render: function (body) {
        body.classList.add('tree-app');
        body.innerHTML =
          '<div class="tree-stage" id="t-stage"></div>' +
          '<div class="tree-stats">' +
            '<div class="gstat"><div class="label">Name</div><div class="value" id="t-name">—</div></div>' +
            '<div class="gstat"><div class="label">Age</div><div class="value" id="t-age">—</div></div>' +
            '<div class="gstat"><div class="label">Growth</div><div class="value" id="t-pct">0%</div></div>' +
          '</div>' +
          '<div class="tree-progress"><div class="bar"><span id="t-bar"></span></div></div>' +
          '<div class="tree-actions">' +
            '<button class="btn primary" id="t-water">' + svgIcon('drop', 13) + ' Water</button>' +
            '<button class="btn" id="t-rename">Rename</button>' +
          '</div>';
        function ageLabel(growth) {
          const years = Math.floor(growth * 4);
          if (years === 0) return 'Seedling';
          return years + ' yr' + (years === 1 ? '' : 's');
        }
        function refresh() {
          const t = Store.data.tree;
          $('#t-stage', body).innerHTML = treeSVG(t.growth);
          $('#t-name', body).textContent = t.name;
          $('#t-age', body).textContent = ageLabel(t.growth);
          $('#t-pct', body).textContent = Math.floor(t.growth) + '%';
          $('#t-bar', body).style.width = t.growth + '%';
        }
        $('#t-water', body).addEventListener('click', function () {
          const t = Store.data.tree;
          const before = t.growth;
          t.growth = Math.min(100, t.growth + 6);
          t.lastWater = Date.now();
          Store.save(); refresh();
          if (before < 100 && t.growth >= 100) toast('Oakley is fully grown. Beautiful.', 'success');
          else toast('Watered. +6 growth', 'success');
        });
        $('#t-rename', body).addEventListener('click', function () {
          const name = prompt('Tree name:', Store.data.tree.name);
          if (!name || !name.trim()) return;
          Store.data.tree.name = name.trim().slice(0, 20);
          Store.save(); refresh();
        });
        refresh();
      }
    });
  }

  /* Settings */
  function launchSettings() {
    WM.open('settings', {
      title: 'Settings', width: 720, height: 520,
      icon: svgIcon('settings', 14),
      render: function (body) {
        body.classList.add('settings');
        body.innerHTML =
          '<div class="settings-nav">' +
            '<button class="snav active" data-tab="appearance">' + svgIcon('image', 13) + ' Appearance</button>' +
            '<button class="snav" data-tab="desktop">' + svgIcon('folder', 13) + ' Desktop</button>' +
            '<button class="snav" data-tab="about">' + svgIcon('info', 13) + ' About</button>' +
          '</div>' +
          '<div class="settings-body" id="s-body"></div>';

        function show(tab) {
          $$('.snav', body).forEach(function (b) { b.classList.toggle('active', b.dataset.tab === tab); });
          const bodyEl = $('#s-body', body);
          const s = Store.data.settings;

          if (tab === 'appearance') {
            let wallHTML = '';
            WALLPAPERS.forEach(function (w) {
              wallHTML += '<div class="wall-opt' + (s.wallpaper === w.key ? ' active' : '') + '" data-wall="' + w.key + '">' + generateWallpaper(w.key) + '</div>';
            });
            if (s.customWallpaper) {
              wallHTML += '<div class="wall-opt wall-opt-custom' + (s.wallpaper === 'custom' ? ' active' : '') + '" data-wall="custom" style="background-image:url(\'' + s.customWallpaper + '\');"></div>';
            }
            let swHTML = '';
            Object.keys(ACCENTS).forEach(function (k) {
              swHTML += '<div class="swatch' + (s.accent === k ? ' active' : '') + '" data-accent="' + k + '" style="background:' + ACCENTS[k].bright + ';"></div>';
            });

            bodyEl.innerHTML =
              '<h3>Appearance</h3>' +
              '<div class="sub">Customize the look and feel of TerOS.</div>' +
              '<div class="srow" style="flex-direction:column;align-items:stretch;">' +
                '<div class="slabel" style="margin-bottom:12px;">Wallpaper</div>' +
                '<div class="wall-grid" id="wall-grid">' + wallHTML + '</div>' +
                '<div class="wall-upload-row">' +
                  '<input type="file" id="wall-file" accept="image/*" style="display:none;">' +
                  '<button class="btn" id="wall-upload">' + svgIcon('upload', 13) + ' Upload custom</button>' +
                  (s.customWallpaper ? '<button class="btn danger" id="wall-clear">Remove custom</button>' : '') +
                '</div>' +
                '<div class="sdesc" style="margin-top:6px;">Custom images are stored in your browser. Small images (under 500 KB) work best.</div>' +
              '</div>' +
              '<div class="srow">' +
                '<div><div class="slabel">Light mode</div><div class="sdesc">Softer palette for daytime use.</div></div>' +
                '<div class="toggle' + (s.theme === 'light' ? ' on' : '') + '" data-toggle="theme"></div>' +
              '</div>' +
              '<div class="srow">' +
                '<div><div class="slabel">Accent color</div><div class="sdesc">Used for highlights throughout TerOS.</div></div>' +
                '<div class="swatches" id="swatches">' + swHTML + '</div>' +
              '</div>';

            $('#wall-grid', bodyEl).addEventListener('click', function (e) {
              const opt = e.target.closest('.wall-opt'); if (!opt) return;
              Store.data.settings.wallpaper = opt.dataset.wall;
              Store.save(); applySettings(); show('appearance');
            });
            $('#swatches', bodyEl).addEventListener('click', function (e) {
              const sw = e.target.closest('.swatch'); if (!sw) return;
              Store.data.settings.accent = sw.dataset.accent;
              Store.save(); applySettings(); show('appearance');
            });
            $('[data-toggle="theme"]', bodyEl).addEventListener('click', function () {
              Store.data.settings.theme = Store.data.settings.theme === 'light' ? 'dark' : 'light';
              Store.save(); applySettings(); show('appearance');
            });

            const fileInput = $('#wall-file', bodyEl);
            $('#wall-upload', bodyEl).addEventListener('click', function () { fileInput.click(); });
            fileInput.addEventListener('change', function () {
              const file = fileInput.files && fileInput.files[0];
              if (!file) return;
              if (!file.type || file.type.indexOf('image/') !== 0) {
                toast('Please choose an image file', 'error');
                return;
              }
              if (file.size > 2 * 1024 * 1024) {
                toast('Image too large (max 2 MB)', 'error');
                return;
              }
              const reader = new FileReader();
              reader.onload = function (evt) {
                Store.data.settings.customWallpaper = evt.target.result;
                Store.data.settings.wallpaper = 'custom';
                try {
                  Store.save();
                } catch (err) {
                  console.warn('Could not save the wallpaper', err);
                }
                applySettings(); show('appearance');
                toast('Custom wallpaper set', 'success');
              };
              reader.onerror = function () { toast('Could not read image', 'error'); };
              reader.readAsDataURL(file);
            });

            const clearBtn = $('#wall-clear', bodyEl);
            if (clearBtn) {
              clearBtn.addEventListener('click', function () {
                Store.data.settings.customWallpaper = null;
                if (Store.data.settings.wallpaper === 'custom') Store.data.settings.wallpaper = 'misty';
                Store.save(); applySettings(); show('appearance');
                toast('Custom wallpaper removed', 'success');
              });
            }
          }

          if (tab === 'desktop') {
            bodyEl.innerHTML =
              '<h3>Desktop</h3>' +
              '<div class="sub">Control the desktop layout.</div>' +
              '<div class="srow">' +
                '<div><div class="slabel">24-hour clock</div><div class="sdesc">Show times as HH:MM instead of AM/PM.</div></div>' +
                '<div class="toggle' + (s.clock24 ? ' on' : '') + '" data-toggle="clock"></div>' +
              '</div>' +
              '<div class="srow">' +
                '<div><div class="slabel">Show widgets</div><div class="sdesc">Clock, apps, garden, and calendar panels.</div></div>' +
                '<div class="toggle' + (s.showWidgets ? ' on' : '') + '" data-toggle="widgets"></div>' +
              '</div>' +
              '<div class="srow">' +
                '<div><div class="slabel">Reset TerOS</div><div class="sdesc">Clear all saved data.</div></div>' +
                '<button class="btn danger" id="reset">Reset</button>' +
              '</div>';
            $('[data-toggle="clock"]', bodyEl).addEventListener('click', function () {
              Store.data.settings.clock24 = !Store.data.settings.clock24;
              Store.save(); show('desktop'); tickClock();
            });
            $('[data-toggle="widgets"]', bodyEl).addEventListener('click', function () {
              Store.data.settings.showWidgets = !Store.data.settings.showWidgets;
              Store.save(); applySettings(); show('desktop');
            });
            $('#reset', bodyEl).addEventListener('click', function () {
              if (!confirm('Reset TerOS? All your files, notes and the plants will be lost.')) return;
              Store.reset(); applySettings(); refreshWidgets(); tickClock();
              toast('TerOS reset', 'success');
            });
          }

          if (tab === 'about') {
            bodyEl.innerHTML =
              '<h3>About TerOS</h3>' +
              '<div class="sub">A nature-themed desktop OS in the browser.</div>' +
              '<div class="srow"><div class="slabel">Version</div><div style="color:var(--text-dim);font-family:var(--mono);font-size:12px;">1.0 — Forest</div></div>' +
              '<div class="srow"><div class="slabel">Kernel</div><div style="color:var(--text-dim);font-family:var(--mono);font-size:12px;">TerKernel</div></div>' +
              '<div class="srow"><div class="slabel">Architecture</div><div style="color:var(--text-dim);font-family:var(--mono);font-size:12px;">Web / Local</div></div>' +
              '<div class="srow"><div class="slabel">Storage</div><div style="color:var(--text-dim);font-family:var(--mono);font-size:12px;">localStorage</div></div>' +
              '<div class="srow"><div class="slabel">Apps installed</div><div style="color:var(--text-dim);font-family:var(--mono);font-size:12px;">9</div></div>';
          }
        }

        $$('.snav', body).forEach(function (b) {
          b.addEventListener('click', function () { show(b.dataset.tab); });
        });
        show('appearance');
      }
    });
  }

  /* System Info */
  function launchSystemInfo() {
    WM.open('systeminfo', {
      title: 'System Info', width: 480, height: 460,
      icon: svgIcon('system', 14),
      render: function (body) {
        body.classList.add('sysinfo');
        const bytes = new Blob([localStorage.getItem(Store.KEY) || '']).size;
        const opened = Object.keys(WM.windows).length;
        const uptimeMs = performance.now();
        const uptimeMin = Math.floor(uptimeMs / 60000);
        const uptimeSec = Math.floor((uptimeMs % 60000) / 1000);
        const fileCount = Object.keys(Store.data.files).length;
        const noteCount = Store.data.notes.length;
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
        else if (ua.indexOf('Edg') !== -1) browser = 'Edge';
        else if (ua.indexOf('Chrome') !== -1) browser = 'Chrome';
        else if (ua.indexOf('Safari') !== -1) browser = 'Safari';
        else if (ua.indexOf('Brave') !== -1) browser = 'Brave';

        body.innerHTML =
          '<div class="sysinfo-hero">' +
            '<div class="mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 C6 6 4 12 8 18 C10 21 14 22 18 20 C20 18 20 14 18 10 C16 6 14 4 12 2 Z"/><path d="M12 22 V18"/></svg></div>' +
            '<div class="meta"><h2>TerOS</h2><div class="ver">VERSION 1.0 — FOREST</div></div>' +
          '</div>' +
          '<div class="sysinfo-row"><span class="k">Kernel</span><span class="v">TerKernel 1.0</span></div>' +
          '<div class="sysinfo-row"><span class="k">Shell</span><span class="v">tsh</span></div>' +
          '<div class="sysinfo-row"><span class="k">Window Manager</span><span class="v">TerWM 2</span></div>' +
          '<div class="sysinfo-row"><span class="k">Architecture</span><span class="v">Web / Local</span></div>' +
          '<div class="sysinfo-row"><span class="k">Storage backend</span><span class="v">localStorage</span></div>' +
          '<div class="sysinfo-row"><span class="k">Storage used</span><span class="v">' + formatBytes(bytes) + '</span></div>' +
          '<div class="sysinfo-row"><span class="k">Filesystem nodes</span><span class="v">' + fileCount + '</span></div>' +
          '<div class="sysinfo-row"><span class="k">Saved notes</span><span class="v">' + noteCount + '</span></div>' +
          '<div class="sysinfo-row"><span class="k">Open windows</span><span class="v">' + opened + '</span></div>' +
          '<div class="sysinfo-row"><span class="k">Display</span><span class="v">' + window.innerWidth + ' × ' + window.innerHeight + '</span></div>' +
          '<div class="sysinfo-row"><span class="k">Browser</span><span class="v">' + browser + '</span></div>' +
          '<div class="sysinfo-row"><span class="k">Session uptime</span><span class="v">' + uptimeMin + 'm ' + uptimeSec + 's</span></div>';
      }
    });
  }

  /* Devlog */
  const DEVLOG = [
    { ver: 'v0.1', date: 'Start', title: 'The first window',
      body: 'Started with the shell: wallpaper, taskbar, a window manager that could open, drag, focus, minimize, and close. Calculator and Terminal were the first apps — deliberately small so I could focus on making the window system feel right.',
      list: ['Desktop wallpaper uses layered procedural pines — no image files.', 'Windows cascade slightly when opened.', 'Terminal prompt reflects a fake working directory.'] },
    { ver: 'v0.5', date: 'First 2 days', title: 'Persistence and personality',
      body: 'Everything now saves to localStorage. Files, notes, and settings survive refresh. Added the Files app with simulated tree, breadcrumbs, and rename/delete. Terminal gained cd, mkdir, touch, cat, rm, and tree.',
      list: ['Filesystem stored as a flat path → node map.', 'Notes autosave 400ms after you stop typing.', 'Terminal cwd persists while the window is open.'] },
    { ver: 'v1.0', date: 'Next 2 days', title: 'The forest grows',
      body: 'The Garden arrived. A plant that grows as you use TerOS with one growth point per minute of presence, plus a Water button for instant progress ( DONT SPAM IT !!!!!!!!!!! ILL GET MAD !!!!!!!!!). Five stages: seed, sprout, young, mature, flowering. Then the Tree, an ancient oak with gnarly bark, layered foliage, and hundreds of individual oak leaves.',
      list: ['Growth persists in localStorage alongside everything else.', 'Widget on the desktop shows stage + growth without opening the app.', 'Full glass-panel redesign to match the misty forest reference.'] },
    { ver: 'v1.0', date: 'Now', title: 'What TerOS is',
      body: 'A simulated operating system from three files: index.html, styles.css, app.js. No backend, no build step, no dependencies. The goal was to build a small, coherent, slightly strange place you can explore (: .',
      list: ['9 apps: Calculator, Terminal, Notes, Files, Garden, Tree, Settings, System Info, Devlog.', 'Drag, focus, minimize, restore, resize, snap — the window system is stable.', 'Everything saves. Close the tab, come back tomorrow, the plants are still there.'] }
  ];

  function launchDevlog() {
    WM.open('devlog', {
      title: 'Devlog', width: 720, height: 520,
      icon: svgIcon('devlog', 14),
      render: function (body) {
        let entriesHTML = '';
        DEVLOG.forEach(function (e) {
          let items = '';
          e.list.forEach(function (l) { items += '<li>' + l + '</li>'; });
          entriesHTML +=
            '<div class="devlog-entry">' +
              '<div class="head"><span class="ver">' + e.ver + '</span><span class="date">' + e.date + '</span></div>' +
              '<h3>' + e.title + '</h3><p>' + e.body + '</p><ul>' + items + '</ul>' +
            '</div>';
        });
        body.innerHTML =
          '<div class="devlog">' +
            '<h2 style="font-size:22px;font-weight:300;letter-spacing:0.5px;margin-bottom:6px;">Development Log</h2>' +
            '<p style="color:var(--text-dim);font-size:13px;margin-bottom:24px;">How TerOS was built, in four entries.</p>' +
            entriesHTML +
          '</div>';
      }
    });
  }

  function refreshGardenWidget() {
    const p = Store.data.plant;
    const plantEl = $('#wg-plant'); if (plantEl) plantEl.innerHTML = plantSVG(p.growth);
    const nameEl = $('#wg-name'); if (nameEl) nameEl.textContent = p.name;
    const stageEl = $('#wg-stage'); if (stageEl) stageEl.textContent = stageOf(p.growth).name;
    const barEl = $('#wg-bar'); if (barEl) barEl.style.width = p.growth + '%';
    const pctEl = $('#wg-pct'); if (pctEl) pctEl.textContent = Math.floor(p.growth) + '%';
  }

  function refreshWidgets() {
    const root = $('#widgets');
    if (!root) return;
    root.innerHTML = '';

    const greet = el('div', { class: 'widget', id: 'w-greeting' });
    greet.innerHTML =
      '<div class="greeting" id="w-greet-text"></div>' +
      '<div class="time" id="w-time">--:--</div>' +
      '<div class="date" id="w-date"></div>';
    root.appendChild(greet);

    const apps = el('div', { class: 'widget', id: 'w-apps' });
    apps.innerHTML = '<div class="widget-title">Apps</div>';
    const grid = el('div', { class: 'grid' });
    ['files', 'notes', 'terminal', 'calculator', 'garden', 'tree', 'settings', 'devlog', 'systeminfo'].forEach(function (id) {
      const a = APPS[id];
      const tile = el('button', { class: 'app-tile' });
      tile.innerHTML = svgIcon(id, 22) + '<span>' + a.title + '</span>';
      tile.addEventListener('click', function () { launchApp(id); });
      grid.appendChild(tile);
    });
    apps.appendChild(grid);
    root.appendChild(apps);

    const garden = el('div', { class: 'widget', id: 'w-garden' });
    garden.innerHTML =
      '<div class="plant-mini" id="wg-plant"></div>' +
      '<div class="info">' +
        '<div class="name" id="wg-name">—</div>' +
        '<div class="stage" id="wg-stage">—</div>' +
        '<div class="bar"><span id="wg-bar"></span></div>' +
        '<div class="pct" id="wg-pct">0%</div>' +
        '<button class="water-btn" id="wg-water">Water</button>' +
      '</div>';
    root.appendChild(garden);

    const cal = el('div', { class: 'widget', id: 'w-calendar' });
    root.appendChild(cal);

    $('#wg-water', garden).addEventListener('click', function () {
      const p = Store.data.plant;
      const before = stageOf(p.growth).key;
      p.growth = Math.min(100, p.growth + 8);
      p.lastWater = Date.now();
      const after = stageOf(p.growth).key;
      Store.save();
      refreshGardenWidget();
      if (WM.windows.garden) { WM.close('garden'); setTimeout(launchGarden, 200); }
      if (before !== after && after !== 'seed') toast('Your plant became a ' + stageOf(p.growth).name + '!', 'success');
    });
    refreshGardenWidget();

    let calDate = new Date();
    function renderCal() {
      const today = new Date();
      const y = calDate.getFullYear();
      const m = calDate.getMonth();
      const first = new Date(y, m, 1);
      const startDow = first.getDay();
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const prevDays = new Date(y, m, 0).getDate();
      const monthName = first.toLocaleString('en-US', { month: 'long' });

      let cells = '';
      for (let i = startDow - 1; i >= 0; i--) cells += '<div class="day other">' + (prevDays - i) + '</div>';
      for (let d = 1; d <= daysInMonth; d++) {
        const isToday = d === today.getDate() && m === today.getMonth() && y === today.getFullYear();
        cells += '<div class="day' + (isToday ? ' today' : '') + '">' + d + '</div>';
      }
      const total = startDow + daysInMonth;
      const trail = (7 - (total % 7)) % 7;
      for (let i = 1; i <= trail; i++) cells += '<div class="day other">' + i + '</div>';

      cal.innerHTML =
        '<div class="cal-head">' +
          '<span class="month">' + monthName + ' ' + y + '</span>' +
          '<div class="cal-nav">' +
            '<button data-nav="-1">' + svgIcon('arrow_left', 12) + '</button>' +
            '<button data-nav="1">' + svgIcon('arrow_right', 12) + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="cal-grid">' +
          ['S','M','T','W','T','F','S'].map(function (d) { return '<div class="dow">' + d + '</div>'; }).join('') +
          cells +
        '</div>';

      $$('.cal-nav button', cal).forEach(function (b) {
        b.addEventListener('click', function () {
          calDate = new Date(y, m + parseInt(b.dataset.nav, 10), 1);
          renderCal();
        });
      });
    }
    renderCal();

    tickClock();
  }

  function tickClock() {
    if (!Store.data) return;
    const now = new Date();
    const s = Store.data.settings;
    let hours = now.getHours();
    let ampm = '';
    if (!s.clock24) {
      ampm = hours >= 12 ? ' PM' : ' AM';
      hours = hours % 12 || 12;
    }
    const hh = String(hours).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const timeStr = hh + ':' + mm + ampm;
    const tray = $('#tray-clock'); if (tray) tray.textContent = timeStr;
    const wt = $('#w-time');
    if (wt) {
      wt.textContent = timeStr;
      const dateEl = $('#w-date');
      if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      const h = now.getHours();
      let greeting = 'Good evening';
      if (h < 5) greeting = 'Good night';
      else if (h < 12) greeting = 'Good morning';
      else if (h < 18) greeting = 'Good afternoon';
      const greetEl = $('#w-greet-text');
      if (greetEl) greetEl.textContent = greeting + '.';
    }
  }

  function buildStartMenu() {
    const menu = $('#start-menu');
    if (!menu) return;
    let itemsHTML = '';
    ['files', 'notes', 'terminal', 'calculator', 'garden', 'tree', 'settings', 'devlog', 'systeminfo'].forEach(function (id) {
      itemsHTML += '<button class="sm-item" data-app="' + id + '">' + svgIcon(id, 16) + ' ' + APPS[id].title + '</button>';
    });
    menu.innerHTML =
      '<div class="sm-head">' +
        '<div class="logo">TerOS</div>' +
        '<div class="sub">A forest in YOUR browser</div>' +
      '</div>' +
      itemsHTML +
      '<div class="sm-sep"></div>' +
      '<button class="sm-item" id="sm-about">' + svgIcon('info', 16) + ' About TerOS</button>';

    menu.addEventListener('click', function (e) {
      const item = e.target.closest('[data-app]');
      if (item) { launchApp(item.dataset.app); menu.classList.remove('open'); }
    });
    $('#sm-about', menu).addEventListener('click', function () {
      menu.classList.remove('open');
      $('#about-modal').classList.add('open');
    });
  }

  function wireGlobalEvents() {
    const startBtn = $('#start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        $('#start-menu').classList.toggle('open');
      });
    }
    document.addEventListener('click', function (e) {
      const menu = $('#start-menu');
      if (!menu) return;
      if (!menu.contains(e.target) && e.target !== startBtn) menu.classList.remove('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        const m = $('#start-menu'); if (m) m.classList.remove('open');
        const a = $('#about-modal'); if (a) a.classList.remove('open');
        ContextMenu.hide();
      }
      if (e.key === 'Meta' || e.key === 'OS') {
        e.preventDefault();
        const menu = $('#start-menu');
        if (menu) menu.classList.toggle('open');
      }
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault(); WM.cycleFocus();
      }
    });
    const aboutModal = $('#about-modal');
    if (aboutModal) {
      aboutModal.addEventListener('click', function () { aboutModal.classList.remove('open'); });
      const inner = aboutModal.querySelector('.modal');
      if (inner) inner.addEventListener('click', function (e) { e.stopPropagation(); });
    }
    const aboutClose = $('#about-close');
    if (aboutClose) aboutClose.addEventListener('click', function () {
      $('#about-modal').classList.remove('open');
    });
  }

  function boot() {
    console.log('[TerOS] booting...');
    const bootEl = document.getElementById('boot');
    setTimeout(function () {
      if (bootEl) bootEl.classList.add('hidden');
      setTimeout(function () {
        if (bootEl && bootEl.parentNode) bootEl.parentNode.removeChild(bootEl);
      }, 700);
    }, 1400);
    setTimeout(function () {
      const b = document.getElementById('boot');
      if (b && b.parentNode) b.parentNode.removeChild(b);
    }, 3000);

    try {
      Store.load();
      applySettings();
      refreshWidgets();
      buildStartMenu();
      tickClock();
      setInterval(tickClock, 1000);
      applyNaturalGrowth();
      setInterval(applyNaturalGrowth, 5 * 60 * 1000);
      wireGlobalEvents();
      ContextMenu.build();
      console.log('[TerOS] booted hehe');
    } catch (e) {
      console.error('[TerOS] boot error and it isnt looking good ): here is the error boi :', e);
    }
  }

  if (document.readyState === 'loading, wait a little') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();