const projects = [
  { domain: 'ai.trujillomingorance.com', id: 'trujillo-ai-studio' },
  { domain: 'rewrite.trujillomingorance.com', id: 'rewrite-ai' },
  { domain: 'focusguard.trujillomingorance.com', id: 'focusguard' },
  { domain: 'alberto.trujillomingorance.com', id: 'alberto-portfolio' },
  { domain: 'guides.trujillomingorance.com', id: 'trujillo-guides' },
  { domain: 'labs.trujillomingorance.com', id: 'atm-labs-hub' },
  { domain: 'trujillomingorance.com', id: 'domain-root' },
  { domain: 'invest.trujillomingorance.com', id: 'invest-platform' },
  { domain: 'savings.trujillomingorance.com', id: 'savings-runway' },
  { domain: 'tools.trujillomingorance.com', id: 'atm-tools' },
  { domain: 'rocky.trujillomingorance.com', id: 'rocky-setter' },
];

function professionalHost(value) {
  if (!value) return '';
  var host = String(value).replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
  if (!host || host.indexOf('pages.dev') !== -1) return '';
  if (host === 'trujillomingorance.com' || host.slice(-23) === '.trujillomingorance.com') return host;
  return '';
}

var HIDDEN_HOSTS = {};
function isOwnProject(project) {
  var host = professionalHost(project && project.domain) || professionalHost(project && project.url);
  if (!host || HIDDEN_HOSTS[host]) return false;
  var id = project.id || '';
  if (id === 'domain-root') return false;
  return true;
}

console.log(projects.filter(isOwnProject).map(p => p.id));
