(() => {
  'use strict';
  if (window.__BTD_PERSISTENT_SNAPSHOT_PATCH__) return;
  window.__BTD_PERSISTENT_SNAPSHOT_PATCH__ = true;

  const READOUT_FUNCTION = 'btd-score-readout';

  function routeFetch(baseFetch) {
    if (typeof baseFetch !== 'function') return baseFetch;
    return function(input, init) {
      try {
        const isRequest = typeof Request !== 'undefined' && input instanceof Request;
        const rawUrl = isRequest ? input.url : String(input);
        if (rawUrl.includes('/functions/v1/btd-current-scan') || rawUrl.includes('/functions/v1/btd-core-scan')) {
          const nextUrl = rawUrl
            .replace('/functions/v1/btd-current-scan', `/functions/v1/${READOUT_FUNCTION}`)
            .replace('/functions/v1/btd-core-scan', `/functions/v1/${READOUT_FUNCTION}`);
          if (isRequest) return baseFetch(new Request(nextUrl, input), init);
          return baseFetch(nextUrl, init);
        }
      } catch (_) {}
      return baseFetch(input, init);
    };
  }

  function patchFactory() {
    const sb = window.supabase;
    if (!sb?.createClient || sb.createClient.__btdPersistentWrapped) return;
    const original = sb.createClient.bind(sb);
    const wrapped = function(...args) {
      const options = args[2] && typeof args[2] === 'object' ? args[2] : {};
      const globalOptions = options.global && typeof options.global === 'object' ? options.global : {};
      const baseFetch = globalOptions.fetch || window.fetch.bind(window);
      args[2] = {
        ...options,
        global: {
          ...globalOptions,
          fetch: routeFetch(baseFetch)
        }
      };
      return original(...args);
    };
    wrapped.__btdPersistentWrapped = true;
    sb.createClient = wrapped;
  }

  patchFactory();
})();