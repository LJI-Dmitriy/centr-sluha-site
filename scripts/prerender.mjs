/* Раскладывает готовые страницы по папкам после сборки.
   Зачем: сайт рисуется скриптом в браузере, а поисковый робот и превью ссылки
   в мессенджере скрипты не выполняют — им нужен обычный HTML с текстом,
   заголовком и картинкой. Скрипт открывает каждый адрес в настоящем браузере
   и сохраняет то, что получилось, в dist/<адрес>/index.html. */
import { preview } from 'vite'
import { chromium } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const { CATALOG, NEWS, CENTERS, PROMOS } = await import('../src/data/site.js')

const routes = [
  '/', '/catalog', '/about', '/promo', '/locations',
  '/news', '/contacts', '/cart', '/privacy', '/consent',
  ...PROMOS.map((p) => `/promo/${p.slug}`),
  ...CATALOG.map((p) => `/catalog/${p.slug}`),
  ...NEWS.map((n) => `/news/${n.slug}`),
  ...CENTERS.map((c) => `/locations/${c.slug}`),
]

const server = await preview({ preview: { port: 4179, strictPort: true } })
// адрес уже содержит подпапку сайта (при публикации это /centr-sluha-site/),
// поэтому путь страницы просто дописываем к нему
const origin = server.resolvedUrls.local[0].replace(/\/$/, '')
const browser = await chromium.launch()
const page = await browser.newPage()
// карта Яндекса для готового HTML не нужна, а её виджет всё время что-то догружает,
// и страница с картой не дожидалась конца загрузки — сборка падала по таймауту
await page.route(/yandex|yastatic/, (r) => r.abort())

for (const route of routes) {
  const url = origin + route
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForSelector('#main h1, #main h2', { timeout: 10000 })
  // блоки проявляются при прокрутке — проматываем страницу, иначе в сохранённом
  // HTML они останутся прозрачными и человек без скриптов увидит пустоту
  const html = '<!doctype html>\n' + await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 60))
    }
    window.scrollTo(0, 0)
    await new Promise((r) => setTimeout(r, 400))
    // снимок делаем сразу после того, как проявили блоки: иначе страница
    // успевает перерисоваться и они снова станут прозрачными
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'))
    return document.documentElement.outerHTML
  })
  const file = join('dist', route === '/' ? 'index.html' : `${route.replace(/^\//, '')}/index.html`)
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
  console.log('готово:', route)
}

await browser.close()
server.httpServer.close()
console.log(`\nСтраниц разложено: ${routes.length}`)
