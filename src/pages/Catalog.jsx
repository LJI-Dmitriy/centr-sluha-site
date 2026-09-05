import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Icon from '../components/Icon'
import Reveal from '../components/Reveal'
import ProductCard from '../components/ProductCard'
import { useRequestForm } from '../components/RequestModal'
import { CATEGORIES, FILTERS } from '../data/site'
import { useContent } from '../components/ContentContext'
import { matchesSearch, specText } from '../lib/search'
import './Pages.css'
import Seo from '../components/Seo'

/* Цена в данных — строка вида «от 7 890 ₽», берём из неё число */
const priceValue = (s) => Number((s.match(/[\d\s]+/) || [''])[0].replace(/\s/g, '')) || 0

const PRICE_TIERS = {
  low: { label: 'Недорогие', test: (v) => v > 0 && v < 15000 },
  mid: { label: 'Средняя цена', test: (v) => v >= 15000 && v <= 60000 },
  premium: { label: 'Премиум', test: (v) => v > 60000 },
}

/* «Особенности» и «Тип корпуса» ищем по характеристикам и описанию позиции */
const matchesFeature = (i, q) => {
  const hay = [i.title, i.short, ...Object.values(i.attrs || {}), ...(i.points || []), ...(i.specs || []).map(specText)].join(' ').toLowerCase()
  return hay.includes(q.toLowerCase())
}

const PER_PAGE = 6

/* Порядок вывода: значение в адресе → как сортируем список */
const SORT_MODES = {
  popular: { label: 'По популярности', apply: (list) => list },
  cheap: { label: 'Сначала дешевле', apply: (list) => [...list].sort((a, b) => priceValue(a.price) - priceValue(b.price)) },
  expensive: { label: 'Сначала дороже', apply: (list) => [...list].sort((a, b) => priceValue(b.price) - priceValue(a.price)) },
  fresh: { label: 'Сначала новинки', apply: (list) => [...list].sort((a, b) => Number(Boolean(b.tag)) - Number(Boolean(a.tag))) },
}

const asNumber = (value) => Number(String(value).replace(/[^\d]/g, '')) || null

