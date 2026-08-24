(function () {
  var definitions = {
    '200': {
      title: 'Web server is working',
      code: '200',
      hideMoreInformation: true,
      browser: { status: 'ok', text: 'Seems Working' },
      cloudflare: { status: 'ok', text: 'Often Working' },
      host: { status: 'ok', location: 'example.com', text: 'Almost Working' },
      source: 'host',
      happened: 'This site is still working. And it looks great.',
      canDo: 'Visit the site before it crashes someday.'
    },
    '404': {
      title: 'Page not found',
      code: '404',
      browser: { status: 'ok', text: 'Working' },
      cloudflare: { status: 'error', text: 'Error' },
      host: { status: 'ok', location: 'yume.zone', text: 'Working' },
      source: 'cloudflare',
      happened: "There is an internal server error on Cloudflare's network.",
      canDo: 'If you are a visitor of this website, please try again in a few minutes. If you are the owner of this website, check the Cloudflare dashboard for more information.'
    },
    '500': {
      title: 'Internal server error',
      code: '500',
      browser: { status: 'ok', text: 'Working' },
      cloudflare: { status: 'error', text: 'Error' },
      host: { status: 'ok', location: 'example.com', text: 'Working' },
      source: 'cloudflare',
      happened: "There is an internal server error on Cloudflare's network.",
      canDo: 'Please try again in a few minutes.'
    }
  };

  var icons = {
    browser: '<svg class="service-icon browser" viewBox="0 0 100 81" aria-hidden="true"><path d="M90 0H10C4.5 0 0 4.5 0 10v61c0 5.5 4.5 10 10 10h80c5.5 0 10-4.5 10-10V10C100 4.5 95.5 0 90 0ZM23 10a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-10 0a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm77 61H10V24h80v47Zm0-55H30v-6h60v6Z"/></svg>',
    cloud: '<svg class="service-icon cloud" viewBox="0 0 152 79" aria-hidden="true"><path d="M132 78v-1c11-.2 19-9 19-19 0-11-9-20-19-20-3 0-6 .7-8 1.8C123 19 105 1 83 1 65 1 50 12 45 28c-3-2-7-4-11-4-10 0-18 8-18 18 0 2 .3 3.4.7 5-.3 0-.6-.1-.9-.1C7 47 0 54 0 62c0 8 7 15 15 15h117Z"/></svg>',
    server: '<svg class="service-icon server" viewBox="0 0 95 75" aria-hidden="true"><path d="m94 45-13-38c-1-4-5-6-9-6H22c-4 0-8 3-9 7L1 43c-.3 1-.5 2-.5 3v20c0 5 4 9 9 9h75c5 0 9-4 9-9V48c0-1-.2-2-.5-3ZM87 65c0 1-1 2-2 2H10c-1 0-2-1-2-2V47c0-1 1-2 2-2h75c1 0 2 1 2 2v18Z"/><circle cx="75" cy="56" r="5"/><circle cx="59" cy="56" r="5"/></svg>'
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function statusMarkup(id, icon, fallbackLocation, name, item, source) {
    var status = item.status || 'ok';
    var text = item.text || (status === 'ok' ? 'Working' : 'Error');
    var location = item.location || fallbackLocation;
    var sourceClass = source === id ? ' is-error' : '';
    var mark = status === 'ok' ? '✓' : '×';

    return '<div class="status ' + id + sourceClass + '">' + icons[icon] +
      '<span class="status-location">' + escapeHtml(location) + '</span>' +
      '<h2>' + escapeHtml(name) + '</h2>' +
      '<p class="' + escapeHtml(status) + '">' + escapeHtml(text) + '</p>' +
      '<span class="status-mark ' + escapeHtml(status) + '" aria-label="' + escapeHtml(text) + '">' + mark + '</span>' +
      '</div>';
  }

  var key = document.body.getAttribute('data-error-page') || '404';
  var definition = definitions[key] || definitions['404'];
  var moreInformation = definition.hideMoreInformation
    ? ''
    : '<p>Visit <a href="https://www.cloudflare.com/" target="_blank" rel="noopener noreferrer">cloudflare.com</a> for more information.</p>';

  document.title = definition.code + ': ' + definition.title;
  document.body.innerHTML = '<div id="cf-wrapper"><div id="cf-error-details">' +
    '<header class="cf-container cf-header"><h1><span>' + escapeHtml(definition.title) +
    '</span> <span class="code-label">Error code ' + escapeHtml(definition.code) + '</span></h1>' +
    moreInformation + '<p id="cf-time">An error occurred while processing this request.</p></header>' +
    '<div class="status-band"><div class="cf-container status-row">' +
    statusMarkup('browser', 'browser', 'You', 'Browser', definition.browser, definition.source) +
    statusMarkup('cloudflare', 'cloud', 'San Francisco', 'Cloudflare', definition.cloudflare, definition.source) +
    statusMarkup('host', 'server', 'Website', 'Host', definition.host, definition.source) +
    '</div></div><main class="cf-container cf-content">' +
    '<section><h2>What happened?</h2><p>' + escapeHtml(definition.happened) + '</p></section>' +
    '<section><h2>What can I do?</h2><p>' + escapeHtml(definition.canDo) + '</p></section></main>' +
    '<footer class="cf-container cf-footer"><span class="cf-footer-item">Ray ID: <strong id="cf-ray-id">0000000000000000</strong></span>' +
    '<span class="cf-footer-item">Your IP: <button type="button" class="cf-footer-ip-reveal-btn" id="cf-footer-ip-reveal">Click to reveal</button> <span class="hidden" id="cf-footer-ip">1.1.1.1</span></span>' +
    '<span class="cf-footer-item">Performance &amp; security by <a href="https://www.cloudflare.com/" target="_blank" rel="noopener noreferrer">Cloudflare</a></span></footer>' +
    '</div></div>';

  var time = document.getElementById('cf-time');
  var rayId = document.getElementById('cf-ray-id');
  var reveal = document.getElementById('cf-footer-ip-reveal');
  var ip = document.getElementById('cf-footer-ip');

  if (time) time.textContent = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  if (rayId && window.crypto && window.crypto.getRandomValues) {
    var bytes = new Uint8Array(8);
    window.crypto.getRandomValues(bytes);
    rayId.textContent = Array.prototype.map.call(bytes, function (byte) {
      return byte.toString(16).padStart(2, '0');
    }).join('');
  }

  if (reveal && ip) {
    reveal.addEventListener('click', function () {
      reveal.classList.add('hidden');
      ip.classList.remove('hidden');
    });
  }
})();
