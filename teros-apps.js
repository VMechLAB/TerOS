/* ============================================================
   TerOS apps
   ============================================================ */
(function () {
  'use strict';
  var T = window.TerOS;
  var $ = T.$, $$ = T.$$, el = T.el, esc = T.esc, icon = T.icon;
  var WM = T.WM, Store = T.Store;

  /* ------------------------------------------------------------
     CALCULATOR
  ------------------------------------------------------------ */
  T.registerApp('calc', {
    title: 'Calculator', icon: 'calc',
    launch: function () {
      WM.open('calc', {
        title: 'calc', width: 260, height: 340, icon: icon('calc', 12),
        render: function (body) {
          body.innerHTML =
            '<div class="calc">' +
              '<div class="display" id="c-disp">0</div>' +
              '<div class="pad">' +
                '<button class="clear" data-k="C">C</button>' +
                '<button class="op"    data-k="+/-">+/-</button>' +
                '<button class="op"    data-k="/">/</button>' +
                '<button class="op"    data-k="*">x</button>' +
                '<button data-k="7">7</button>' +
                '<button data-k="8">8</button>' +
                '<button data-k="9">9</button>' +
                '<button class="op" data-k="-">-</button>' +
                '<button data-k="4">4</button>' +
                '<button data-k="5">5</button>' +
                '<button data-k="6">6</button>' +
                '<button class="op" data-k="+">+</button>' +
                '<button data-k="1">1</button>' +
                '<button data-k="2">2</button>' +
                '<button data-k="3">3</button>' +
                '<button class="eq" data-k="=">=</button>' +
                '<button data-k="0">0</button>' +
                '<button data-k=".">.</button>' +
              '</div>' +
            '</div>';

          var disp = $('#c-disp', body);
          var cur = '0', prev = null, op = null, fresh = true;

          function show() {
            disp.textContent = cur;
            disp.classList.toggle('err', cur === 'ERROR');
          }
          function calc() {
            if (op === null || prev === null) return Number(cur);
            var a = prev, b = Number(cur);
            if (op === '+') return a + b;
            if (op === '-') return a - b;
            if (op === '*') return a * b;
            if (op === '/') return b === 0 ? NaN : a / b;
            return b;
          }
          function digit(d) {
            if (fresh) { cur = d; fresh = false; }
            else cur = cur === '0' ? d : cur + d;
          }
          function dot() {
            if (fresh) { cur = '0.'; fresh = false; return; }
            if (cur.indexOf('.') === -1) cur += '.';
          }
          function pickOp(next) {
            if (op !== null && !fresh) {
              var r = calc();
              if (!isFinite(r)) { cur = 'ERROR'; fresh = true; op = null; prev = null; show(); return; }
              cur = String(+r.toFixed(8));
              prev = Number(cur);
            } else {
              prev = Number(cur);
            }
            op = next; fresh = true; show();
          }
          function eq() {
            if (op === null) return;
            var r = calc();
            cur = !isFinite(r) ? 'ERROR' : String(+r.toFixed(8));
            prev = null; op = null; fresh = true; show();
          }
          function clr() { cur = '0'; prev = null; op = null; fresh = true; show(); }

          body.querySelector('.pad').addEventListener('click', function (e) {
            var b = e.target.closest('button'); if (!b) return;
            var k = b.dataset.k;
            if (/^[0-9]$/.test(k)) digit(k);
            else if (k === '.') dot();
            else if (k === '+/-') cur = cur.charAt(0) === '-' ? cur.slice(1) : (cur === '0' ? '0' : '-' + cur);
            else if (k === 'C') clr();
            else if (k === '=') eq();
            else if ('+-*/'.indexOf(k) !== -1) pickOp(k);
            show();
          });

          body.tabIndex = 0;
          body.addEventListener('keydown', function (e) {
            var w = WM.wins.calc;
            if (!w || w.min || w.el.style.zIndex !== String(WM.zTop)) return;
            var k = e.key;
            if (/^[0-9]$/.test(k)) digit(k);
            else if (k === '.') dot();
            else if ('+-*/'.indexOf(k) !== -1) pickOp(k);
            else if (k === 'Enter' || k === '=') eq();
            else if (k === 'Escape') clr();
            else if (k === 'Backspace') cur = (fresh || cur.length <= 1) ? '0' : cur.slice(0, -1);
            else return;
            e.preventDefault(); show();
          });
          setTimeout(function () { body.focus(); }, 40);
        }
      });
    }
  });

  /* ------------------------------------------------------------
     TERMINAL
  ------------------------------------------------------------ */
  var HELP_LINES = [
    '  help            this message',
    '  clear           clear screen',
    '  about           about TerOS',
    '  echo <text>     print text',
    '  date / time     current date / time',
    '  pwd             print working directory',
    '  ls [path]       list directory',
    '  cd <path>       change directory',
    '  tree            filesystem tree',
    '  mkdir <name>    create folder',
    '  touch <name>    create file',
    '  cat <file>      show file contents',
    '  rm <name>       delete file/folder',
    '  neofetch        system info',
    '  moss            a quiet moment',
    '  coffee          try it',
    '  sudo forest     try it'
  ];

  var MOSS = [
    'the forest is not a resource. it is a conversation.',
    'moss does not hurry, yet it covers the stone.',
    'to plant a tree is to believe in tomorrow.',
    'the clearest way into the universe is through a forest.',
    'a tree\'s roots go deep in silence.',
    'the best time to plant a tree was 20 years ago. the second best time is now.'
  ];

  T.registerApp('terminal', {
    title: 'Terminal', icon: 'term',
    launch: function () {
      WM.open('terminal', {
        title: 'term', width: 620, height: 380, icon: icon('term', 12),
        render: function (body) {
          body.innerHTML =
            '<div class="term">' +
              '<div class="out" id="t-out"></div>' +
              '<div class="in-row">' +
                '<span class="prompt">teros:<span class="p" id="t-cwd">~</span>$</span>' +
                '<input id="t-in" autocomplete="off" spellcheck="false">' +
              '</div>' +
            '</div>';

          var out = $('#t-out', body);
          var input = $('#t-in', body);
          var cwdEl = $('#t-cwd', body);
          var cwd = '/home';
          var HOME = '/home';

          function short(p) { return p === HOME ? '~' : p.replace(HOME, '~'); }
          function setCwd(p) { cwdEl.textContent = short(p); }

          function line(txt, cls) {
            var d = el('div', {class: 'line ' + (cls || '')});
            d.textContent = txt;
            out.appendChild(d); out.scrollTop = out.scrollHeight;
          }
          function lineHtml(html) {
            var d = el('div', {class: 'line', html: html});
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

          var CMDS = {
            help: function () {
              lineHtml('<span class="hl">TerOS terminal &mdash; commands</span>');
              HELP_LINES.forEach(function (l) { line(l); });
            },
            clear: function () { out.innerHTML = ''; },
            about: function () {
              lineHtml('<span class="hl">TerOS 1.0</span>');
              line('a small nature operating system.');
              line('everything here is simulated.');
            },
            echo: function (a) { line(a.join(' ')); },
            date: function () { line(new Date().toDateString()); },
            time: function () { line(new Date().toLocaleTimeString()); },
            pwd: function () { line(cwd); },
            ls: function (a) {
              var target = resolve(a[0] || cwd);
              var n = Store.data.files[target];
              if (!n) return line('ls: ' + (a[0] || target) + ': no such file', 'err');
              if (n.type === 'file') return line(target.split('/').pop());
              if (n.children.length === 0) return line('(empty)', 'dim');
              n.children.forEach(function (c) {
                var cp = (target === '/' ? '/' : target + '/') + c;
                var ch = Store.data.files[cp];
                line(c + (ch && ch.type === 'folder' ? '/' : ''));
              });
            },
            cd: function (a) {
              var t = resolve(a[0] || HOME);
              var n = Store.data.files[t];
              if (!n) return line('cd: ' + a[0] + ': no such directory', 'err');
              if (n.type !== 'folder') return line('cd: ' + a[0] + ': not a directory', 'err');
              cwd = t; setCwd(cwd);
            },
            tree: function () {
              line('~/');
              (function walk(path, prefix) {
                var n = Store.data.files[path];
                if (!n || n.type !== 'folder') return;
                n.children.forEach(function (name, i) {
                  var last = i === n.children.length - 1;
                  var br = last ? '`-- ' : '|-- ';
                  var cp = (path === '/' ? '/' : path + '/') + name;
                  var ch = Store.data.files[cp];
                  var isDir = ch && ch.type === 'folder';
                  line(prefix + br + name + (isDir ? '/' : ''));
                  if (isDir) walk(cp, prefix + (last ? '    ' : '|   '));
                });
              })('/home', '');
            },
            mkdir: function (a) {
              if (!a[0]) return line('mkdir: missing name', 'err');
              var t = resolve(a[0]);
              if (Store.data.files[t]) return line('mkdir: already exists', 'err');
              var parent = t.replace(/\/[^/]+$/, '') || '/';
              var pn = Store.data.files[parent];
              if (!pn || pn.type !== 'folder') return line('mkdir: no such directory', 'err');
              var name = t.split('/').pop();
              Store.data.files[t] = {type:'folder', children:[]};
              pn.children.push(name);
              Store.save();
              T.toast('folder created', 'good');
            },
            touch: function (a) {
              if (!a[0]) return line('touch: missing name', 'err');
              var t = resolve(a[0]);
              if (Store.data.files[t]) return line('touch: already exists', 'err');
              var parent = t.replace(/\/[^/]+$/, '') || '/';
              var pn = Store.data.files[parent];
              if (!pn || pn.type !== 'folder') return line('touch: no such directory', 'err');
              var name = t.split('/').pop();
              Store.data.files[t] = {type:'file', content:''};
              pn.children.push(name);
              Store.save();
            },
            cat: function (a) {
              if (!a[0]) return line('cat: missing name', 'err');
              var t = resolve(a[0]);
              var n = Store.data.files[t];
              if (!n) return line('cat: no such file', 'err');
              if (n.type === 'folder') return line('cat: is a directory', 'err');
              line(n.content || '(empty)', n.content ? '' : 'dim');
            },
            rm: function (a) {
              if (!a[0]) return line('rm: missing name', 'err');
              var t = resolve(a[0]);
              var n = Store.data.files[t];
              if (!n) return line('rm: no such file', 'err');
              if (t === HOME || t === '/') return line('rm: permission denied', 'err');
              var parent = t.replace(/\/[^/]+$/, '') || '/';
              var pn = Store.data.files[parent];
              if (pn) pn.children = pn.children.filter(function (c) { return c !== t.split('/').pop(); });
              Object.keys(Store.data.files).forEach(function (p) {
                if (p === t || p.indexOf(t + '/') === 0) delete Store.data.files[p];
              });
              Store.save();
              T.toast('removed', 'good');
            },
            neofetch: function () {
              lineHtml('<span class="hl">      /\\      </span>  <span class="hl">teros@forest</span>');
              lineHtml('<span class="hl">     /  \\     </span>  -------------');
              lineHtml('<span class="hl">    /    \\    </span>  os: teros 1.0');
              lineHtml('<span class="hl">   /  /\\  \\   </span>  kernel: terkernel');
              lineHtml('<span class="hl">  /  /  \\  \\  </span>  shell: tsh');
              lineHtml('<span class="hl"> /__/    \\__\\ </span>  wm: terwm');
              line('                resolution: ' + window.innerWidth + 'x' + window.innerHeight);
              line('                uptime: ' + Math.floor(performance.now()/60000) + ' min');
            },
            moss: function () {
              line('');
              lineHtml('<span class="dim">  ' + MOSS[Math.floor(Math.random() * MOSS.length)] + '</span>');
              line('');
            },
            coffee: function () {
              line('brewing...');
              setTimeout(function () { line('no coffee module installed.'); }, 400);
              setTimeout(function () { line('(or just go make one)', 'dim'); }, 900);
            },
            sudo: function (a) {
              if ((a[0]||'').toLowerCase() === 'forest') {
                line('entering the forest...', 'dim');
                setTimeout(function () {
                  lineHtml('<span class="hl">trees: 8,421</span>');
                  lineHtml('<span class="hl">moss:  growing</span>');
                  lineHtml('<span class="hl">air:   clean</span>');
                  lineHtml('<span class="hl">you:   welcome</span>');
                }, 500);
              } else {
                line('teros is not in the sudoers file. this incident has been logged.', 'err');
              }
            }
          };

          input.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter') return;
            var raw = input.value; input.value = '';
            line('teros:' + short(cwd) + '$ ' + raw, 'in');
            var t = raw.trim();
            if (!t) return;
            var parts = t.split(/\s+/);
            var cmd = parts[0].toLowerCase();
            var args = parts.slice(1);
            var fn = CMDS[cmd];
            if (typeof fn === 'function') {
              try { fn(args); } catch (err) { line('error: ' + err.message, 'err'); }
            } else {
              line('teros: command not found: ' + cmd, 'err');
              line("type 'help' for a list.", 'dim');
            }
          });

          body.addEventListener('mousedown', function (e) {
            if (!e.target.closest('button, input')) setTimeout(function () { input.focus(); }, 0);
          });

          lineHtml('<span class="hl">TerOS terminal 1.0</span>');
          line('type "help" to see commands.', 'dim');
          line('');
          setCwd(cwd);
          setTimeout(function () { input.focus(); }, 60);
        }
      });
    }
  });

  /* ------------------------------------------------------------
     NOTES
  ------------------------------------------------------------ */
  T.registerApp('notes', {
    title: 'Notes', icon: 'notes',
    launch: function () {
      WM.open('notes', {
        title: 'notes', width: 660, height: 420, icon: icon('notes', 12),
        render: function (body) {
          body.innerHTML =
            '<div class="notes">' +
              '<div class="side">' +
                '<div class="side-tools">' +
                  '<button class="btn green" id="n-new">+ new</button>' +
                  '<input class="input" id="n-search" placeholder="search...">' +
                '</div>' +
                '<div class="list" id="n-list"></div>' +
              '</div>' +
              '<div class="edit" id="n-edit"></div>' +
            '</div>';

          var list = $('#n-list', body);
          var edit = $('#n-edit', body);
          var search = $('#n-search', body);
          var activeId = null;
          var query = '';

          function visible() {
            var all = Store.data.notes.slice().sort(function (a,b) { return b.updated - a.updated; });
            if (!query) return all;
            var q = query.toLowerCase();
            return all.filter(function (n) {
              return (n.title||'').toLowerCase().indexOf(q) !== -1 ||
                     (n.body||'').toLowerCase().indexOf(q) !== -1;
            });
          }

          function drawList() {
            list.innerHTML = '';
            var notes = visible();
            if (!notes.length) {
              list.innerHTML = '<div class="empty">' + (query ? 'no matches' : 'no notes') + '</div>';
              return;
            }
            notes.forEach(function (n) {
              var d = el('div', {class:'item' + (n.id === activeId ? ' active' : '')});
              d.innerHTML = esc(n.title || 'untitled') + '<small>' + T.relTime(n.updated) + '</small>';
              d.addEventListener('click', function () { activeId = n.id; drawList(); drawEdit(); });
              list.appendChild(d);
            });
          }

          function drawEdit() {
            var n = Store.data.notes.filter(function (x) { return x.id === activeId; })[0];
            if (!n) { edit.innerHTML = '<div class="empty">select a note</div>'; return; }
            edit.innerHTML =
              '<div class="edit-bar">' +
                '<input class="title" id="n-title" value="' + esc(n.title) + '" placeholder="untitled">' +
                '<button class="btn red" id="n-del">delete</button>' +
              '</div>' +
              '<textarea id="n-body" placeholder="start writing...">' + esc(n.body) + '</textarea>';

            var ti = $('#n-title', edit);
            var bi = $('#n-body', edit);
            var timer;
            function save() {
              n.title = ti.value;
              n.body = bi.value;
              n.updated = Date.now();
              Store.save();
              drawList();
            }
            function deb() { clearTimeout(timer); timer = setTimeout(save, 400); }
            ti.addEventListener('input', deb);
            bi.addEventListener('input', deb);

            $('#n-del', edit).addEventListener('click', function () {
              if (!confirm('delete this note?')) return;
              Store.data.notes = Store.data.notes.filter(function (x) { return x.id !== activeId; });
              activeId = Store.data.notes[0] ? Store.data.notes[0].id : null;
              Store.save(); drawList(); drawEdit();
              T.toast('note deleted', 'good');
            });
            setTimeout(function () { bi.focus(); }, 30);
          }

          search.addEventListener('input', function () { query = search.value.trim(); drawList(); });
          $('#n-new', body).addEventListener('click', function () {
            var id = 'n' + Date.now();
            Store.data.notes.unshift({id:id, title:'new note', body:'', updated:Date.now()});
            activeId = id;
            Store.save(); drawList(); drawEdit();
          });

          if (Store.data.notes.length) activeId = Store.data.notes[0].id;
          drawList(); drawEdit();
        }
      });
    }
  });

  /* ------------------------------------------------------------
     FILES
  ------------------------------------------------------------ */
  T.registerApp('files', {
    title: 'Files', icon: 'files',
    launch: function () {
      WM.open('files', {
        title: 'files', width: 620, height: 420, icon: icon('files', 12),
        render: function (body) {
          body.innerHTML =
            '<div class="files">' +
              '<div class="bar">' +
                '<button class="btn" id="f-back">..</button>' +
                '<input class="input" id="f-search" placeholder="search...">' +
                '<button class="btn" id="f-refresh">R</button>' +
              '</div>' +
              '<div class="crumbs" id="f-crumbs"></div>' +
              '<div class="list" id="f-list"></div>' +
              '<div class="actions">' +
                '<button class="btn" id="f-mkdir">' + icon('plus', 12) + ' folder</button>' +
                '<button class="btn" id="f-touch">' + icon('plus', 12) + ' file</button>' +
              '</div>' +
            '</div>';

          var cwd = '/home';
          var query = '';
          var search = $('#f-search', body);

          function del(path) {
            var parent = path.replace(/\/[^/]+$/, '') || '/';
            var pn = Store.data.files[parent];
            if (pn) pn.children = pn.children.filter(function (c) { return c !== path.split('/').pop(); });
            Object.keys(Store.data.files).forEach(function (p) {
              if (p === path || p.indexOf(path + '/') === 0) delete Store.data.files[p];
            });
            Store.save();
          }
          function rename(path, nn) {
            var parent = path.replace(/\/[^/]+$/, '') || '/';
            var pn = Store.data.files[parent];
            var old = path.split('/').pop();
            var np = (parent === '/' ? '' : parent) + '/' + nn;
            if (Store.data.files[np]) { T.toast('already exists', 'bad'); return false; }
            Store.data.files[np] = Store.data.files[path];
            delete Store.data.files[path];
            if (pn) pn.children = pn.children.map(function (c) { return c === old ? nn : c; });
            Object.keys(Store.data.files).forEach(function (p) {
              if (p.indexOf(path + '/') === 0) {
                var inner = np + p.slice(path.length);
                Store.data.files[inner] = Store.data.files[p];
                delete Store.data.files[p];
              }
            });
            Store.save(); return true;
          }
          function move(src, dst) {
            var name = src.split('/').pop();
            if (!Store.data.files[dst] || Store.data.files[dst].type !== 'folder') { T.toast('not a folder', 'bad'); return false; }
            if (dst === src || dst.indexOf(src + '/') === 0) { T.toast('cannot move into itself', 'bad'); return false; }
            var np = (dst === '/' ? '' : dst) + '/' + name;
            if (Store.data.files[np]) { T.toast('already there', 'bad'); return false; }
            var op = src.replace(/\/[^/]+$/, '') || '/';
            var opn = Store.data.files[op];
            if (opn) opn.children = opn.children.filter(function (c) { return c !== name; });
            Store.data.files[dst].children.push(name);
            var todo = [];
            Object.keys(Store.data.files).forEach(function (p) {
              if (p === src || p.indexOf(src + '/') === 0) todo.push(p);
            });
            todo.forEach(function (p) {
              var p2 = np + p.slice(src.length);
              Store.data.files[p2] = Store.data.files[p];
              delete Store.data.files[p];
            });
            Store.save(); return true;
          }

          function drawCrumbs() {
            var c = $('#f-crumbs', body);
            c.innerHTML = '';
            var parts = cwd === '/' ? [''] : cwd.split('/');
            parts.forEach(function (p, i) {
              var last = i === parts.length - 1;
              var path = i === 0 ? '/' : '/' + parts.slice(1, i+1).join('/');
              var label = i === 0 ? 'home' : (p || 'home');
              var s = el('span', {class:'c' + (last ? ' last' : ''), text: label});
              s.addEventListener('click', function () { cwd = path; query = ''; search.value = ''; draw(); });
              c.appendChild(s);
              if (!last) c.appendChild(el('span', {class:'s', text:' / '}));
            });
          }

          function draw() {
            var node = Store.data.files[cwd];
            if (!node || node.type !== 'folder') { cwd = '/home'; return draw(); }
            drawCrumbs();
            var list = $('#f-list', body);
            list.innerHTML = '';
            var items = node.children.slice();
            if (query) {
              var q = query.toLowerCase();
              items = items.filter(function (n) { return n.toLowerCase().indexOf(q) !== -1; });
            }
            if (!items.length) {
              list.innerHTML = '<div class="empty">' + (query ? 'no matches' : 'empty folder') + '</div>';
              return;
            }
            items.sort(function (a, b) {
              var ap = (cwd === '/' ? '/' : cwd + '/') + a;
              var bp = (cwd === '/' ? '/' : cwd + '/') + b;
              var an = Store.data.files[ap], bn = Store.data.files[bp];
              var ad = an && an.type === 'folder';
              var bd = bn && bn.type === 'folder';
              if (ad !== bd) return ad ? -1 : 1;
              return a.localeCompare(b);
            });

            items.forEach(function (name) {
              var path = (cwd === '/' ? '/' : cwd + '/') + name;
              var node2 = Store.data.files[path];
              if (!node2) return;
              var isDir = node2.type === 'folder';
              var row = el('div', {class:'row'});
              row.innerHTML = icon(isDir ? 'folder' : 'file', 14) +
                '<span class="name">' + esc(name) + '</span>' +
                '<span class="meta">' + (isDir ? node2.children.length + ' items' : (node2.content||'').length + ' ch') + '</span>';

              row.addEventListener('dblclick', function () {
                if (isDir) { cwd = path; query = ''; search.value = ''; draw(); }
                else {
                  // open .txt in Notes
                  var noteId = 'n' + Date.now();
                  Store.data.notes.unshift({id:noteId, title: name.replace(/\.txt$/i,''), body: node2.content || '', updated: Date.now()});
                  Store.save();
                  if (WM.wins.notes) WM.close('notes');
                  setTimeout(function () { T.launchApp('notes'); }, 100);
                }
              });

              row.addEventListener('contextmenu', function (e) {
                e.preventDefault();
                var a = prompt('rename, "move", or "delete":', name);
                if (a === null) return;
                var v = a.trim().toLowerCase();
                if (v === 'delete') {
                  if (!confirm('delete "' + name + '"?')) return;
                  del(path); draw(); T.toast('deleted', 'good');
                } else if (v === 'move') {
                  var dst = prompt('move to (full path, e.g. /home/Projects):', '/home');
                  if (!dst || !dst.trim()) return;
                  if (move(path, dst.trim())) { draw(); T.toast('moved', 'good'); }
                } else if (a.trim() && a.trim() !== name) {
                  if (rename(path, a.trim())) { draw(); T.toast('renamed', 'good'); }
                }
              });

              list.appendChild(row);
            });
          }

          search.addEventListener('input', function () { query = search.value.trim(); draw(); });
          $('#f-back', body).addEventListener('click', function () {
            if (cwd === '/' || cwd === '/home') return;
            cwd = cwd.replace(/\/[^/]+$/, '') || '/';
            query = ''; search.value = ''; draw();
          });
          $('#f-refresh', body).addEventListener('click', draw);
          $('#f-mkdir', body).addEventListener('click', function () {
            var n = prompt('folder name:', 'new folder');
            if (!n || !n.trim()) return;
            var p = (cwd === '/' ? '' : cwd) + '/' + n.trim();
            if (Store.data.files[p]) return T.toast('already exists', 'bad');
            Store.data.files[p] = {type:'folder', children:[]};
            Store.data.files[cwd].children.push(n.trim());
            Store.save(); draw(); T.toast('folder created', 'good');
          });
          $('#f-touch', body).addEventListener('click', function () {
            var n = prompt('file name:', 'untitled.txt');
            if (!n || !n.trim()) return;
            var p = (cwd === '/' ? '' : cwd) + '/' + n.trim();
            if (Store.data.files[p]) return T.toast('already exists', 'bad');
            Store.data.files[p] = {type:'file', content:''};
            Store.data.files[cwd].children.push(n.trim());
            Store.save(); draw(); T.toast('file created', 'good');
          });

          draw();
        }
      });
    }
  });

  /* ------------------------------------------------------------
     GARDEN
  ------------------------------------------------------------ */
  T.registerApp('garden', {
    title: 'Garden', icon: 'plant',
    launch: function () {
      WM.open('garden', {
        title: 'garden', width: 380, height: 480, icon: icon('plant', 12),
        render: function (body) {
          body.innerHTML =
            '<div class="garden-app">' +
              '<div class="garden-stage" id="g-stage"></div>' +
              '<div class="stats">' +
                '<div class="stat"><div class="k">name</div><div class="v" id="g-name">--</div></div>' +
                '<div class="stat"><div class="k">stage</div><div class="v" id="g-stage-t">--</div></div>' +
                '<div class="stat"><div class="k">growth</div><div class="v" id="g-pct">0%</div></div>' +
              '</div>' +
              '<div class="progress"><i id="g-bar"></i></div>' +
              '<div class="actions-row">' +
                '<button class="btn green" id="g-water">' + icon('drop', 12) + ' water</button>' +
                '<button class="btn" id="g-rename">rename</button>' +
              '</div>' +
            '</div>';

          function draw() {
            var p = Store.data.plant;
            $('#g-stage', body).innerHTML = T.plantSVG(p.growth);
            $('#g-name', body).textContent = p.name;
            $('#g-stage-t', body).textContent = T.stageOf(p.growth).name;
            $('#g-pct', body).textContent = Math.floor(p.growth) + '%';
            $('#g-bar', body).style.width = p.growth + '%';
          }

          $('#g-water', body).addEventListener('click', function () {
            var p = Store.data.plant;
            var before = T.stageOf(p.growth).key;
            p.growth = Math.min(100, p.growth + 8);
            p.lastWater = Date.now();
            Store.save(); draw(); T.refreshGardenWidget();
            var after = T.stageOf(p.growth).key;
            if (before !== after && after !== 'seed') T.toast('plant is now a ' + T.stageOf(p.growth).name, 'good');
            else if (p.growth >= 100) T.toast('fully grown.', 'good');
            else T.toast('+8 growth', 'good');
          });

          $('#g-rename', body).addEventListener('click', function () {
            var n = prompt('name:', Store.data.plant.name);
            if (!n || !n.trim()) return;
            Store.data.plant.name = n.trim().slice(0, 20);
            Store.save(); draw(); T.refreshGardenWidget();
          });

          draw();
        }
      });
    }
  });

  /* ------------------------------------------------------------
     TREE
  ------------------------------------------------------------ */
  T.registerApp('tree', {
    title: 'Tree', icon: 'tree',
    launch: function () {
      WM.open('tree', {
        title: 'tree', width: 380, height: 500, icon: icon('tree', 12),
        render: function (body) {
          body.innerHTML =
            '<div class="tree-app">' +
              '<div class="tree-stage" id="t-stage"></div>' +
              '<div class="stats">' +
                '<div class="stat"><div class="k">name</div><div class="v" id="t-name">--</div></div>' +
                '<div class="stat"><div class="k">age</div><div class="v" id="t-age">--</div></div>' +
                '<div class="stat"><div class="k">growth</div><div class="v" id="t-pct">0%</div></div>' +
              '</div>' +
              '<div class="progress"><i id="t-bar"></i></div>' +
              '<div class="actions-row">' +
                '<button class="btn green" id="t-water">' + icon('drop', 12) + ' water</button>' +
                '<button class="btn" id="t-rename">rename</button>' +
              '</div>' +
            '</div>';

          function ageLabel(g) {
            var y = Math.floor(g * 4);
            if (y === 0) return 'seedling';
            return y + 'y';
          }
          function draw() {
            var t = Store.data.tree;
            $('#t-stage', body).innerHTML = T.treeSVG(t.growth);
            $('#t-name', body).textContent = t.name;
            $('#t-age', body).textContent = ageLabel(t.growth);
            $('#t-pct', body).textContent = Math.floor(t.growth) + '%';
            $('#t-bar', body).style.width = t.growth + '%';
          }
          $('#t-water', body).addEventListener('click', function () {
            var t = Store.data.tree;
            var before = t.growth;
            t.growth = Math.min(100, t.growth + 6);
            t.lastWater = Date.now();
            Store.save(); draw();
            if (before < 100 && t.growth >= 100) T.toast('oakley is fully grown.', 'good');
            else T.toast('+6 growth', 'good');
          });
          $('#t-rename', body).addEventListener('click', function () {
            var n = prompt('name:', Store.data.tree.name);
            if (!n || !n.trim()) return;
            Store.data.tree.name = n.trim().slice(0, 20);
            Store.save(); draw();
          });
          draw();
        }
      });
    }
  });

  /* ------------------------------------------------------------
     SETTINGS
  ------------------------------------------------------------ */
  T.registerApp('settings', {
    title: 'Settings', icon: 'cog',
    launch: function () {
      WM.open('settings', {
        title: 'settings', width: 640, height: 460, icon: icon('cog', 12),
        render: function (body) {
          body.innerHTML =
            '<div class="settings">' +
              '<div class="nav">' +
                '<button class="active" data-tab="look">' + icon('image', 12) + ' look</button>' +
                '<button data-tab="desk">' + icon('folder', 12) + ' desktop</button>' +
                '<button data-tab="about">' + icon('info', 12) + ' about</button>' +
              '</div>' +
              '<div class="body" id="s-body"></div>' +
            '</div>';

          var bodyEl = $('#s-body', body);
          var tabs = $$('.nav button', body);

          function show(tab) {
            tabs.forEach(function (b) { b.classList.toggle('active', b.dataset.tab === tab); });
            var s = Store.data.settings;

            if (tab === 'look') {
              var wall = '';
              T.WALLPAPERS.forEach(function (w) {
                wall += '<div class="wall-opt' + (s.wallpaper === w.key ? ' active' : '') + '" data-w="' + w.key + '">' + T.wallpaper(w.key) + '</div>';
              });
              if (s.custom) {
                wall += '<div class="wall-opt custom' + (s.wallpaper === 'custom' ? ' active' : '') + '" data-w="custom" style="background-image:url(\'' + s.custom + '\')"></div>';
              }

              var sw = '';
              Object.keys(T.ACCENTS).forEach(function (k) {
                sw += '<div class="swatch' + (s.accent === k ? ' active' : '') + '" data-a="' + k + '" style="background:' + T.ACCENTS[k].bright + '"></div>';
              });

              bodyEl.innerHTML =
                '<h3>look</h3>' +
                '<div class="row" style="flex-direction:column;align-items:stretch">' +
                  '<div class="k">wallpaper</div>' +
                  '<div class="wall-grid" id="s-walls">' + wall + '</div>' +
                  '<div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap">' +
                    '<input type="file" id="s-file" accept="image/*" style="display:none">' +
                    '<button class="btn" id="s-upload">' + icon('up', 12) + ' upload custom</button>' +
                    (s.custom ? '<button class="btn red" id="s-clear">remove custom</button>' : '') +
                  '</div>' +
                '</div>' +
                '<div class="row">' +
                  '<div><div class="k">light mode</div><div class="d">softer palette for daylight</div></div>' +
                  '<div class="toggle' + (s.theme === 'light' ? ' on' : '') + '" data-t="theme"></div>' +
                '</div>' +
                '<div class="row">' +
                  '<div><div class="k">accent color</div><div class="d">highlights throughout the os</div></div>' +
                  '<div class="swatches" id="s-sw">' + sw + '</div>' +
                '</div>';

              $('#s-walls', bodyEl).addEventListener('click', function (e) {
                var o = e.target.closest('.wall-opt'); if (!o) return;
                s.wallpaper = o.dataset.w;
                Store.save(); T.applySettings(); show('look');
              });
              $('#s-sw', bodyEl).addEventListener('click', function (e) {
                var sw2 = e.target.closest('.swatch'); if (!sw2) return;
                s.accent = sw2.dataset.a;
                Store.save(); T.applySettings(); show('look');
              });
              $('[data-t="theme"]', bodyEl).addEventListener('click', function () {
                s.theme = s.theme === 'light' ? 'dark' : 'light';
                Store.save(); T.applySettings(); show('look');
              });
              var file = $('#s-file', bodyEl);
              $('#s-upload', bodyEl).addEventListener('click', function () { file.click(); });
              file.addEventListener('change', function () {
                var f = file.files && file.files[0]; if (!f) return;
                if (!f.type || f.type.indexOf('image/') !== 0) return T.toast('not an image', 'bad');
                if (f.size > 2 * 1024 * 1024) return T.toast('too large (max 2 MB)', 'bad');
                var r = new FileReader();
                r.onload = function (ev) {
                  s.custom = ev.target.result;
                  s.wallpaper = 'custom';
                  Store.save(); T.applySettings(); show('look');
                  T.toast('custom wallpaper set', 'good');
                };
                r.onerror = function () { T.toast('could not read', 'bad'); };
                r.readAsDataURL(f);
              });
              var clr = $('#s-clear', bodyEl);
              if (clr) clr.addEventListener('click', function () {
                s.custom = null;
                if (s.wallpaper === 'custom') s.wallpaper = 'misty';
                Store.save(); T.applySettings(); show('look');
                T.toast('removed', 'good');
              });
            }

            if (tab === 'desk') {
              bodyEl.innerHTML =
                '<h3>desktop</h3>' +
                '<div class="row">' +
                  '<div><div class="k">24-hour clock</div><div class="d">show times as HH:MM</div></div>' +
                  '<div class="toggle' + (s.clock24 ? ' on' : '') + '" data-t="clock"></div>' +
                '</div>' +
                '<div class="row">' +
                  '<div><div class="k">widgets</div><div class="d">clock, programs, garden, calendar</div></div>' +
                  '<div class="toggle' + (s.widgets ? ' on' : '') + '" data-t="widgets"></div>' +
                '</div>' +
                '<div class="row">' +
                  '<div><div class="k">reset TerOS</div><div class="d">clear files, notes, plants, settings</div></div>' +
                  '<button class="btn red" id="s-reset">reset</button>' +
                '</div>';

              $('[data-t="clock"]', bodyEl).addEventListener('click', function () {
                s.clock24 = !s.clock24;
                Store.save(); show('desk'); T.tick();
              });
              $('[data-t="widgets"]', bodyEl).addEventListener('click', function () {
                s.widgets = !s.widgets;
                Store.save(); T.applySettings(); show('desk');
              });
              $('#s-reset', bodyEl).addEventListener('click', function () {
                if (!confirm('reset TerOS? everything you made will be lost.')) return;
                Store.reset(); T.applySettings(); T.refreshWidgets(); T.tick();
                T.toast('reset', 'good');
              });
            }

            if (tab === 'about') {
              bodyEl.innerHTML =
                '<h3>about</h3>' +
                '<div class="row"><div class="k">version</div><div class="d">1.0</div></div>' +
                '<div class="row"><div class="k">kernel</div><div class="d">terkernel</div></div>' +
                '<div class="row"><div class="k">wm</div><div class="d">terwm 2</div></div>' +
                '<div class="row"><div class="k">arch</div><div class="d">web / local</div></div>' +
                '<div class="row"><div class="k">storage</div><div class="d">localStorage</div></div>' +
                '<div class="row"><div class="k">apps</div><div class="d">9</div></div>';
            }
          }

          tabs.forEach(function (b) {
            b.addEventListener('click', function () { show(b.dataset.tab); });
          });
          show('look');
        }
      });
    }
  });

  /* ------------------------------------------------------------
     SYSTEM INFO
  ------------------------------------------------------------ */
  T.registerApp('sysinfo', {
    title: 'System Info', icon: 'sysinfo',
    launch: function () {
      WM.open('sysinfo', {
        title: 'sysinfo', width: 440, height: 400, icon: icon('sysinfo', 12),
        render: function (body) {
          var bytes = new Blob([localStorage.getItem(Store.KEY) || '']).size;
          var wins = Object.keys(WM.wins).length;
          var up = performance.now();
          var mins = Math.floor(up / 60000);
          var secs = Math.floor((up % 60000) / 1000);
          var files = Object.keys(Store.data.files).length;
          var notes = Store.data.notes.length;
          var ua = navigator.userAgent;
          var browser = 'unknown';
          if (ua.indexOf('Firefox') !== -1) browser = 'firefox';
          else if (ua.indexOf('Edg') !== -1) browser = 'edge';
          else if (ua.indexOf('Chrome') !== -1) browser = 'chrome';
          else if (ua.indexOf('Safari') !== -1) browser = 'safari';

          body.innerHTML =
            '<div class="sysinfo">' +
              '<div class="hero">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0" shape-rendering="crispEdges">' +
                  '<rect x="11" y="2" width="2" height="4" fill="currentColor"/>' +
                  '<rect x="8" y="5" width="8" height="3" fill="currentColor"/>' +
                  '<rect x="5" y="8" width="14" height="3" fill="currentColor"/>' +
                  '<rect x="8" y="11" width="8" height="3" fill="currentColor"/>' +
                  '<rect x="10" y="14" width="4" height="8" fill="currentColor"/>' +
                '</svg>' +
                '<div><h2>TerOS</h2><div class="v">VERSION 1.0</div></div>' +
              '</div>' +
              '<div class="row"><span class="k">kernel</span><span class="v">terkernel 1.0</span></div>' +
              '<div class="row"><span class="k">shell</span><span class="v">tsh</span></div>' +
              '<div class="row"><span class="k">wm</span><span class="v">terwm 2</span></div>' +
              '<div class="row"><span class="k">arch</span><span class="v">web / local</span></div>' +
              '<div class="row"><span class="k">storage</span><span class="v">localStorage</span></div>' +
              '<div class="row"><span class="k">used</span><span class="v">' + T.bytes(bytes) + '</span></div>' +
              '<div class="row"><span class="k">fs nodes</span><span class="v">' + files + '</span></div>' +
              '<div class="row"><span class="k">notes</span><span class="v">' + notes + '</span></div>' +
              '<div class="row"><span class="k">open windows</span><span class="v">' + wins + '</span></div>' +
              '<div class="row"><span class="k">display</span><span class="v">' + window.innerWidth + ' x ' + window.innerHeight + '</span></div>' +
              '<div class="row"><span class="k">browser</span><span class="v">' + browser + '</span></div>' +
              '<div class="row"><span class="k">uptime</span><span class="v">' + mins + 'm ' + secs + 's</span></div>' +
            '</div>';
        }
      });
    }
  });

  /* ------------------------------------------------------------
     DEVLOG
  ------------------------------------------------------------ */
  var DEVLOG = [
    { ver: 'v0.1', date: 'week 1', title: 'the first window',
      body: 'Started with the shell: wallpaper, taskbar, one window manager, two programs. Calculator and terminal, deliberately small, so I could spend the time on the window system instead of the apps.',
      list: ['Wallpaper drawn in SVG, no image files.',
            'Windows cascade by a few pixels so they don\'t stack exactly.',
            'Terminal prompt shows a fake home directory.'] },
    { ver: 'v0.5', date: 'week 2', title: 'things start to stick',
      body: 'Everything saves to localStorage now. Files, notes, and settings survive a refresh. Files grew a real tree, breadcrumbs, and rename/delete. Terminal learned cd, mkdir, touch, cat, rm and tree — all backed by the same files the Files app reads.',
      list: ['Filesystem is a flat path-to-node map. Easy to serialize.',
            'Notes autosave 400ms after you stop typing.',
            'Terminal cwd sticks around while the window stays open.'] },
    { ver: 'v1.0', date: 'week 3', title: 'the forest arrives',
      body: 'The Garden and the Tree. Two living things that grow when you use TerOS. A point per minute of presence, plus a water button for instant progress. Five stages drawn as pixel art: seed, sprout, young, mature, flowering.',
      list: ['Plant state persists alongside everything else.',
            'Desktop widget shows stage and growth without opening the app.',
            'Redrew the whole OS in beveled chunky style.'] },
    { ver: 'v1.0', date: 'now', title: 'what this is',
      body: 'A small place that lives in three HTML-ish files and a browser tab. No backend, no build step, no dependencies. Not a clone of anything. Just a forest you can open.',
      list: ['Nine programs.', 'Drag, resize, minimize, snap.',
            'Close the tab. Come back tomorrow. The plants are still there.'] }
  ];

  T.registerApp('devlog', {
    title: 'Devlog', icon: 'log',
    launch: function () {
      WM.open('devlog', {
        title: 'devlog', width: 640, height: 480, icon: icon('log', 12),
        render: function (body) {
          var html = '<div class="devlog"><h2>development log</h2>';
          DEVLOG.forEach(function (e) {
            var items = '';
            e.list.forEach(function (l) { items += '<li>' + esc(l) + '</li>'; });
            html += '<div class="entry">' +
              '<div class="h"><span class="v">' + esc(e.ver) + '</span><span class="d">' + esc(e.date) + '</span></div>' +
              '<h3>' + esc(e.title) + '</h3>' +
              '<p>' + esc(e.body) + '</p>' +
              '<ul>' + items + '</ul>' +
            '</div>';
          });
          html += '</div>';
          body.innerHTML = html;
        }
      });
    }
  });

})();