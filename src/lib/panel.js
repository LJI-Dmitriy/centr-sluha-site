/* Связь с панелью управления.

   Сайт работает и без панели: если она недоступна (выключена, идут работы,
   нет сети), показывается встроенный контент из data/site.js. Панель, когда
   отвечает, эти данные замещает. Заявки при недоступной панели уходят
   прежним путём — сообщением или письмом. */

import { CATALOG as BUILTIN_CATALOG, NEWS as BUILTIN_NEWS } from '../data/site'

const URL_BASE = import.meta.env.VITE_PANEL_URL || ''

/* Фотографии, которые уже лежат в проекте: если в панели снимок ещё не загружен,
   берём картинку по такому же адресу страницы — карточка не остаётся пустой. */
const BUILTIN_IMAGES = new Map(BUILTIN_CATALOG.filter((p) => p.img).map((p) => [p.slug, p.img]))
const BUILTIN_COVERS = new Map(BUILTIN_NEWS.filter((n) => n.cover).map((n) => [n.slug, n.cover]))

export const panelEnabled = Boolean(URL_BASE)

const get = async (path) => {
  const res = await fetch(`${URL_BASE}${path}`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`панель ответила ${res.status}`)
  const body = await res.json()
  return body.data
}

const fileUrl = (id) => (id ? `${URL_BASE}/assets/${id}` : null)

/* ——— приведение к тем же формам, что и во встроенных данных ——— */

/* Списки из панели приходят строкой JSON — приводим к массиву */
const toList = (value) => {
  if (Array.isArray(value)) return value
  if (typeof value !== 'string' || !value.trim()) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : [String(parsed)]
  } catch {
    return value.split('\n').map((v) => v.trim()).filter(Boolean)
  }
}

const NO_DATA = 'нет данных'

/* Пять полей карточки аппарата. У аксессуаров и услуг их не заполняют —
   тогда блок не показываем и остаются обычные пункты. */
const toAttrs = (p) => {
  if (!p.brand && !p.form && !p.power && !p.channels) return null
  return {
    brand: p.brand || NO_DATA,
    form: p.form || NO_DATA,
    power: p.power || NO_DATA,
    signal: p.signal || 'Цифровой',
    channels: p.channels || NO_DATA,
  }
}

