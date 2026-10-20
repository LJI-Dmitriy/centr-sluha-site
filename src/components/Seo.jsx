import { useEffect } from 'react'
import { SITE } from '../data/site'

/* Заголовок, описание и превью для мессенджеров у каждой страницы свои.
   Одностраничное приложение само по себе меты не меняет — правим руками. */

/* Адрес опубликованного сайта для canonical и превью ссылок передаёт сборка
   (VITE_SITE_URL): иначе в готовые страницы попал бы адрес локального сервера,
   на котором они собирались. Без переменной — адрес, по которому страницу открыли. */
const siteUrl = () =>
  (import.meta.env.VITE_SITE_URL || `${window.location.origin}${import.meta.env.BASE_URL}`).replace(/\/$/, '')

const setTag = (selector, attrs) => {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement(attrs.property ? 'meta' : selector.startsWith('link') ? 'link' : 'meta')
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
}

export default function Seo({ title, description, path = '' }) {
  const full = title ? `${title} — ${SITE.name}, ${SITE.city}` : `${SITE.name} — слуховые аппараты в ${SITE.city}е`
  const desc = description || `Тест слуха, подбор и настройка слуховых аппаратов. ${SITE.address}. ${SITE.phone}.`

  useEffect(() => {
    const base = siteUrl()
    const url = base + path
    document.title = full
    setTag('meta[name="description"]', { name: 'description', content: desc })
    setTag('link[rel="canonical"]', { rel: 'canonical', href: url })

    setTag('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    setTag('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE.name })
    setTag('meta[property="og:title"]', { property: 'og:title', content: full })
    setTag('meta[property="og:description"]', { property: 'og:description', content: desc })
    setTag('meta[property="og:url"]', { property: 'og:url', content: url })
    setTag('meta[property="og:image"]', { property: 'og:image', content: `${base}/og.png` })
    setTag('meta[property="og:image:width"]', { property: 'og:image:width', content: '1200' })
    setTag('meta[property="og:image:height"]', { property: 'og:image:height', content: '630' })
    setTag('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
  }, [full, desc, path])

  return null
}
