/* Сервис-воркер: сайт открывается с телефона как приложение и работает,
   когда связь пропала. Стратегии простые и без библиотек.

   — переходы по страницам: сначала сеть, при обрыве — сохранённая оболочка;
   — картинки, стили, скрипты: отдаём из кэша и параллельно обновляем;
   — всё чужое (карта) не трогаем. */

// версия приходит из адреса регистрации: у каждой сборки она своя
const VERSION = new URL(self.location.href).searchParams.get('v') || 'v1'
const SHELL = `shell-${VERSION}`
const ASSETS = `assets-${VERSION}`
const BASE = self.location.pathname.replace(/sw\.js$/, '') // сайт может лежать в подпапке
const OFFLINE_URL = `${BASE}index.html`

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL).then((c) => c.addAll([OFFLINE_URL, `${BASE}manifest.webmanifest`, `${BASE}favicon.svg`])).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return // карта и прочее внешнее — мимо

  // переход по адресу: свежая страница, при обрыве — оболочка из кэша
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(SHELL).then((c) => c.put(OFFLINE_URL, copy))
          return res
        })
        .catch(() => caches.match(OFFLINE_URL))
    )
    return
  }

  // кэшируем только оформление и картинки; данные (например, ответы панели,
  // если она окажется на том же адресе) всегда берём свежими из сети
  if (!['script', 'style', 'image', 'font', 'manifest'].includes(request.destination)) return

  // остальное: из кэша сразу, обновление в фоне
  e.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(ASSETS).then((c) => c.put(request, copy))
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    })
  )
})
