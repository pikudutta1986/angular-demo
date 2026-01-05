const PROXY_CONFIG = {
    "/api": {
        target: "http://148.135.138.159:5000",
        secure: false,
        changeOrigin: true,
        logLevel: "debug",
        onProxyReq: function (proxyReq, req, res) {
            console.log('[PROXY] Proxying request:', req.method, req.url, '→', proxyReq.path);
        },
        onProxyRes: function (proxyRes, req, res) {
            console.log('[PROXY] Response received:', proxyRes.statusCode, 'for', req.url);
        },
        onError: function (err, req, res) {
            console.error('[PROXY] Error:', err.message, 'for', req.url);
        }
    }
};

module.exports = PROXY_CONFIG;
