(function () {
  'use strict';

  var T = {};

  var $  = T.$  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = T.$$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  T.el = function (tag, attrs) {
    var n = document.createElement(tag);
    attrs = attrs || {};
    for (var k in attrs) {
      var v = attrs[k];
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k === 'text') n.textContent = v;
      else if (k.charAt(0) === 'o' && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c == null) continue;
      n.appendChild(c.nodeType ? c : document.createTextNode(c));
    }
    return n;
  };

  T.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  };

  T.relTime = function (ts) {
    var d = Date.now() - ts, s = Math.floor(d/1000);
    if (s < 60) return 'just now';
    var m = Math.floor(s/60);
    if (m < 60) return m + 'm ago';
    var h = Math.floor(m/60);
    if (h < 24) return h + 'h ago';
    var dd = Math.floor(h/24);
    if (dd < 7) return dd + 'd ago';
    return new Date(ts).toLocaleDateString();
  };

  T.bytes = function (n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n/1024).toFixed(1) + ' KB';
    return (n/1048576).toFixed(2) + ' MB';
  };

  var toastT;
  T.toast = function (msg, kind) {
    var t = $('#toast'); if (!t) return;
    t.textContent = msg;
    t.className = 'on' + (kind ? ' ' + kind : '');
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.className = ''; }, 1800);
  };

  var ICONS = {
    calc: '<rect x="5" y="3.5" width="14" height="17" rx="1"/><path d="M8 7h8"/><path d="M8 11h.01M12 11h.01M16 11h.01"/><path d="M8 14h.01M12 14h.01M16 14h.01"/><path d="M8 17h.01M12 17h.01M16 17h.01"/>',
    term: '<path d="M3 4.5h18v15H3z"/><path d="M7 10l3 2.5L7 15"/><path d="M12.5 15h4.5"/>',
    notes: '<path d="M5 3.5h11l3 3V20a.5.5 0 0 1-.5.5h-13A.5.5 0 0 1 5 20z"/><path d="M16 3.5V7h3.5"/><path d="M8.5 12h7"/><path d="M8.5 15.5h7"/><path d="M8.5 8.5h3"/>',
    files: '<path d="M3 6.5a1 1 0 0 1 1-1h4.5l1.5 2h10a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
    plant: '<path d="M12 21v-6"/><path d="M12 15c-3 0-5.5-2-5.5-5.5 3 0 5.5 2.5 5.5 5.5z"/><path d="M12 15c3 0 5.5-2 5.5-5.5-3 0-5.5 2.5-5.5 5.5z"/><path d="M12 10c0-2.5-1-4.5-3-5.5"/>',
    tree: '<path d="M12 21v-7"/><path d="M12 5l-4 6h2l-3 5h10l-3-5h2z"/><path d="M9 14l3 3M15 14l-3 3"/>',
    cog: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    log: '<path d="M4.5 4h11l4 4v12a.5.5 0 0 1-.5.5H4.5A.5.5 0 0 1 4 20V4.5A.5.5 0 0 1 4.5 4z"/><path d="M7 9h8"/><path d="M7 12.5h10"/><path d="M7 16h7"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7.5v.01"/>',
    sysinfo: '<rect x="3" y="4.5" width="18" height="12" rx="1"/><path d="M8 20h8"/><path d="M12 16.5V20"/>',
    folder: '<path d="M3 6.5a1 1 0 0 1 1-1h4.5l1.5 2h10a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
    file: '<path d="M5.5 3.5h9l4 4V20a.5.5 0 0 1-.5.5H5.5A.5.5 0 0 1 5 20V4a.5.5 0 0 1 .5-.5z"/><path d="M14.5 3.5V7H18.5"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    trash: '<path d="M4.5 6.5h15"/><path d="M9.5 6.5V4.5h5v2"/><path d="M6.5 6.5l1 13h9l1-13"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    refresh: '<path d="M20 8.5A8 8 0 0 0 5.5 6.5"/><path d="M20 4v4.5h-4.5"/><path d="M4 15.5A8 8 0 0 0 18.5 17.5"/><path d="M4 20v-4.5h4.5"/>',
    x: '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
    min: '<path d="M6 12h12"/>',
    max: '<rect x="5.5" y="5.5" width="13" height="13"/>',
    restore: '<rect x="4.5" y="8.5" width="11" height="11"/><path d="M8.5 8.5V5.5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3"/>',
    drop: '<path d="M12 3.5c-3 4-5 7-5 9.5a5 5 0 0 0 10 0c0-2.5-2-5.5-5-9.5z"/>',
    image: '<rect x="3.5" y="3.5" width="17" height="17" rx="1"/><circle cx="9" cy="9" r="1.5"/><path d="M3.5 17l5-5 4 4 3-3 4 4"/>',
    up: '<path d="M12 20V5"/><path d="M6 11l6-6 6 6"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/>',
    warn: '<path d="M12 3L2 20h20z"/><path d="M12 10v5"/><path d="M12 17.5v.01"/>',
    check: '<path d="M5 12.5l5 5 9-11"/>'
  };

  T.icon = function (name, size) {
    size = size || 16;
    var content = ICONS[name] || ICONS.file;
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size +
      '" fill="none" stroke="currentColor" stroke-width="1.5" ' +
      'stroke-linecap="round" stroke-linejoin="round">' + content + '</svg>';
  };
  T.I = ICONS;

  var Store = T.Store = {
    KEY: 'teros.v1',
    data: null,

    defs: function () {
      return {
        settings: {
          wallpaper: 'misty',
          custom: null,
          theme: 'dark',
          accent: 'sage',
          clock24: true,
          widgets: true
        },
        files: {
          '/':               {type:'folder', children:['home']},
          '/home':           {type:'folder', children:['Documents','Projects','Pictures']},
          '/home/Documents': {type:'folder', children:['welcome.txt','notes.txt']},
          '/home/Projects':  {type:'folder', children:['teros.txt']},
          '/home/Pictures':  {type:'folder', children:[]},
          '/home/Documents/welcome.txt': {
            type:'file',
            content: 'Welcome to TerOS.\n\nEverything you make here lives in this browser.\n\nFiles, notes, and both plants survive a refresh. Try the terminal — type "help" to get a list of commands.\n\nThere is also a garden. Water it once a day.'
          },
          '/home/Documents/notes.txt': {
            type:'file',
            content: 'Things for today\n\n  - water the plant\n  - water the tree\n  - read the devlog\n  - write one honest note'
          },
          '/home/Projects/teros.txt': {
            type:'file',
            content: 'TerOS 1.0\n\nA small nature operating system for a browser tab.\n\nNamed after the Greek word for "other".'
          }
        },
        notes: [
          {id:'n1', title:'Welcome', body:'TerOS saves notes as you type.\n\nThis one is already here, but you can delete it and start fresh.', updated: Date.now()}
        ],
        plant: {name:'Mossy',  growth:12, lastWater:Date.now(), planted:Date.now()},
        tree:  {name:'Oakley', growth:30, lastWater:Date.now()}
      };
    },

    load: function () {
      try {
        var raw = localStorage.getItem(this.KEY);
        if (!raw) { this.data = this.defs(); return this.data; }
        var p = JSON.parse(raw);
        var d = this.defs();
        this.data = {
          settings: Object.assign({}, d.settings, p.settings || {}),
          files: (p.files && typeof p.files === 'object') ? p.files : d.files,
          notes: Array.isArray(p.notes) ? p.notes : d.notes,
          plant: Object.assign({}, d.plant, p.plant || {}),
          tree:  Object.assign({}, d.tree,  p.tree  || {})
        };
      } catch (e) {
        console.warn('storage corrupt, resetting', e);
        this.data = this.defs();
      }
      return this.data;
    },

    save: function () {
      try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); }
      catch (e) { T.toast('storage full — try a smaller image', 'bad'); }
    },

    reset: function () {
      try { localStorage.removeItem(this.KEY); } catch (e) {}
      this.data = this.defs();
    }
  };

  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  var PALETTES = {
    misty: {
      skyTop:'#1a2b1e', skyBot:'#0a120c',
      far:'#243a2a', mid:'#16241a', near:'#080e09',
      mist:'#9fb69a', stars:false, warm:false
    },
    dawn: {
      skyTop:'#3d2a1f', skyBot:'#1a1210',
      far:'#33251a', mid:'#1c1410', near:'#0a0705',
      mist:'#c99a68', stars:false, warm:true
    },
    dusk: {
      skyTop:'#241a2e', skyBot:'#0e0812',
      far:'#2a1f36', mid:'#181222', near:'#080510',
      mist:'#9a82b0', stars:true, warm:false
    },
    night: {
      skyTop:'#0c1824', skyBot:'#040810',
      far:'#0e1a26', mid:'#08121a', near:'#03060a',
      mist:'#6b88a0', stars:true, warm:false
    }
  };

  /* A single pine tree with real branches and trunk */
  function pineTree(x, baseY, h, w, colors, opacity) {
    var trunk = '<path d="M' + x + ' ' + baseY + ' L' + x + ' ' + (baseY - h * 0.15) +
                '" stroke="' + colors.trunk + '" stroke-width="' + (w * 0.06) + '" stroke-linecap="round"/>';
    var layers = '';
    // 5 tiers, decreasing width going up
    for (var i = 0; i < 5; i++) {
      var t = i / 4;
      var ly = baseY - h * (0.15 + t * 0.8);
      var lw = w * (1 - t * 0.75);
      var lh = h * 0.28;
      layers += '<path d="M' + (x - lw/2) + ' ' + ly + ' L' + x + ' ' + (ly - lh) + ' L' + (x + lw/2) + ' ' + ly + ' Z" ' +
                'fill="' + colors.body + '" opacity="' + (opacity * (1 - t * 0.15)) + '"/>';
      // a highlight stroke on one side
      layers += '<path d="M' + (x - lw/2 + 1) + ' ' + ly + ' L' + x + ' ' + (ly - lh + 1) + '" ' +
                'stroke="' + colors.hi + '" stroke-width="0.6" opacity="0.3" fill="none"/>';
    }
    return trunk + layers;
  }

  T.wallpaper = function (kind) {
    var p = PALETTES[kind] || PALETTES.misty;
    var rand = rng(kind === 'dawn' ? 11 : kind === 'dusk' ? 23 : kind === 'night' ? 37 : 53);

    var colorsFar = { body: p.far, hi: p.mist, trunk: p.far };
    var colorsMid = { body: p.mid, hi: p.mist, trunk: p.near };
    var colorsNear= { body: p.near, hi: p.mid, trunk: p.near };

    var far = '', mid = '', near = '';
    for (var i = 0; i < 22; i++) {
      var x = (i / 21) * 1920 + (rand() * 60 - 30);
      far += pineTree(x, 920, 200 + rand()*80, 50 + rand()*15, colorsFar, 0.55);
    }
    for (i = 0; i < 16; i++) {
      x = (i / 15) * 1920 + (rand() * 80 - 40);
      mid += pineTree(x, 1040, 280 + rand()*100, 70 + rand()*20, colorsMid, 0.75);
    }
    for (i = 0; i < 10; i++) {
      x = (i / 9) * 1920 + (rand() * 120 - 60);
      near += pineTree(x, 1220, 400 + rand()*180, 100 + rand()*30, colorsNear, 0.95);
    }

    var stars = '';
    if (p.stars) {
      stars = '<g fill="' + p.mist + '" opacity="0.6">';
      for (i = 0; i < 60; i++) {
        var sx = rand() * 1920, sy = rand() * 400;
        var sr = rand() * 0.9 + 0.3;
        stars += '<circle cx="' + sx.toFixed(1) + '" cy="' + sy.toFixed(1) + '" r="' + sr.toFixed(2) + '"/>';
      }
      stars += '</g>';
    }

    var moon = '';
    if (kind === 'night' || kind === 'dusk') {
      var mx = kind === 'night' ? 1500 : 400;
      var my = 180;
      moon = '<circle cx="' + mx + '" cy="' + my + '" r="34" fill="' + p.mist + '" opacity="0.55"/>' +
             '<circle cx="' + (mx - 12) + '" cy="' + (my - 8) + '" r="30" fill="' + p.skyTop + '" opacity="0.9"/>';
    }

    var sun = '';
    if (kind === 'dawn') {
      sun = '<circle cx="1400" cy="300" r="60" fill="' + p.mist + '" opacity="0.35"/>' +
            '<circle cx="1400" cy="300" r="90" fill="' + p.mist + '" opacity="0.12"/>';
    }

    return '<svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">'
      + '<defs>'
      + '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">'
        + '<stop offset="0%" stop-color="' + p.skyTop + '"/>'
        + '<stop offset="70%" stop-color="' + p.skyBot + '"/>'
      + '</linearGradient>'
      + '<radialGradient id="warm" cx="50%" cy="30%" r="60%">'
        + '<stop offset="0%" stop-color="' + p.mist + '" stop-opacity="0.14"/>'
        + '<stop offset="100%" stop-color="' + p.mist + '" stop-opacity="0"/>'
      + '</radialGradient>'
      + '</defs>'
      + '<rect width="1920" height="1080" fill="url(#sky)"/>'
      + '<rect width="1920" height="1080" fill="url(#warm)"/>'
      + stars + moon + sun
      + far
      + '<rect width="1920" height="1080" fill="' + p.mist + '" opacity="0.04"/>'
      + mid
      + '<rect width="1920" height="1080" fill="' + p.mist + '" opacity="0.03"/>'
      + near
      + '<rect width="1920" height="1080" fill="#000" opacity="0.12"/>'
      + '</svg>';
  };

  var WALLPAPERS = T.WALLPAPERS = [
    {key:'misty', label:'Misty'},
    {key:'dawn',  label:'Dawn'},
    {key:'dusk',  label:'Dusk'},
    {key:'night', label:'Night'}
  ];

  var ACCENTS = T.ACCENTS = {
    sage:   {accent:'#5a7a52', bright:'#7a9c70'},
    forest: {accent:'#3d5a3a', bright:'#5a7a52'},
    amber:  {accent:'#b87838', bright:'#d89a48'},
    rust:   {accent:'#9a4840', bright:'#b85a52'}
  };

  T.applySettings = function () {
    var s = Store.data.settings;
    var wp = $('#wallpaper');
    if (wp) {
      if (s.wallpaper === 'custom' && s.custom) {
        wp.innerHTML = '';
        wp.style.backgroundImage = 'url("' + s.custom + '")';
        wp.style.backgroundSize = 'cover';
        wp.style.backgroundPosition = 'center';
      } else {
        wp.style.backgroundImage = '';
        wp.innerHTML = T.wallpaper(s.wallpaper);
      }
    }
    document.body.classList.toggle('light', s.theme === 'light');
    var a = ACCENTS[s.accent] || ACCENTS.sage;
    document.documentElement.style.setProperty('--accent', a.accent);
    document.documentElement.style.setProperty('--accent-bright', a.bright);
    var wg = $('#widgets');
    if (wg) wg.style.display = s.widgets ? 'grid' : 'none';
  };

  var WM = T.WM = {
    zTop: 100,
    wins: {},
    order: [],

    open: function (id, opts) {
      opts = opts || {};
      if (this.wins[id]) { this.restore(id); this.focus(id); return this.wins[id].el; }

      var title = opts.title || id;
      var w = opts.width  || 420;
      var h = opts.height || 300;
      var icn = opts.icon || T.icon('file', 12);
      var cascade = (this.order.length % 5) * 22;

      var win = T.el('div', {class:'window'});
      win.dataset.app = id;
      win.style.left = (110 + cascade) + 'px';
      win.style.top  = (56 + cascade) + 'px';
      win.style.width = w + 'px';
      win.style.height = h + 'px';

      win.innerHTML =
        '<div class="titlebar">' +
          '<div class="title">' + icn + '<span>' + T.esc(title) + '</span></div>' +
          '<div class="controls">' +
            '<button data-a="min" title="minimize">' + T.icon('min', 10) + '</button>' +
            '<button data-a="max" title="maximize">' + T.icon('max', 10) + '</button>' +
            '<button data-a="close" class="close" title="close">' + T.icon('x', 10) + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="body"></div>';

      var body = $('.body', win);
      if (typeof opts.render === 'function') {
        try { opts.render(body, win); }
        catch (e) { console.error('app crashed', id, e); body.innerHTML = '<div class="empty">this app failed to load</div>'; }
      }

      $('#windows-layer').appendChild(win);
      this.wins[id] = {el: win, id: id, title: title, icon: icn, min:false, max:false, snap:null, prev:null};
      this.order.push(id);
      this.focus(id);
      this._task(id);
      this._drag(win, $('.titlebar', win), id);
      this._resize(win, id);
      this._wire(win, id);
      return win;
    },

    _wire: function (win, id) {
      var self = this;
      win.addEventListener('mousedown', function () { self.focus(id); }, true);
      $('[data-a="min"]', win).addEventListener('click', function (e) { e.stopPropagation(); self.min(id); });
      $('[data-a="max"]', win).addEventListener('click', function (e) { e.stopPropagation(); self.toggleMax(id); });
      $('[data-a="close"]', win).addEventListener('click', function (e) { e.stopPropagation(); self.close(id); });
    },

    _drag: function (win, handle, id) {
      var self = this;
      handle.addEventListener('mousedown', function (e) {
        if (e.target.closest('button')) return;
        e.preventDefault();
        var w = self.wins[id]; if (!w) return;
        if (w.max || w.snap) {
          var pw = (w.prev && parseInt(w.prev.width,10)) || 420;
          self.restoreSize(id);
          win.style.left = Math.max(0, e.clientX - pw/2) + 'px';
          win.style.top  = Math.max(0, e.clientY - 10) + 'px';
        }
        var r = win.getBoundingClientRect();
        var dx = e.clientX - r.left;
        var dy = e.clientY - r.top;
        var desk = $('#desktop').getBoundingClientRect();
        var side = null;

        function move(ev) {
          var nx = ev.clientX - dx, ny = ev.clientY - dy;
          nx = Math.max(-(r.width - 60), Math.min(nx, desk.width - 40));
          ny = Math.max(0, Math.min(ny, desk.height - 26));
          win.style.left = nx + 'px';
          win.style.top  = ny + 'px';

          var E = 14, s = null;
          if (ev.clientY < desk.top + E) s = 'max';
          else if (ev.clientX < desk.left + E) s = 'left';
          else if (ev.clientX > desk.right - E) s = 'right';
          if (s !== side) { side = s; s ? T.showSnap(s) : T.hideSnap(); }
        }
        function up() {
          document.removeEventListener('mousemove', move);
          document.removeEventListener('mouseup', up);
          document.body.style.userSelect = '';
          T.hideSnap();
          if (side === 'max') self.max(id);
          else if (side === 'left') self.snap(id, 'left');
          else if (side === 'right') self.snap(id, 'right');
        }
        document.body.style.userSelect = 'none';
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
      });
      handle.addEventListener('dblclick', function (e) {
        if (e.target.closest('button')) return;
        self.toggleMax(id);
      });
    },

    _resize: function (win, id) {
      var self = this;
      ['n','s','e','w','nw','ne','sw','se'].forEach(function (d) {
        var h = T.el('div', {class: 'rz rz-' + d});
        win.appendChild(h);
        h.addEventListener('mousedown', function (e) {
          e.preventDefault(); e.stopPropagation();
          self.focus(id);
          var w = self.wins[id]; if (!w || w.max || w.snap) return;
          var sx = e.clientX, sy = e.clientY;
          var r = win.getBoundingClientRect();
          var L0 = r.left, T0 = r.top, W0 = r.width, H0 = r.height;
          var MINW = 200, MINH = 120;
          function move(ev) {
            var mx = ev.clientX - sx, my = ev.clientY - sy;
            var L = L0, Tt = T0, W = W0, H = H0;
            if (d.indexOf('e') !== -1) W = Math.max(MINW, W0 + mx);
            if (d.indexOf('s') !== -1) H = Math.max(MINH, H0 + my);
            if (d.indexOf('w') !== -1) { W = Math.max(MINW, W0 - mx); L = L0 + (W0 - W); if (L < 0) { W += L; L = 0; } }
            if (d.indexOf('n') !== -1) { H = Math.max(MINH, H0 - my); Tt = T0 + (H0 - H); if (Tt < 0) { H += Tt; Tt = 0; } }
            win.style.left = L + 'px'; win.style.top = Tt + 'px';
            win.style.width = W + 'px'; win.style.height = H + 'px';
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

    max: function (id) {
      var w = this.wins[id]; if (!w) return;
      if (!w.max && !w.snap) w.prev = {left:w.el.style.left, top:w.el.style.top, width:w.el.style.width, height:w.el.style.height};
      w.max = true; w.snap = null;
      w.el.classList.add('maximized');
      w.el.classList.remove('snapped-left','snapped-right');
      w.el.style.left = '0'; w.el.style.top = '0';
      w.el.style.width = '100%'; w.el.style.height = '100%';
      this._maxIcon(id);
    },

    snap: function (id, side) {
      var w = this.wins[id]; if (!w) return;
      if (!w.max && !w.snap) w.prev = {left:w.el.style.left, top:w.el.style.top, width:w.el.style.width, height:w.el.style.height};
      w.max = false; w.snap = side;
      w.el.classList.remove('maximized','snapped-left','snapped-right');
      w.el.classList.add(side === 'left' ? 'snapped-left' : 'snapped-right');
      w.el.style.left = side === 'left' ? '0' : '50%';
      w.el.style.top = '0';
      w.el.style.width = '50%';
      w.el.style.height = '100%';
      this._maxIcon(id);
    },

    restoreSize: function (id) {
      var w = this.wins[id]; if (!w) return;
      w.max = false; w.snap = null;
      w.el.classList.remove('maximized','snapped-left','snapped-right');
      if (w.prev) {
        w.el.style.left = w.prev.left; w.el.style.top = w.prev.top;
        w.el.style.width = w.prev.width; w.el.style.height = w.prev.height;
      }
      this._maxIcon(id);
    },

    toggleMax: function (id) {
      var w = this.wins[id]; if (!w) return;
      if (w.max || w.snap) this.restoreSize(id);
      else this.max(id);
    },

    _maxIcon: function (id) {
      var w = this.wins[id]; if (!w) return;
      var b = $('[data-a="max"]', w.el); if (!b) return;
      var isMax = w.max || w.snap;
      b.innerHTML = T.icon(isMax ? 'restore' : 'max', 10);
      b.title = isMax ? 'restore' : 'maximize';
    },

    focus: function (id) {
      var w = this.wins[id]; if (!w) return;
      if (w.min) this.restore(id);
      this.zTop += 1;
      w.el.style.zIndex = this.zTop;
      Object.keys(this.wins).forEach(function (k) { WM.wins[k].el.classList.remove('focused'); });
      w.el.classList.add('focused');
      this._tasks();
    },

    min: function (id) {
      var w = this.wins[id]; if (!w) return;
      w.min = true; w.el.style.display = 'none';
      this._tasks();
    },

    restore: function (id) {
      var w = this.wins[id]; if (!w) return;
      w.min = false; w.el.style.display = 'flex';
      this._tasks();
    },

    close: function (id) {
      var w = this.wins[id]; if (!w) return;
      w.el.remove();
      delete this.wins[id];
      this.order = this.order.filter(function (x) { return x !== id; });
      this._tasks();
    },

    _task: function (id) {
      if ($('.task[data-app="' + id + '"]')) return;
      var w = this.wins[id];
      var t = T.el('button', {class:'task', 'data-app': id});
      t.innerHTML = w.icon + '<span>' + T.esc(w.title) + '</span>';
      t.addEventListener('click', function () {
        var c = WM.wins[id]; if (!c) return;
        var on = c.el.classList.contains('focused') && !c.min;
        if (on) WM.min(id); else { WM.restore(id); WM.focus(id); }
      });
      $('#tasks').appendChild(t);
    },

    _tasks: function () {
      var self = this;
      Object.keys(this.wins).forEach(function (id) {
        var w = self.wins[id];
        var t = $('.task[data-app="' + id + '"]');
        if (!t) return;
        t.classList.toggle('on', w.el.classList.contains('focused') && !w.min);
        t.classList.toggle('min', w.min);
      });
    },

    cycle: function () {
      var vis = this.order.filter(function (id) { return WM.wins[id] && !WM.wins[id].min; });
      if (vis.length < 2) return;
      var cur = 0;
      for (var i = 0; i < vis.length; i++) {
        if (WM.wins[vis[i]].el.style.zIndex === String(WM.zTop)) { cur = i; break; }
      }
      this.focus(vis[(cur + 1) % vis.length]);
    }
  };

  T.showSnap = function (side) {
    var p = $('#snap-preview');
    if (!p) { p = T.el('div', {id:'snap-preview'}); document.body.appendChild(p); }
    var d = $('#desktop').getBoundingClientRect();
    if (side === 'max') { p.style.left = '0'; p.style.top = '0'; p.style.width = d.width + 'px'; p.style.height = d.height + 'px'; }
    else if (side === 'left') { p.style.left = '0'; p.style.top = '0'; p.style.width = (d.width/2) + 'px'; p.style.height = d.height + 'px'; }
    else { p.style.left = (d.width/2) + 'px'; p.style.top = '0'; p.style.width = (d.width/2) + 'px'; p.style.height = d.height + 'px'; }
    p.classList.add('on');
  };
  T.hideSnap = function () {
    var p = $('#snap-preview'); if (p) p.classList.remove('on');
  };

  T.ctxMenu = null;
  T.initCtx = function () {
    var m = T.el('div', {id:'context-menu'});
    document.body.appendChild(m);
    T.ctxMenu = m;
    document.addEventListener('click', function (e) { if (!m.contains(e.target)) m.classList.remove('on'); });
    document.addEventListener('contextmenu', function (e) {
      if (!e.target.closest('#desktop')) return;
      e.preventDefault();
      T.showCtx(e.clientX, e.clientY);
    });
  };

  T.showCtx = function (x, y) {
    var m = T.ctxMenu; if (!m) return;
    m.innerHTML =
      '<button data-a="refresh">' + T.icon('refresh', 13) + ' refresh desktop</button>' +
      '<button data-a="newfolder">' + T.icon('plus', 13) + ' new folder</button>' +
      '<hr>' +
      '<button data-a="garden">' + T.icon('plant', 13) + ' open garden</button>' +
      '<button data-a="tree">' + T.icon('tree', 13) + ' open tree</button>' +
      '<button data-a="settings">' + T.icon('cog', 13) + ' settings</button>' +
      '<button data-a="sysinfo">' + T.icon('sysinfo', 13) + ' system info</button>' +
      '<hr>' +
      '<button data-a="about">' + T.icon('info', 13) + ' about TerOS</button>';

    m.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.dataset.a;
        m.classList.remove('on');
        if (a === 'refresh') { T.refreshWidgets(); T.toast('desktop refreshed', 'good'); }
        else if (a === 'newfolder') {
          var name = prompt('folder name:', 'new folder');
          if (!name || !name.trim()) return;
          var path = '/home/' + name.trim();
          if (Store.data.files[path]) return T.toast('that name is taken', 'bad');
          Store.data.files[path] = {type:'folder', children:[]};
          Store.data.files['/home'].children.push(name.trim());
          Store.save();
          T.toast('folder created', 'good');
        }
        else if (a === 'garden') T.launchApp('garden');
        else if (a === 'tree') T.launchApp('tree');
        else if (a === 'settings') T.launchApp('settings');
        else if (a === 'sysinfo') T.launchApp('sysinfo');
        else if (a === 'about') $('#about-modal').classList.add('on');
      });
    });

    m.classList.add('on');
    m.style.left = Math.min(x, window.innerWidth - 200) + 'px';
    m.style.top  = Math.min(y, window.innerHeight - 280) + 'px';
  };


  function leaf(cx, cy, len, wdt, angle, fill, veinColor, highlight) {
    var h = wdt / 2;
    var t = 'translate(' + cx.toFixed(2) + ' ' + cy.toFixed(2) + ') rotate(' + angle + ')';
    var body = 'M0 0 C' + (len*0.25) + ' ' + (-h) + ' ' + (len*0.75) + ' ' + (-h*0.9) + ' ' + len + ' 0' +
               ' C' + (len*0.75) + ' ' + (h*0.9) + ' ' + (len*0.25) + ' ' + h + ' 0 0 Z';
    var veins = '';
    veins += '<path d="M0 0 L' + len + ' 0" stroke="' + veinColor + '" stroke-width="' + (wdt*0.06) + '" fill="none" opacity="0.55"/>';
    veins += '<path d="M' + (len*0.3) + ' 0 L' + (len*0.55) + ' ' + (-h*0.35) + '" stroke="' + veinColor + '" stroke-width="' + (wdt*0.04) + '" fill="none" opacity="0.4"/>';
    veins += '<path d="M' + (len*0.3) + ' 0 L' + (len*0.55) + ' ' + (h*0.35) + '" stroke="' + veinColor + '" stroke-width="' + (wdt*0.04) + '" fill="none" opacity="0.4"/>';
    veins += '<path d="M' + (len*0.6) + ' 0 L' + (len*0.8) + ' ' + (-h*0.25) + '" stroke="' + veinColor + '" stroke-width="' + (wdt*0.035) + '" fill="none" opacity="0.35"/>';
    veins += '<path d="M' + (len*0.6) + ' 0 L' + (len*0.8) + ' ' + (h*0.25) + '" stroke="' + veinColor + '" stroke-width="' + (wdt*0.035) + '" fill="none" opacity="0.35"/>';
    var hl = highlight ? '<path d="M' + (len*0.2) + ' ' + (-h*0.15) + ' C' + (len*0.4) + ' ' + (-h*0.55) + ' ' + (len*0.6) + ' ' + (-h*0.5) + ' ' + (len*0.75) + ' ' + (-h*0.25) + '" stroke="' + highlight + '" stroke-width="' + (wdt*0.08) + '" fill="none" opacity="0.35"/>' : '';
    return '<g transform="' + t + '"><path d="' + body + '" fill="' + fill + '"/>' + veins + hl + '</g>';
  }

  function flower(cx, cy, r, opts) {
    opts = opts || {};
    var petalOuter = opts.outer || '#e8b0c8';
    var petalInner = opts.inner || '#fff2f7';
    var centerA = opts.centerA || '#ffe9a0';
    var centerB = opts.centerB || '#b8801a';
    var petals = '';
    for (var i = 0; i < 6; i++) {
      var a = i * 60;
      petals += '<g transform="translate(' + cx + ' ' + cy + ') rotate(' + a + ')">';
      petals += '<path d="M0 0 C' + (-r*0.5) + ' ' + (-r*0.6) + ' ' + (-r*0.35) + ' ' + (-r*1.4) + ' 0 ' + (-r*1.5) + ' C' + (r*0.35) + ' ' + (-r*1.4) + ' ' + (r*0.5) + ' ' + (-r*0.6) + ' 0 0 Z" fill="' + petalOuter + '"/>';
      petals += '<path d="M0 -' + (r*0.15) + ' C' + (-r*0.15) + ' ' + (-r*0.6) + ' ' + (-r*0.1) + ' ' + (-r*1.05) + ' 0 -' + (r*1.15) + ' C' + (r*0.1) + ' ' + (-r*1.05) + ' ' + (r*0.15) + ' ' + (-r*0.6) + ' 0 -' + (r*0.15) + ' Z" fill="' + petalInner + '" opacity="0.6"/>';
      petals += '</g>';
    }
    var center = '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r*0.42) + '" fill="' + centerA + '"/>' +
                 '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r*0.18) + '" fill="' + centerB + '"/>';
    var stamens = '';
    for (var s = 0; s < 8; s++) {
      var sa = s * 45;
      stamens += '<circle cx="' + (cx + Math.cos(sa*Math.PI/180) * r*0.3) + '" cy="' + (cy + Math.sin(sa*Math.PI/180) * r*0.3) + '" r="' + (r*0.055) + '" fill="' + centerA + '"/>';
    }
    return petals + center + stamens;
  }

  function foliage(cx, cy, r, baseGrad, veinColor, hiColor) {
    var out = '';
    var angles = [-140, -80, -20, 30, 90, 150, -110, 60, 200, 110];
    var scales = [1.0, 1.05, 0.95, 1.0, 0.9, 1.05, 0.85, 1.0, 0.9, 0.95];
    for (var i = 0; i < angles.length; i++) {
      var a = angles[i];
      var rad = a * Math.PI / 180;
      var lx = cx + Math.cos(rad) * r * 0.55;
      var ly = cy + Math.sin(rad) * r * 0.4;
      var ll = r * 0.85 * scales[i];
      var lw = ll * 0.6;
      out += leaf(lx, ly, ll, lw, a, baseGrad, veinColor, hiColor);
    }
    return out;
  }

  T.plantSVG = function (growth) {
    var stage = T.stageOf(growth);
    var cx = 100;
    var groundY = 182;

    var svg = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" overflow="visible">';

    // soil mound
    svg += '<path d="M22 182 Q100 172 178 182 Q100 190 22 182 Z" fill="#241709"/>';
    svg += '<path d="M28 183 Q100 176 172 183" stroke="#3d2a1a" stroke-width="1.5" fill="none"/>';
    svg += '<path d="M36 186 Q100 181 164 186" stroke="#5a3d24" stroke-width="0.8" fill="none" opacity="0.6"/>';
    // a few pebbles
    svg += '<ellipse cx="42" cy="186" rx="3" ry="1.5" fill="#4a3420"/>';
    svg += '<ellipse cx="155" cy="187" rx="2.5" ry="1.2" fill="#4a3420"/>';
    svg += '<ellipse cx="80" cy="189" rx="2" ry="1" fill="#4a3420" opacity="0.7"/>';
    // moss patch
    svg += '<ellipse cx="62" cy="187" rx="8" ry="2" fill="#2e5536" opacity="0.45"/>';
    svg += '<ellipse cx="140" cy="188" rx="6" ry="1.6" fill="#4a7c59" opacity="0.4"/>';

    if (stage.key === 'seed') {
      // a seed half-buried, with a tiny hairline crack
      svg += '<ellipse cx="' + cx + '" cy="179" rx="9" ry="6" fill="#2c1d0e"/>';
      svg += '<ellipse cx="' + cx + '" cy="178.5" rx="8.5" ry="5.5" fill="#6b4a2a"/>';
      svg += '<ellipse cx="' + (cx - 3) + '" cy="176" rx="2.5" ry="1.5" fill="#c9a878" opacity="0.7"/>';
      svg += '<path d="M' + (cx-6) + ' 178 Q' + cx + ' 176 ' + (cx+6) + ' 179" stroke="#3d2a1a" stroke-width="0.5" fill="none" opacity="0.6"/>';
      // tiny sprout emerging
      svg += '<path d="M' + cx + ' 173 Q' + (cx-1) + ' 168 ' + cx + ' 163" stroke="#4a7c59" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
      svg += leaf(cx, 163, 8, 5, -170, '#7fa87f', '#2e5536', '#b8dfa8');
      svg += leaf(cx + 0.5, 164, 7, 4, -10, '#6db075', '#2e5536', '#b8dfa8');
      // dew drop
      svg += '<circle cx="' + (cx + 4) + '" cy="162" r="1.2" fill="#d8efd8" opacity="0.85"/>';

    } else if (stage.key === 'sprout') {
      var h = 24 + (growth - 20) * 0.55;
      var topY = groundY - h;
      // curved stem with a highlight edge
      svg += '<path d="M' + cx + ' ' + groundY + ' Q' + (cx - 3) + ' ' + (groundY - h/2) + ' ' + cx + ' ' + topY + '" stroke="#3d6b47" stroke-width="3" fill="none" stroke-linecap="round"/>';
      svg += '<path d="M' + (cx - 0.7) + ' ' + (groundY - 3) + ' Q' + (cx - 3.5) + ' ' + (groundY - h/2) + ' ' + (cx - 0.7) + ' ' + (topY + 3) + '" stroke="#8fbf94" stroke-width="1" fill="none" opacity="0.7"/>';
      // 4 leaves
      svg += leaf(cx - 1, topY + 6, 15, 9, -155, '#5f9d6a', '#1e3422', '#b8dfa8');
      svg += leaf(cx + 1, topY + 4, 14, 8, -25, '#4a7c59', '#1e3422', '#b8dfa8');
      svg += leaf(cx - 1, topY + 13, 11, 6.5, -168, '#3d6b47', '#16281a', null);
      svg += leaf(cx + 1, topY + 15, 10, 6, -12, '#4a7c59', '#16281a', null);
      // tip bud
      svg += '<ellipse cx="' + cx + '" cy="' + (topY - 2) + '" rx="4" ry="2.5" fill="#7fa87f"/>';
      svg += '<ellipse cx="' + (cx - 1) + '" cy="' + (topY - 2.5) + '" rx="1.5" ry="0.9" fill="#d8efd8" opacity="0.8"/>';
      // dew
      svg += '<circle cx="' + (cx + 8) + '" cy="' + (topY + 3) + '" r="1.4" fill="#d8efd8" opacity="0.9"/>';
      svg += '<circle cx="' + (cx - 9) + '" cy="' + (topY + 9) + '" r="1" fill="#d8efd8" opacity="0.7"/>';

    } else if (stage.key === 'young') {
      var h2 = 68 + (growth - 45) * 1.5;
      var topY2 = groundY - h2;
      // trunk with bark
      svg += '<path d="M' + (cx - 2) + ' ' + groundY + ' Q' + (cx - 4) + ' ' + (groundY - h2/2) + ' ' + (cx - 1) + ' ' + topY2 + '" stroke="#3d2a1a" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
      svg += '<path d="M' + (cx - 1) + ' ' + groundY + ' Q' + (cx - 2.5) + ' ' + (groundY - h2/2) + ' ' + (cx - 1) + ' ' + (topY2 + 2) + '" stroke="#8b6a44" stroke-width="1" fill="none" opacity="0.7"/>';
      svg += '<path d="M' + (cx + 1) + ' ' + (groundY - 4) + ' Q' + (cx + 0.5) + ' ' + (groundY - h2*0.6) + ' ' + (cx + 0.5) + ' ' + (topY2 + 6) + '" stroke="#1e1208" stroke-width="0.5" fill="none" opacity="0.6"/>';
      // branches
      var branches = [
        {y: groundY - 22, side:-1, len: 20, grad:'#5f9d6a'},
        {y: groundY - 26, side: 1, len: 19, grad:'#4a7c59'},
        {y: groundY - 42, side:-1, len: 18, grad:'#3d6b47'},
        {y: groundY - 46, side: 1, len: 17, grad:'#5f9d6a'},
        {y: groundY - 58, side:-1, len: 15, grad:'#4a7c59'},
        {y: groundY - 60, side: 1, len: 14, grad:'#3d6b47'},
        {y: topY2 + 8,    side:-1, len: 12, grad:'#5f9d6a'},
        {y: topY2 + 6,    side: 1, len: 12, grad:'#4a7c59'}
      ];
      branches.forEach(function (b) {
        svg += '<path d="M' + (cx + b.side * 0.5) + ' ' + b.y + ' Q' + (cx + b.side * b.len * 0.4) + ' ' + (b.y - 2) + ' ' + (cx + b.side * b.len * 0.7) + ' ' + (b.y - 4) + '" stroke="#3d2a1a" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
        svg += leaf(cx + b.side * b.len * 0.7, b.y - 4, b.len, b.len * 0.55, b.side < 0 ? -165 : -15, b.grad, '#1e3422', '#b8dfa8');
      });

      svg += '<ellipse cx="' + (cx - 1) + '" cy="' + (topY2 - 1) + '" rx="3" ry="2" fill="#7fa87f"/>';

    } else if (stage.key === 'mature') {
      var h3 = 96 + (growth - 75) * 1.6;
      var topY3 = groundY - h3;
      var trunkW = 6;
      svg += '<path d="M' + (cx - trunkW/2 - 1.5) + ' ' + groundY + ' Q' + (cx - trunkW/2 - 2) + ' ' + (groundY - h3/2) + ' ' + (cx - 1.5) + ' ' + topY3 +
               ' L' + (cx + 1.5) + ' ' + topY3 + ' Q' + (cx + trunkW/2 + 2) + ' ' + (groundY - h3/2) + ' ' + (cx + trunkW/2 + 1.5) + ' ' + groundY + ' Z" fill="#3d2a1a"/>';
      svg += '<path d="M' + (cx - 1) + ' ' + (groundY - 6) + ' Q' + (cx - 2) + ' ' + (groundY - h3*0.5) + ' ' + (cx - 0.8) + ' ' + (topY3 + 4) + '" stroke="#8b6a44" stroke-width="1.1" fill="none" opacity="0.6"/>';
      svg += '<path d="M' + (cx + 1) + ' ' + (groundY - 6) + ' Q' + (cx + 1.6) + ' ' + (groundY - h3*0.55) + ' ' + (cx + 0.8) + ' ' + (topY3 + 8) + '" stroke="#1e1208" stroke-width="0.6" fill="none" opacity="0.5"/>';
      // knots
      svg += '<ellipse cx="' + (cx - 0.5) + '" cy="' + (groundY - h3*0.35) + '" rx="1.2" ry="1.8" fill="#1e1208" opacity="0.6"/>';
      svg += '<ellipse cx="' + (cx + 1) + '" cy="' + (groundY - h3*0.62) + '" rx="1" ry="1.4" fill="#1e1208" opacity="0.5"/>';
      // roots
      svg += '<path d="M' + (cx - trunkW/2 - 1.5) + ' ' + groundY + ' Q' + (cx - trunkW - 2) + ' ' + (groundY - 2) + ' ' + (cx - trunkW/2 - 1) + ' ' + (groundY - 5) + '" stroke="#3d2a1a" stroke-width="2" fill="none" stroke-linecap="round"/>';
      svg += '<path d="M' + (cx + trunkW/2 + 1.5) + ' ' + groundY + ' Q' + (cx + trunkW + 2) + ' ' + (groundY - 2) + ' ' + (cx + trunkW/2 + 1) + ' ' + (groundY - 5) + '" stroke="#3d2a1a" stroke-width="2" fill="none" stroke-linecap="round"/>';

      var fb = [
        {x: cx - 30, y: groundY - h3*0.46, r: 15},
        {x: cx + 30, y: groundY - h3*0.58, r: 15},
        {x: cx - 20, y: groundY - h3*0.76, r: 12},
        {x: cx + 20, y: groundY - h3*0.84, r: 12},
        {x: cx,      y: topY3 - 4,         r: 16},
        {x: cx - 8,  y: topY3 + 8,         r: 11},
        {x: cx + 10, y: topY3 + 6,         r: 11}
      ];
      fb.forEach(function (f, i) {
        svg += '<path d="M' + (cx + (f.x > cx ? 1 : -1) * 1) + ' ' + (f.y + 4) + ' Q' + ((cx + f.x)/2) + ' ' + (f.y - 2) + ' ' + f.x + ' ' + f.y + '" stroke="#3d2a1a" stroke-width="' + (2 - i*0.15) + '" fill="none" stroke-linecap="round"/>';
        svg += foliage(f.x, f.y, f.r, i % 2 === 0 ? '#4a7c59' : '#3d6b47', '#16281a', '#b8dfa8');
      });
      svg += '<circle cx="' + (cx + 12) + '" cy="' + (groundY - 32) + '" r="1.3" fill="#d8efd8" opacity="0.8"/>';

    } else {
      var h4 = 116 + (growth - 95) * 2.2;
      var topY4 = groundY - h4;
      var trunkW4 = 7;
      // trunk
      svg += '<path d="M' + (cx - trunkW4/2 - 1.5) + ' ' + groundY + ' Q' + (cx - trunkW4/2 - 2.5) + ' ' + (groundY - h4/2) + ' ' + (cx - 1.8) + ' ' + topY4 +
               ' L' + (cx + 1.8) + ' ' + topY4 + ' Q' + (cx + trunkW4/2 + 2.5) + ' ' + (groundY - h4/2) + ' ' + (cx + trunkW4/2 + 1.5) + ' ' + groundY + ' Z" fill="#3d2a1a"/>';
      svg += '<path d="M' + (cx - 1.2) + ' ' + (groundY - 6) + ' Q' + (cx - 2.4) + ' ' + (groundY - h4*0.5) + ' ' + (cx - 1) + ' ' + (topY4 + 5) + '" stroke="#8b6a44" stroke-width="1.2" fill="none" opacity="0.65"/>';
      svg += '<path d="M' + (cx + 1.2) + ' ' + (groundY - 6) + ' Q' + (cx + 1.8) + ' ' + (groundY - h4*0.55) + ' ' + (cx + 1) + ' ' + (topY4 + 10) + '" stroke="#1e1208" stroke-width="0.7" fill="none" opacity="0.5"/>';

      svg += '<ellipse cx="' + (cx - 0.8) + '" cy="' + (groundY - h4*0.3) + '" rx="1.4" ry="2.2" fill="#1e1208" opacity="0.6"/>';
      svg += '<ellipse cx="' + (cx + 1.2) + '" cy="' + (groundY - h4*0.58) + '" rx="1.2" ry="1.8" fill="#1e1208" opacity="0.55"/>';
      svg += '<ellipse cx="' + (cx - 0.6) + '" cy="' + (groundY - h4*0.78) + '" rx="1" ry="1.4" fill="#1e1208" opacity="0.5"/>';

      svg += '<path d="M' + (cx - trunkW4/2 - 1.5) + ' ' + groundY + ' Q' + (cx - trunkW4 - 3) + ' ' + (groundY - 2) + ' ' + (cx - trunkW4/2 - 1) + ' ' + (groundY - 6) + '" stroke="#3d2a1a" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
      svg += '<path d="M' + (cx + trunkW4/2 + 1.5) + ' ' + groundY + ' Q' + (cx + trunkW4 + 3) + ' ' + (groundY - 2) + ' ' + (cx + trunkW4/2 + 1) + ' ' + (groundY - 6) + '" stroke="#3d2a1a" stroke-width="2.4" fill="none" stroke-linecap="round"/>';

      var ffb = [
        {x: cx - 34, y: groundY - h4*0.46, r: 15},
        {x: cx + 34, y: groundY - h4*0.58, r: 15},
        {x: cx - 22, y: groundY - h4*0.74, r: 13},
        {x: cx + 22, y: groundY - h4*0.82, r: 13},
        {x: cx,      y: topY4 - 2,         r: 17},
        {x: cx - 9,  y: topY4 + 10,        r: 12},
        {x: cx + 11, y: topY4 + 8,         r: 12}
      ];
      ffb.forEach(function (f, i) {
        svg += '<path d="M' + (cx + (f.x > cx ? 1.2 : -1.2)) + ' ' + (f.y + 6) + ' Q' + ((cx + f.x)/2) + ' ' + (f.y - 3) + ' ' + f.x + ' ' + f.y + '" stroke="#3d2a1a" stroke-width="' + (2.4 - i*0.2) + '" fill="none" stroke-linecap="round"/>';
        svg += foliage(f.x, f.y, f.r, i % 2 === 0 ? '#4a7c59' : '#5f9d6a', '#16281a', '#b8dfa8');
      });

      // flowers — pink and a few gold
      var flowerPositions = [
        {x: cx - 40, y: groundY - h4*0.52, r: 5.5, gold: false},
        {x: cx - 26, y: groundY - h4*0.48, r: 4.5, gold: true},
        {x: cx - 20, y: groundY - h4*0.62, r: 5,   gold: false},
        {x: cx + 40, y: groundY - h4*0.62, r: 5.5, gold: false},
        {x: cx + 28, y: groundY - h4*0.54, r: 4.5, gold: true},
        {x: cx + 24, y: groundY - h4*0.72, r: 5,   gold: false},
        {x: cx - 18, y: groundY - h4*0.8,  r: 4.8, gold: false},
        {x: cx + 18, y: groundY - h4*0.86, r: 5,   gold: false},
        {x: cx - 6,  y: topY4 - 10,        r: 5.5, gold: false},
        {x: cx + 5,  y: topY4 - 14,        r: 4.5, gold: true},
        {x: cx - 12, y: topY4 + 6,         r: 4.5, gold: false},
        {x: cx + 14, y: topY4 + 4,         r: 5,   gold: false},
        {x: cx + 2,  y: topY4 + 16,        r: 4.5, gold: false}
      ];
      flowerPositions.forEach(function (f) {
        svg += flower(f.x, f.y, f.r, f.gold
          ? {outer:'#f4c88a', inner:'#fff8e8', centerA:'#ffe9a0', centerB:'#8a5a10'}
          : {outer:'#e8b0c8', inner:'#fff2f7', centerA:'#ffe9a0', centerB:'#a04870'});
      });

      // falling petals in the air
      svg += '<g opacity="0.7">';
      svg += '<path d="M' + (cx - 52) + ' ' + (groundY - 40) + ' q -3 -2 -5 -1 q 2 -3 5 -1 q 3 -2 5 1 q -2 3 -5 1z" fill="#e8b0c8"/>';
      svg += '<path d="M' + (cx + 50) + ' ' + (groundY - 60) + ' q -3 -2 -5 -1 q 2 -3 5 -1 q 3 -2 5 1 q -2 3 -5 1z" fill="#f4c88a"/>';
      svg += '<path d="M' + (cx + 32) + ' ' + (groundY - 20) + ' q -2 -1.5 -3.5 -0.5 q 1.5 -2 3.5 -0.5 q 2 -1.5 3.5 0.5 q -1.5 2 -3.5 0.5z" fill="#e8b0c8"/>';
      svg += '</g>';
      svg += '<circle cx="' + (cx - 52) + '" cy="' + (groundY + 2) + '" r="1.6" fill="#e8b0c8" opacity="0.8"/>';
      svg += '<circle cx="' + (cx - 52) + '" cy="' + (groundY + 2) + '" r="0.6" fill="#ffe9a0"/>';
      svg += '<circle cx="' + (cx + 54) + '" cy="' + (groundY - 1) + '" r="1.4" fill="#e8b0c8" opacity="0.7"/>';
      svg += '<circle cx="' + (cx + 24) + '" cy="' + (groundY + 3) + '" r="1.2" fill="#f4c88a" opacity="0.75"/>';
      svg += '<circle cx="' + (cx - 20) + '" cy="' + (groundY + 4) + '" r="1" fill="#e8b0c8" opacity="0.7"/>';
    }

    svg += '</svg>';
    return svg;
  };
  T.treeSVG = function (growth) {
    var t = Math.max(0, Math.min(1, growth / 100));
    var cx = 100, groundY = 182;

    var svg = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" overflow="visible">';

    // ground mound
    svg += '<path d="M10 182 Q100 174 190 182 Q100 192 10 182 Z" fill="#241709"/>';
    svg += '<path d="M16 184 Q100 178 184 184" stroke="#3d2a1a" stroke-width="1.6" fill="none"/>';
    svg += '<path d="M26 187 Q100 182 174 187" stroke="#5a3d24" stroke-width="0.9" fill="none" opacity="0.6"/>';
    svg += '<ellipse cx="38" cy="189" rx="12" ry="2.4" fill="#2e5536" opacity="0.5"/>';
    svg += '<ellipse cx="160" cy="190" rx="10" ry="2" fill="#4a7c59" opacity="0.4"/>';
    // tiny mushrooms at the base
    svg += '<g transform="translate(52 ' + (groundY + 2) + ')">';
    svg += '<rect x="-0.6" y="-2.4" width="1.2" height="2.4" fill="#d8ceb0"/>';
    svg += '<ellipse cx="0" cy="-2.4" rx="3" ry="1.6" fill="#9a4840"/>';
    svg += '<circle cx="-0.8" cy="-2.8" r="0.4" fill="#e8dfc8" opacity="0.8"/>';
    svg += '</g>';
    svg += '<g transform="translate(146 ' + (groundY + 3) + ')">';
    svg += '<rect x="-0.5" y="-2" width="1" height="2" fill="#d8ceb0"/>';
    svg += '<ellipse cx="0" cy="-2" rx="2.2" ry="1.2" fill="#9a4840"/>';
    svg += '</g>';

    var trunkH = 60 + t * 60;
    var trunkW = 12 + t * 8;
    var topY = groundY - trunkH;

    var trunkPath =
      'M' + (cx - trunkW/2) + ' ' + groundY +
      ' C' + (cx - trunkW/2 - 3) + ' ' + (groundY - trunkH*0.3) + ' ' + (cx - trunkW/2 + 2) + ' ' + (groundY - trunkH*0.55) + ' ' + (cx - 3) + ' ' + topY +
      ' L' + (cx + 3) + ' ' + topY +
      ' C' + (cx + trunkW/2 - 2) + ' ' + (groundY - trunkH*0.55) + ' ' + (cx + trunkW/2 + 3) + ' ' + (groundY - trunkH*0.3) + ' ' + (cx + trunkW/2) + ' ' + groundY + ' Z';
    svg += '<path d="' + trunkPath + '" fill="#3d2a1a"/>';

    svg += '<path d="M' + (cx - trunkW/2) + ' ' + groundY + ' C' + (cx - trunkW/2 - 3) + ' ' + (groundY - trunkH*0.3) + ' ' + (cx - trunkW/2 + 2) + ' ' + (groundY - trunkH*0.55) + ' ' + (cx - 3) + ' ' + topY + '" stroke="#1e1208" stroke-width="0.8" fill="none" opacity="0.7"/>';
    svg += '<path d="M' + (cx + trunkW/2) + ' ' + groundY + ' C' + (cx + trunkW/2 + 3) + ' ' + (groundY - trunkH*0.3) + ' ' + (cx + trunkW/2 - 2) + ' ' + (groundY - trunkH*0.55) + ' ' + (cx + 3) + ' ' + topY + '" stroke="#8b6a44" stroke-width="0.9" fill="none" opacity="0.5"/>';
    // bark lines
    for (var i = 0; i < 5; i++) {
      var bx = cx + (i - 2) * (trunkW / 5);
      var j1 = Math.sin(i * 1.7) * 1.6;
      var j2 = Math.cos(i * 1.3) * 1.6;
      svg += '<path d="M' + bx + ' ' + (groundY - 4) + ' C' + (bx + j1) + ' ' + (groundY - trunkH*0.4) + ' ' + (bx + j2) + ' ' + (groundY - trunkH*0.7) + ' ' + (bx + j1*0.5) + ' ' + (topY + 3) + '" stroke="' + (i % 2 === 0 ? '#1e1208' : '#8b6a44') + '" stroke-width="' + (i % 2 === 0 ? 0.6 : 0.5) + '" fill="none" opacity="' + (i % 2 === 0 ? 0.6 : 0.45) + '"/>';
    }

    svg += '<ellipse cx="' + (cx - 1) + '" cy="' + (groundY - trunkH*0.28) + '" rx="2" ry="2.8" fill="#1e1208" opacity="0.7"/>';
    svg += '<ellipse cx="' + (cx - 1) + '" cy="' + (groundY - trunkH*0.28) + '" rx="1" ry="1.4" fill="#8b6a44" opacity="0.5"/>';
    svg += '<ellipse cx="' + (cx + 2) + '" cy="' + (groundY - trunkH*0.5) + '" rx="1.6" ry="2.2" fill="#1e1208" opacity="0.65"/>';
    svg += '<ellipse cx="' + (cx - 1.5) + '" cy="' + (groundY - trunkH*0.72) + '" rx="1.2" ry="1.6" fill="#1e1208" opacity="0.55"/>';
    // root flare
    svg += '<path d="M' + (cx - trunkW/2) + ' ' + groundY + ' C' + (cx - trunkW - 4) + ' ' + (groundY - 2) + ' ' + (cx - trunkW - 2) + ' ' + (groundY - 6) + ' ' + (cx - trunkW/2 - 1) + ' ' + (groundY - 8) + '" stroke="#3d2a1a" stroke-width="3" fill="none" stroke-linecap="round"/>';
    svg += '<path d="M' + (cx + trunkW/2) + ' ' + groundY + ' C' + (cx + trunkW + 4) + ' ' + (groundY - 2) + ' ' + (cx + trunkW + 2) + ' ' + (groundY - 6) + ' ' + (cx + trunkW/2 + 1) + ' ' + (groundY - 8) + '" stroke="#3d2a1a" stroke-width="3" fill="none" stroke-linecap="round"/>';

    var branchBaseY = groundY - trunkH * 0.72;
    var mainBranches = [
      {x: cx - 40, y: branchBaseY - 6, w: trunkW*0.42, end: -22},
      {x: cx + 40, y: branchBaseY - 10, w: trunkW*0.42, end: -24},
      {x: cx - 24, y: branchBaseY - 24, w: trunkW*0.32, end: -22},
      {x: cx + 26, y: branchBaseY - 26, w: trunkW*0.32, end: -20}
    ];
    mainBranches.forEach(function (b, i) {
      var dir = b.x < cx ? -1 : 1;
      svg += '<path d="M' + (cx + dir * 2) + ' ' + (branchBaseY + i*2) + ' Q' + ((cx + b.x)/2) + ' ' + (b.y - 4) + ' ' + b.x + ' ' + b.y + '" stroke="#3d2a1a" stroke-width="' + b.w + '" fill="none" stroke-linecap="round"/>';
      svg += '<path d="M' + (cx + dir * 2) + ' ' + (branchBaseY + i*2) + ' Q' + ((cx + b.x)/2) + ' ' + (b.y - 4) + ' ' + b.x + ' ' + b.y + '" stroke="#1e1208" stroke-width="0.6" fill="none" opacity="0.5"/>';
      // sub-branch
      svg += '<path d="M' + ((cx + b.x)/2) + ' ' + ((branchBaseY + b.y)/2) + ' Q' + (b.x - dir*6) + ' ' + (b.y - 8) + ' ' + (b.x - dir*10) + ' ' + (b.y - 14) + '" stroke="#3d2a1a" stroke-width="' + (b.w * 0.6) + '" fill="none" stroke-linecap="round"/>';
    });
    svg += '<path d="M' + cx + ' ' + (branchBaseY - 10) + ' L' + cx + ' ' + (topY - 2) + '" stroke="#3d2a1a" stroke-width="' + (trunkW*0.36) + '" fill="none" stroke-linecap="round"/>';

    var canopyR = 22 + t * 30;
    var clusters = [
      {x: cx,                          y: topY - 4,                    r: canopyR * 0.95},
      {x: cx - canopyR * 0.75,         y: topY + canopyR * 0.35,       r: canopyR * 0.7},
      {x: cx + canopyR * 0.75,         y: topY + canopyR * 0.3,        r: canopyR * 0.7},
      {x: cx - canopyR * 0.55,         y: topY - canopyR * 0.45,       r: canopyR * 0.62},
      {x: cx + canopyR * 0.55,         y: topY - canopyR * 0.4,        r: canopyR * 0.62},
      {x: cx,                          y: topY - canopyR * 0.65,       r: canopyR * 0.55},
      {x: cx - canopyR * 0.9,          y: topY - 2,                    r: canopyR * 0.55},
      {x: cx + canopyR * 0.9,          y: topY - 4,                    r: canopyR * 0.55}
    ];
    clusters.forEach(function (c) {
      svg += '<ellipse cx="' + c.x + '" cy="' + c.y + '" rx="' + (c.r * 1.05) + '" ry="' + (c.r * 0.95) + '" fill="#1e3422" opacity="0.85"/>';
    });
    clusters.forEach(function (c, i) {
      svg += foliage(c.x, c.y, c.r * 0.95, i % 3 === 0 ? '#3d6b47' : '#4a7c59', '#0e1e15', '#7fa87f');
    });
    var accents = [
      {x: cx - canopyR * 0.5,  y: topY - canopyR * 0.5},
      {x: cx + canopyR * 0.4,  y: topY - canopyR * 0.3},
      {x: cx,                  y: topY - canopyR * 0.75},
      {x: cx - canopyR * 0.3,  y: topY + canopyR * 0.15}
    ];
    accents.forEach(function (a) {
      svg += foliage(a.x, a.y, canopyR * 0.35, '#7fa87f', '#3d6b47', '#b8dfa8');
    });

    svg += '<g opacity="0.75">';
    svg += '<path d="M' + (cx - 60) + ' ' + (groundY - 45) + ' q -2 -1.5 -3.5 -0.5 q 1.5 -2 3.5 -0.5 q 2 -1.5 3.5 0.5 q -1.5 2 -3.5 0.5z" fill="#5f9d6a"/>';
    svg += '<path d="M' + (cx + 62) + ' ' + (groundY - 60) + ' q -2 -1.5 -3.5 -0.5 q 1.5 -2 3.5 -0.5 q 2 -1.5 3.5 0.5 q -1.5 2 -3.5 0.5z" fill="#7fa87f"/>';
    svg += '<path d="M' + (cx + 34) + ' ' + (groundY - 25) + ' q -2 -1.5 -3.5 -0.5 q 1.5 -2 3.5 -0.5 q 2 -1.5 3.5 0.5 q -1.5 2 -3.5 0.5z" fill="#4a7c59"/>';
    svg += '</g>';

    svg += '</svg>';
    return svg;
  };

  T.refreshGardenWidget = function () {
    var p = Store.data.plant;
    var el = $('#wg-plant'); if (el) el.innerHTML = T.plantSVG(p.growth);
    var n = $('#wg-name');  if (n) n.textContent = p.name;
    var s = $('#wg-stage'); if (s) s.textContent = T.stageOf(p.growth).name;
    var b = $('#wg-bar');   if (b) b.style.width = p.growth + '%';
    var pc = $('#wg-pct');  if (pc) pc.textContent = Math.floor(p.growth) + '%';
  };

  T.refreshWidgets = function () {
    var root = $('#widgets'); if (!root) return;
    root.innerHTML = '';

    var clock = T.el('div', {class:'panel', id:'w-clock'});
    clock.innerHTML =
      '<div class="greet" id="w-greet"></div>' +
      '<div class="time" id="w-time">--:--</div>' +
      '<div class="date" id="w-date"></div>';
    root.appendChild(clock);

    var apps = T.el('div', {class:'panel', id:'w-apps'});
    apps.innerHTML = '<div class="widget-label">programs</div>';
    var grid = T.el('div', {class:'grid'});
    ['files','notes','terminal','calc','garden','tree','settings','devlog','sysinfo'].forEach(function (id) {
      var a = T.apps[id]; if (!a) return;
      var tile = T.el('button', {class:'app-tile'});
      tile.innerHTML = T.icon(a.icon, 22) + '<span class="label">' + a.title + '</span>';
      tile.addEventListener('click', function () { T.launchApp(id); });
      grid.appendChild(tile);
    });
    apps.appendChild(grid);
    root.appendChild(apps);

    var g = T.el('div', {class:'panel', id:'w-garden'});
    g.innerHTML =
      '<div class="plant-mini" id="wg-plant"></div>' +
      '<div class="g-info">' +
        '<div class="g-name" id="wg-name">--</div>' +
        '<div class="g-stage" id="wg-stage">--</div>' +
        '<div class="g-bar"><i id="wg-bar"></i></div>' +
        '<div class="g-pct" id="wg-pct">0%</div>' +
        '<button class="btn green g-btn" id="wg-water">water</button>' +
      '</div>';
    root.appendChild(g);

    $('#wg-water', g).addEventListener('click', function () {
      var p = Store.data.plant;
      var before = T.stageOf(p.growth).key;
      p.growth = Math.min(100, p.growth + 8);
      p.lastWater = Date.now();
      Store.save();
      T.refreshGardenWidget();
      if (WM.wins.garden) { WM.close('garden'); setTimeout(function () { T.launchApp('garden'); }, 100); }
      var after = T.stageOf(p.growth).key;
      if (before !== after && after !== 'seed') T.toast('your plant is now a ' + T.stageOf(p.growth).name, 'good');
      else if (p.growth >= 100) T.toast('your plant is fully grown', 'good');
      else T.toast('watered', 'good');
    });
    T.refreshGardenWidget();

    var cal = T.el('div', {class:'panel', id:'w-calendar'});
    root.appendChild(cal);
    var calDate = new Date();
    function drawCal() {
      var today = new Date();
      var y = calDate.getFullYear(), m = calDate.getMonth();
      var first = new Date(y, m, 1);
      var startDow = first.getDay();
      var days = new Date(y, m + 1, 0).getDate();
      var prev = new Date(y, m, 0).getDate();
      var monthName = first.toLocaleString('en-US', {month:'long'});
      var cells = '';
      for (var i = startDow - 1; i >= 0; i--) cells += '<div class="d other">' + (prev - i) + '</div>';
      for (var d = 1; d <= days; d++) {
        var isToday = d === today.getDate() && m === today.getMonth() && y === today.getFullYear();
        cells += '<div class="d' + (isToday ? ' today' : '') + '">' + d + '</div>';
      }
      var total = startDow + days;
      var trail = (7 - (total % 7)) % 7;
      for (i = 1; i <= trail; i++) cells += '<div class="d other">' + i + '</div>';
      cal.innerHTML =
        '<div class="widget-label">' + monthName + ' ' + y + '</div>' +
        '<div class="cal-grid">' +
          ['s','m','t','w','t','f','s'].map(function (x) { return '<div class="dow">' + x + '</div>'; }).join('') +
          cells +
        '</div>';
    }
    drawCal();
    T.tick();
  };

  T.tick = function () {
    if (!Store.data) return;
    var now = new Date();
    var s = Store.data.settings;
    var h = now.getHours();
    var ap = '';
    var hh = h;
    if (!s.clock24) { ap = h >= 12 ? ' pm' : ' am'; hh = h % 12 || 12; }
    var time = String(hh).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0') + ap;
    var tray = $('#tray-clock'); if (tray) tray.textContent = time;
    var wt = $('#w-time');
    if (wt) {
      wt.textContent = time;
      var d = $('#w-date');
      if (d) d.textContent = now.toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric'});
      var g = $('#w-greet');
      if (g) {
        var gr = 'good evening';
        if (h < 5) gr = 'good night';
        else if (h < 12) gr = 'good morning';
        else if (h < 18) gr = 'good afternoon';
        g.textContent = gr + '.';
      }
    }
  };

  T.buildStart = function () {
    var menu = $('#start-menu'); if (!menu) return;
    var items = '';
    ['files','notes','terminal','calc','garden','tree','settings','devlog','sysinfo'].forEach(function (id) {
      var a = T.apps[id]; if (!a) return;
      items += '<button class="item" data-app="' + id + '">' + T.icon(a.icon, 14) + ' ' + a.title + '</button>';
    });
    menu.innerHTML =
      '<div class="head">TerOS<small>a forest, in a browser</small></div>' +
      '<div class="items">' + items + '<hr><button class="item" id="sm-about">' + T.icon('info', 14) + ' about</button></div>';

    menu.addEventListener('click', function (e) {
      var it = e.target.closest('[data-app]');
      if (it) {
        T.launchApp(it.dataset.app);
        menu.classList.remove('on');
        $('#start-btn').classList.remove('open');
      }
    });
    $('#sm-about', menu).addEventListener('click', function () {
      menu.classList.remove('on');
      $('#start-btn').classList.remove('open');
      $('#about-modal').classList.add('on');
    });
  };

  var STAGES = T.STAGES = [
    {key:'seed',      name:'seed',      th:0},
    {key:'sprout',    name:'sprout',    th:20},
    {key:'young',     name:'young',     th:45},
    {key:'mature',    name:'mature',    th:75},
    {key:'flowering', name:'flowering', th:95}
  ];
  T.stageOf = function (g) {
    var s = STAGES[0];
    for (var i = 0; i < STAGES.length; i++) if (g >= STAGES[i].th) s = STAGES[i];
    return s;
  };

  T.apps = {};
  T.registerApp = function (id, def) { T.apps[id] = def; };
  T.launchApp = function (id) {
    var a = T.apps[id];
    if (!a) { console.warn('unknown app', id); return; }
    try { a.launch(); } catch (e) { console.error('launch failed', id, e); T.toast('could not open ' + id, 'bad'); }
  };

  T.applyNaturalGrowth = function () {
    if (!Store.data || !Store.data.plant) return;
    var p = Store.data.plant;
    var mins = Math.floor((Date.now() - p.lastWater) / 60000);
    if (mins > 0) {
      p.growth = Math.min(100, p.growth + mins);
      p.lastWater = Date.now();
      Store.save();
    }
  };

  function wireGlobal() {
    var sb = $('#start-btn');
    if (sb) {
      sb.addEventListener('click', function (e) {
        e.stopPropagation();
        var m = $('#start-menu');
        var open = m.classList.toggle('on');
        sb.classList.toggle('open', open);
      });
    }
    document.addEventListener('click', function (e) {
      var m = $('#start-menu'); if (!m) return;
      var sb2 = $('#start-btn');
      if (!m.contains(e.target) && e.target !== sb2) {
        m.classList.remove('on');
        if (sb2) sb2.classList.remove('open');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var m = $('#start-menu'); if (m) m.classList.remove('on');
        var a = $('#about-modal'); if (a) a.classList.remove('on');
        if (T.ctxMenu) T.ctxMenu.classList.remove('on');
        if (sb) sb.classList.remove('open');
      }
      if (e.key === 'Meta' || e.key === 'OS') {
        e.preventDefault();
        var m2 = $('#start-menu');
        if (m2) {
          var open = m2.classList.toggle('on');
          if (sb) sb.classList.toggle('open', open);
        }
      }
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        WM.cycle();
      }
    });
    var am = $('#about-modal');
    if (am) {
      am.addEventListener('click', function () { am.classList.remove('on'); });
      var inner = am.querySelector('.modal');
      if (inner) inner.addEventListener('click', function (e) { e.stopPropagation(); });
    }
    var ac = $('#about-close'); if (ac) ac.addEventListener('click', function () { am.classList.remove('on'); });
    var ao = $('#about-ok');    if (ao) ao.addEventListener('click', function () { am.classList.remove('on'); });
  }

  function boot() {
    console.log('TerOS booting');
    var b = document.getElementById('boot');
    setTimeout(function () {
      if (b) b.classList.add('done');
      setTimeout(function () { if (b && b.parentNode) b.parentNode.removeChild(b); }, 500);
    }, 1700);
    setTimeout(function () {
      var x = document.getElementById('boot');
      if (x && x.parentNode) x.parentNode.removeChild(x);
    }, 3200);

    try {
      Store.load();
      T.applySettings();
      T.refreshWidgets();
      T.buildStart();
      T.tick();
      setInterval(T.tick, 1000);
      T.applyNaturalGrowth();
      setInterval(T.applyNaturalGrowth, 5 * 60000);
      wireGlobal();
      T.initCtx();
      console.log('TerOS ready');
    } catch (e) { console.error('boot error', e); }
  }

  window.TerOS = T;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
