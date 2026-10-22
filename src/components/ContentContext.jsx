import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loadContent, panelEnabled } from '../lib/panel'
import * as builtin from '../data/site'

/* Единый источник содержимого для всех страниц.

   Пока панель не ответила (или её вовсе нет) — отдаём встроенные данные,
   поэтому сайт открывается мгновенно и не зависит от доступности панели. */

const Ctx = createContext(null)

export const useContent = () => useContext(Ctx)

const BUILTIN = {
  CATALOG: builtin.CATALOG,
  HOME_PRODUCTS: builtin.CATALOG.slice(0, 4),
  SERVICES: builtin.SERVICES,
  PROMOS: builtin.PROMOS,
  NEWS: builtin.NEWS,
  CENTERS: builtin.CENTERS,
  SITE: builtin.SITE,
  // мессенджеры: пока панель не ответила, показываем номер из настроек сайта
  // ссылки на мессенджеры центр укажет в панели; пока стоит только MAX по номеру
  LINKS: { max: `https://max.ru/${builtin.SITE.phoneHref.replace(/\D/g, '')}`, telegram: null, whatsapp: null, vk: null, viber: null, phone: builtin.SITE.phone },
  fromPanel: false,
}

export function ContentProvider({ children }) {
  const [data, setData] = useState(BUILTIN)

  useEffect(() => {
    if (!panelEnabled) return
    let alive = true

    loadContent()
      .then((fresh) => {
        if (!alive) return
        setData({
          CATALOG: fresh.CATALOG.length ? fresh.CATALOG : BUILTIN.CATALOG,
          HOME_PRODUCTS: fresh.HOME_PRODUCTS.length ? fresh.HOME_PRODUCTS : fresh.CATALOG.slice(0, 4),
          SERVICES: fresh.SERVICES.length ? fresh.SERVICES : BUILTIN.SERVICES,
          PROMOS: fresh.PROMOS.length ? fresh.PROMOS : BUILTIN.PROMOS,
          NEWS: fresh.NEWS.length ? fresh.NEWS : BUILTIN.NEWS,
          CENTERS: fresh.CENTERS.length ? fresh.CENTERS : BUILTIN.CENTERS,
          SITE: { ...builtin.SITE, ...(fresh.SITE_OVERRIDES || {}) },
          LINKS: fresh.LINKS || BUILTIN.LINKS,
          fromPanel: true,
        })
      })
      .catch(() => {
        // панель недоступна — остаёмся на встроенных данных, сайт работает как обычно
      })

    return () => { alive = false }
  }, [])

  const value = useMemo(() => data, [data])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
