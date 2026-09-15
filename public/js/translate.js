(function () {
  'use strict';

  var SKIP_TAG = { SCRIPT: 1, STYLE: 1, CODE: 1, PRE: 1, TEXTAREA: 1, SVG: 1, KBD: 1, INPUT: 1, SELECT: 1, OPTION: 1 };
  var originals = [];
  var cache = Object.create(null);
  var timer = 0;
  var busy = false;

  function lang() {
    return (typeof window.atmLang === 'function' && window.atmLang()) || 'es';
  }

  function skipNode(node) {
    var p = node.parentElement;
    if (!p || SKIP_TAG[p.tagName]) return true;
    if (p.isContentEditable) return true;
    if (p.closest('.lang-picker, .lang-menu, .lang-flag-btn, .theme-toggle-btn, code, pre, [data-notranslate]')) return true;
    if (p.closest('.hidden, [hidden]')) return true;
    var t = (node.nodeValue || '').trim();
    if (t.length < 2) return true;
    if (/^[@#$/]|https?:\/\//.test(t)) return true;
    return false;
  }

  function collect() {
    var nodes = [];
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        return skipNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  }

  function remember(nodes) {
    nodes.forEach(function (n) {
      var found = false;
      for (var i = 0; i < originals.length; i++) {
        if (originals[i].node === n) { found = true; break; }
      }
      if (!found) originals.push({ node: n, text: n.nodeValue });
    });
  }

  function originalOf(node) {
    for (var i = 0; i < originals.length; i++) {
      if (originals[i].node === node) return originals[i].text;
    }
    return node.nodeValue;
  }

  function restore(nodes) {
    nodes.forEach(function (n) { n.nodeValue = originalOf(n); });
  }

  function chunk(nodes, max) {
    var groups = [];
    var cur = [];
    var size = 0;
    nodes.forEach(function (n) {
      var t = originalOf(n);
      if (size + t.length > max && cur.length) {
        groups.push(cur);
        cur = [];
        size = 0;
      }
      cur.push(n);
      size += t.length + 8;
    });
    if (cur.length) groups.push(cur);
    return groups;
  }

  function apiTranslate(parts, tl) {
    var key = tl + '::' + parts.join('\u0001');
    if (cache[key]) return Promise.resolve(cache[key]);
    var joined = parts.join('\n⟦§⟧\n');
    return fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' +
      encodeURIComponent(tl) + '&dt=t&q=' + encodeURIComponent(joined))
      .then(function (r) { return r.json(); })
      .then(function (g) {
        var t = (g && g[0]) ? g[0].map(function (row) { return row && row[0] ? row[0] : ''; }).join('') : joined;
        var out = t.split(/\n⟦§⟧\n/);
        cache[key] = out;
        return out;
      }).catch(function () { return parts; });
  }

  function run() {
    if (busy) { schedule(); return; }
    var to = lang();
    var nodes = collect();
    remember(nodes);
    if (to === 'es') {
      restore(nodes);
      return;
    }
    busy = true;
    var groups = chunk(nodes, 3200);
    var chain = Promise.resolve();
    groups.forEach(function (group) {
      chain = chain.then(function () {
        var parts = group.map(originalOf);
        return apiTranslate(parts, to).then(function (out) {
          group.forEach(function (n, i) {
            if (out[i] != null && String(out[i]).trim()) n.nodeValue = out[i];
          });
        });
      });
    });
    chain.then(function () { busy = false; }).catch(function () { busy = false; });
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(run, 120);
  }

  window.atmTranslateNow = schedule;
  document.addEventListener('atm:lang', schedule);
  document.addEventListener('atm:content', schedule);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule);
  else schedule();
})();