const toProduct = (p) => ({
  slug: p.slug,
  title: p.title,
  category: p.category,
  brand: p.brand,
  price: p.price,
  old: p.old_price || null,
  tag: p.tag || null,
  short: p.short || '',
  img: fileUrl(p.image) || BUILTIN_IMAGES.get(p.slug) || null,
  points: toList(p.points),
  specs: toList(p.specs),
  functions: toList(p.functions),
  attrs: toAttrs(p),
  desc: (p.description || '').split('\n\n').filter(Boolean),
  unit: 'шт',
  stock: p.stock,
  onHome: !!p.on_home,
})

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
const toRuDate = (iso) => {
  if (!iso) return ''
  const [y, m, d] = String(iso).split('T')[0].split('-')
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`
}

const toPost = (n) => ({
  slug: n.slug,
  type: n.type,
  tag: n.tag,
  date: toRuDate(n.date),
  title: n.title,
  excerpt: n.excerpt || '',
  cover: fileUrl(n.cover) || BUILTIN_COVERS.get(n.slug) || null,
  body: (n.body || '').split('\n\n').filter(Boolean),
})

/* Цена в панели — строка вида «46 900 ₽»: достаём число, считаем скидку и
   собираем строку обратно, сохраняя знак валюты и приставку «от». */
const priceParts = (price) => {
  const digits = String(price).replace(/[^\d]/g, '')
  if (!digits) return null
  return {
    value: Number(digits),
    prefix: /^\s*от/i.test(String(price)) ? 'от ' : '',
    suffix: String(price).includes('₽') ? ' ₽' : '',
  }
}

const withDiscount = (price, percent) => {
  const parts = priceParts(price)
  if (!parts || !percent) return null
  const value = Math.round((parts.value * (100 - percent)) / 100 / 10) * 10
  return `${parts.prefix}${value.toLocaleString('ru-RU')}${parts.suffix}`
}

const toPromo = (a) => ({
  title: a.title,
  text: a.text || '',
  note: a.benefit || '',
  until: toRuDate(a.date_end),
  cover: fileUrl(a.image),
  inSlider: !!a.in_slider,
})

const toCenter = (c) => ({
  slug: c.slug,
  title: c.title,
  address: c.address,
  metro: c.metro,
  hours: c.hours,
  phone: c.phone,
  coords: String(c.coords || '')
    .split(',')
    .map((n) => Number(n.trim()))
    .filter((n) => !Number.isNaN(n)),
  note: c.note || '',
  desc: (c.desc || '').split('\n\n').filter(Boolean),
  features: toList(c.features),
  cover: fileUrl(c.photo),
  gallery: [],
  route: [],
  district: '',
})

/* ——— загрузка всего содержимого одним заходом ——— */
export async function loadContent() {
  const [tovary, uslugi, akcii, novosti, centry, nastroyki, svyaz] = await Promise.all([
    get('/items/tovary?limit=-1&sort=sort'),
    get('/items/uslugi?limit=-1&sort=sort'),
    get('/items/akcii?limit=-1&sort=sort&fields=*,tovary.tovary_id'),
    get('/items/novosti?limit=-1&sort=-date'),
    get('/items/centry?limit=-1'),
    get('/items/nastroyki'),
    get('/items/svyaz').catch(() => null),
  ])

  const products = tovary.map(toProduct)

  /* Акция со скидкой проставляется товарам, которые в ней выбраны:
     на карточке появляется плашка, а цена показывается пересчитанной. */
  const byId = new Map(tovary.map((row, i) => [row.id, products[i]]))
  for (const promo of akcii) {
    if (!promo.discount) continue
    for (const link of promo.tovary || []) {
      const product = byId.get(link.tovary_id?.id ?? link.tovary_id)
      if (!product) continue
      const discounted = withDiscount(product.price, promo.discount)
      if (!discounted) continue
      product.old = product.old || product.price
      product.price = discounted
      product.promo = { title: promo.title, discount: promo.discount }
    }
  }

  return {
    CATALOG: products,
    HOME_PRODUCTS: products.filter((p) => p.onHome),
    SERVICES: uslugi.map((s) => ({ title: s.title, price: s.price, text: s.text || '', icon: 'wave' })),
    PROMOS: akcii.map(toPromo),
    NEWS: novosti.map(toPost),
    CENTERS: centry.map(toCenter),
    LINKS: svyaz
      ? {
          max: svyaz.max || (svyaz.whatsapp ? `https://max.ru/${String(svyaz.whatsapp).replace(/\D/g, '')}` : null),
          telegram: svyaz.telegram
            ? (String(svyaz.telegram).startsWith('http') ? svyaz.telegram : `https://t.me/${String(svyaz.telegram).replace(/^@/, '')}`)
            : null,
          vk: svyaz.vk
            ? (String(svyaz.vk).startsWith('http') ? svyaz.vk : `https://vk.com/${encodeURIComponent(String(svyaz.vk).replace(/^@/, '').trim())}`)
            : null,
          viber: svyaz.viber ? `viber://chat?number=${String(svyaz.viber).replace(/\D/g, '')}` : null,
          phone: svyaz.call_phone || null,
        }
      : null,
    SITE_OVERRIDES: nastroyki
      ? {
          phone: nastroyki.phone,
          phoneHref: `tel:${String(nastroyki.phone || '').replace(/[^\d+]/g, '')}`,
          email: nastroyki.email,
          address: nastroyki.address,
          hours: nastroyki.hours,
          requisites: nastroyki.requisites,
        }
      : null,
  }
}

/* ——— отправка заявки ——— */
export async function sendRequest(payload) {
  const res = await fetch(`${URL_BASE}/items/zayavki`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`заявка не принята: ${res.status}`)
  return true
}
