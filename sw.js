/* Service worker do EcoColeta: guarda o app no aparelho para abrir sem internet. */
/* As duas linhas abaixo são preenchidas por scripts/build-pwa.mjs no build. */
const VERSION = "ee6002c92ccb";
const PRECACHE = ["./","./_expo/static/js/web/__common-d82221298a14a1dd7bd39930e9638adf.js","./_expo/static/js/web/__expo-metro-runtime-8c088df87a31e4e6accd81c554ec290d.js","./_expo/static/js/web/_layout-8ca97f03f6e2f1e089bb422113d3660c.js","./_expo/static/js/web/_layout-b3c3c1b6c516058fa8c593795e6ba1d2.js","./_expo/static/js/web/calendario-23bafcace51784d2a14a6f253880bd5c.js","./_expo/static/js/web/entry-28fc5d405c619add85939a3c934b7a19.js","./_expo/static/js/web/index-766d5fe72b70bd36e84553db5ff7b646.js","./_expo/static/js/web/meus-pontos-1d263efae8a571d6f3a916164d5bda39.js","./_expo/static/js/web/painel-0f3f759f88808c73764434a75b5a8a26.js","./_expo/static/js/web/pontos-a3dad07cc881b2c0fc4497c40a7a5fcd.js","./_expo/static/js/web/registrar-6140800c2f176cba0aab917a8363d450.js","./_expo/static/js/web/sobre-ac0675dc3bda2d9747e9385b9d2a9cb6.js","./_expo/static/js/web/solicitar-13be84beabe446db2ed1a99dc1fc048f.js","./assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf","./assets/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png","./assets/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png","./assets/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png","./assets/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png","./assets/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png","./assets/node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png","./assets/node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png","./assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png","./assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png","./assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png","./assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png","./assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png","./assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png","./assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png","./assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png","./assets/node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png","./assets/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png","./assets/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png","./favicon.ico","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png","./manifest.json"];

const CACHE = `ecocoleta-${VERSION}`;
const INDEX = new URL('./', self.location).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE.map((p) => new URL(p, self.location).href)))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  // Páginas: tenta a rede (para pegar a versão nova) e, sem internet, usa a cópia guardada.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          if (response.ok) caches.open(CACHE).then((c) => c.put(INDEX, copy));
          return response;
        })
        .catch(() => caches.match(INDEX)),
    );
    return;
  }

  // Arquivos (JS, imagens, fontes): usa a cópia guardada e só busca na rede se faltar.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
