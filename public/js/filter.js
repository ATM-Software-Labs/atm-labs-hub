/* Catalog filtering for the labs directory. No network, no DOM. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.ATMFilter = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var HIDDEN_HOSTS = {};

  function professionalHost(value) {
    if (!value) return '';
    var host = String(value).replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
    if (!host || host.indexOf('pages.dev') !== -1) return '';
    if (host === 'github.com' || host === 'trujillomingorance.com' || host.slice(-23) === '.trujillomingorance.com') return host;
    return '';
  }

  function isOwnProject(project) {
    if (!project) return false;
    if (project.repo) return true;
    var host = professionalHost(project.domain) || professionalHost(project.url);
    if (!host || HIDDEN_HOSTS[host]) return false;
    return true;
  }

  function matches(project, query) {
    var q = String(query || '').trim().toLowerCase();
    if (!q) return true;
    var blob = [project.title, project.description, project.keywords, project.domain].join(' ').toLowerCase();
    return blob.indexOf(q) !== -1;
  }

  function probeHost(value) {
    var raw = String(value || '');
    var host = raw.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
    if (!host || host === 'github.com') return '';
    if (host === 'trujillomingorance.com' || host.slice(-23) === '.trujillomingorance.com') return host;
    return '';
  }

  return {
    HIDDEN_HOSTS: HIDDEN_HOSTS,
    professionalHost: professionalHost,
    isOwnProject: isOwnProject,
    matches: matches,
    probeHost: probeHost
  };
});