export default function Catalog() {
  const { CATALOG } = useContent()
  const [params, setParams] = useSearchParams()
  const cat = params.get('cat')
  const brand = params.get('brand')
  const price = params.get('price')
  const feature = params.get('feature')
  const query = (params.get('q') || '').trim()
  const sort = SORT_MODES[params.get('sort')] ? params.get('sort') : 'popular'
  const priceFrom = asNumber(params.get('from'))
  const priceTo = asNumber(params.get('to'))
  const openForm = useRequestForm()
  // на телефоне подбор закрыт: иначе до первого товара пришлось бы листать целый экран
  const [filtersOpen, setFiltersOpen] = useState(false)

  const found = CATALOG.filter((i) => {
    if (cat && i.category !== cat) return false
    if (brand && !matchesFeature(i, brand)) return false
    if (feature && !matchesFeature(i, feature)) return false
    if (price && PRICE_TIERS[price] && !PRICE_TIERS[price].test(priceValue(i.price))) return false
    if (query && !matchesSearch(i, query)) return false
    if (priceFrom && priceValue(i.price) < priceFrom) return false
    if (priceTo && priceValue(i.price) > priceTo) return false
    return true
  })

  const items = SORT_MODES[sort].apply(found)

  const active = CATEGORIES.find((c) => c.slug === cat)
  const extra = brand || feature || (price && PRICE_TIERS[price] ? PRICE_TIERS[price].label : null)

  /* Меняем один параметр в адресе, остальные не трогаем; страница сбрасывается на первую */
  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setParams(next)
  }

  /* Постраничный вывод: номер страницы живёт в адресе, фильтр сбрасывает его на первую */
  const pages = Math.max(1, Math.ceil(items.length / PER_PAGE))
  const page = Math.min(Math.max(1, Number(params.get('page')) || 1), pages)
  const shown = items.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const setCat = (slug) => {
    if (slug) setParams({ cat: slug })
    else setParams({})
  }

  const goToPage = (n) => {
    const next = new URLSearchParams(params)
    if (n > 1) next.set('page', String(n))
    else next.delete('page')
    setParams(next)
    document.getElementById('catalog-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <Seo title={"Слуховые аппараты"} description={"Заушные, внутриушные и внутриканальные аппараты от 7 890 ₽. Подбор сурдолога после теста слуха."} path={"/catalog"} />
      <PageHero
        crumbs={[{ label: active ? active.title : extra || 'Каталог' }]}
        eyebrow="Каталог"
        title={query ? `Поиск: ${query}` : active ? active.title : extra || 'Слуховые аппараты'}
      />

      <section className="section section--tight" style={{ paddingTop: 32 }}>
        <div className="container catalog">
          {/* Фильтры */}
          <aside className={`filters ${filtersOpen ? 'is-open' : ''}`}>
            <button className="filters__head" onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen}>
              <Icon name="filter" size={18} /> Подбор
              <span className="filters__toggle"><Icon name="arrow" size={18} /></span>
            </button>
            <div className="filters__body">

            <div className="filters__group">
              <h4>Тип аппарата</h4>
              <ul className="filters__list">
                {CATEGORIES.map((c) => (
                  <li key={c.slug}>
                    <label>
                      <input type="radio" name="cat" checked={cat === c.slug} onChange={() => setCat(c.slug)} />
                      <span>{c.title}</span>
                      <small>{c.count}</small>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="filters__group">
              <h4>Цена, ₽</h4>
              <div className="filters__price">
                <input
                  type="text" inputMode="numeric" placeholder="7 000" aria-label="Цена от"
                  defaultValue={params.get('from') || ''}
                  onBlur={(e) => setParam('from', asNumber(e.target.value))}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                />
                <span>—</span>
                <input
                  type="text" inputMode="numeric" placeholder="120 000" aria-label="Цена до"
                  defaultValue={params.get('to') || ''}
                  onBlur={(e) => setParam('to', asNumber(e.target.value))}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                />
              </div>
            </div>

            {FILTERS.map((f) => (
              <div className="filters__group" key={f.title}>
                <h4>{f.title}</h4>
                <ul className="filters__list">
                  {f.options.map((o, i) => (
                    <li key={i}>
                      <label>
                        <input type="checkbox" />
                        <span>{o}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <button className="btn btn-ghost btn-sm btn-block" onClick={() => setCat(null)}>Сбросить фильтры</button>
            <div className="filters__help">
              <h4>Не знаете, что выбрать?</h4>
              <p>Опишите ситуацию — сурдолог подскажет подходящий тип аппарата.</p>
              <button className="btn btn-primary btn-sm btn-block" onClick={() => openForm('ask')}>Задать вопрос</button>
            </div>
            </div>
          </aside>

          {/* Список товаров */}
          <div className="catalog__main">
            <div className="catalog__bar" id="catalog-list">
              <span>Найдено: <strong>{items.length}</strong>{pages > 1 && <> · страница {page} из {pages}</>}</span>
              <label className="catalog__sort">
                Сортировка
                <select value={sort} onChange={(e) => setParam('sort', e.target.value === 'popular' ? null : e.target.value)}>
                  {Object.entries(SORT_MODES).map(([key, mode]) => (
                    <option key={key} value={key}>{mode.label}</option>
                  ))}
                </select>
              </label>
            </div>

            {items.length > 0 ? (
              <div className="grid grid-3 catalog__grid">
                {shown.map((item, i) => (
                  <Reveal key={item.slug} delay={(i % 3) * 60}><ProductCard item={item} compact /></Reveal>
                ))}
              </div>
            ) : (
              <div className="cart-empty">
                <span className="cart-empty__ic"><Icon name="search" size={30} /></span>
                <h3>Под этот фильтр ничего не нашлось</h3>
                <p>Сбросьте фильтр или спросите у сурдолога — подберём модель под ваш случай.</p>
                <button className="btn btn-primary" onClick={() => setParams({})}>Показать все модели</button>
              </div>
            )}

            {pages > 1 && (
              <div className="pager">
                <button
                  className="pager__btn pager__btn--prev"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  aria-label="Предыдущая страница"
                >
                  <Icon name="arrowLeft" size={16} />
                </button>
                {Array.from({ length: pages }, (_, n) => (
                  <button
                    key={n}
                    className={`pager__btn ${page === n + 1 ? 'is-active' : ''}`}
                    onClick={() => goToPage(n + 1)}
                  >
                    {n + 1}
                  </button>
                ))}
                <button
                  className="pager__btn pager__btn--next"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === pages}
                >
                  Дальше <Icon name="arrow" size={16} />
                </button>
              </div>
            )}

            <div className="seo-note">
              <h2>Как выбрать слуховой аппарат</h2>
              <p>Тип аппарата зависит от степени снижения слуха: при тяжёлой потере нужен заушный с запасом мощности, при лёгкой и средней подойдёт внутриушной или внутриканальный. Число каналов отвечает за то, насколько точно аппарат подстроится под вашу аудиограмму.</p>
              <p>Цена складывается из класса обработки звука, количества программ и дополнительных функций — Bluetooth, аккумулятора, шумоподавления. Разницу проще услышать на примерке, чем понять по характеристикам.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="band">
            <div>
              <h2>Сомневаетесь в выборе?</h2>
              <p className="lead">Позвоним, зададим несколько вопросов и предложим 2–3 модели в вашем бюджете.</p>
            </div>
            <button className="btn btn-primary" onClick={() => openForm('call')}>Заказать звонок <Icon name="arrow" size={18} /></button>
          </div>
        </div>
      </section>
    </>
  )
}
