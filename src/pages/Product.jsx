import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Breadcrumbs } from '../components/PageHero'
import Icon from '../components/Icon'
import Ph from '../components/Ph'
import Reveal from '../components/Reveal'
import ProductCard from '../components/ProductCard'
import Seo from '../components/Seo'
import RequestForm from '../components/RequestForm'
import { useRequestForm } from '../components/RequestModal'
import { useCart } from '../components/CartContext'
import NotFound from './NotFound'
import { CATEGORIES } from '../data/site'
import { DESCRIPTIONS } from '../data/descriptions'
import { useContent } from '../components/ContentContext'
import { priceText } from '../lib/price'
import './Pages.css'

const TABS = [
  { key: 'desc', label: 'Описание' },
  { key: 'specs', label: 'Характеристики' },
  { key: 'functions', label: 'Функции' },
]

const NO_DATA = 'нет данных'

/* Ссылки ведут в каталог с уже выставленным фильтром: с карточки можно
   уйти к другим аппаратам той же марки или того же типа корпуса. */
const FORM_LINKS = {
  'Заушный': '/catalog?form=BTE',
  'С ресивером в ухе': '/catalog?form=RIE',
}

/* Характеристики приходят строками (из панели их вводят свободным списком),
   но во встроенных данных лежат парами — приводим к одному виду. */
const specLine = (s) => (typeof s === 'string' ? s : `${s.k} — ${s.v}`)

function Attrs({ attrs }) {
  const rows = [
    { label: 'Производитель', value: attrs.brand, to: attrs.brand && attrs.brand !== NO_DATA ? `/catalog?brand=${encodeURIComponent(attrs.brand.split(' (')[0])}` : null },
    { label: 'Тип корпуса', value: attrs.form, to: FORM_LINKS[attrs.form] || null },
    { label: 'Уровень мощности', value: attrs.power },
    { label: 'Тип обработки сигнала', value: attrs.signal },
    { label: 'Количество каналов', value: attrs.channels },
  // чего производитель не сообщает, то не показываем: строка «нет данных» только путает
  ].filter((r) => r.value && r.value !== NO_DATA)

  return (
    <ul className="prod__points">
      {rows.map((r) => (
        <li key={r.label}>
          <Icon name="check" size={16} />
          <span>
            <b>{r.label}:</b>{' '}
            {r.to ? <Link to={r.to} className="prod__attr-link">{r.value}</Link> : (r.value || NO_DATA)}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function Product() {
  const { CATALOG, SITE } = useContent()
  const { slug } = useParams()
  const [tab, setTab] = useState('desc')
  const openForm = useRequestForm()
  const cart = useCart()

  const item = CATALOG.find((i) => i.slug === slug)
  if (!item) return <NotFound />

  const cat = CATEGORIES.find((c) => c.slug === item.category)
  // описание приходит из панели; у встроенного каталога оно лежит в отдельном файле
  const desc = item.desc?.length ? item.desc : DESCRIPTIONS[item.slug] || []
  const missing = item.stock === 'net'
  const related = CATALOG.filter((i) => i.slug !== item.slug).slice(0, 4)
  // условия приёма относятся к аппаратам — у них заполнены поля аппарата
  const isDevice = Boolean(item.attrs)
  const warranty = (item.specs || []).map(specLine).map((s) => s.match(/^Гарантия\s*[—–:-]\s*(.+)$/i)?.[1]).find(Boolean)

  return (
    <>
      <Seo title={item.title} description={`${item.short}${item.price ? ` Цена ${item.price}.` : ''} Подбор и настройка в центре слухопротезирования, Краснодар.`} path={`/catalog/${item.slug}`} />

      <section className="prod">
        <div className="container">
          {/* раздел могут удалить или переименовать в панели — страница товара от этого не падает */}
          <Breadcrumbs items={[
            { to: '/catalog', label: 'Каталог' },
            ...(cat ? [{ to: `/catalog?cat=${cat.slug}`, label: cat.title }] : []),
            { label: item.title },
          ]} />

          <div className="prod__top">
            {/* Фото */}
            {/* Снимок один — миниатюры не показываем, чтобы не изображать
                разнообразие, которого нет */}
            <div className="prod__gallery">
              <Ph ratio="4 / 3" className="prod__shot" src={item.img} alt={item.title} />
            </div>

            {/* Цена и условия */}
            <div className="prod__info">
              {item.tag && <span className="tag tag--accent">{item.tag}</span>}
              <h1>{item.title}</h1>
              <div className="prod__sku">Наличие: <strong>{missing ? 'нет в наличии' : item.stock === 'pod_zakaz' ? 'под заказ — уточните по телефону' : 'в центре'}</strong></div>
              <p className="prod__short">{item.short}</p>

              <div className="prod__pricebox">
                <div className="prod__price">
                  <strong className={item.price ? '' : 'prod__price--ask'}>{priceText(item.price)}</strong>
                  {item.old && <s>{item.old}</s>}
                  {item.price && <small>/ {item.unit}</small>}
                </div>
                {item.attrs
                  ? <Attrs attrs={item.attrs} />
                  : (
                    <ul className="prod__points">
                      {item.points.map((p, i) => <li key={i}><Icon name="check" size={16} /> {p}</li>)}
                    </ul>
                  )}
                {missing && (
                <p className="prod__stock">
                  <Icon name="clock" size={17} /> Сейчас нет в наличии — сообщим, когда поступит
                </p>
              )}
              <div className="prod__actions">
                  <button className="btn btn-primary" onClick={() => openForm(missing ? 'ask' : 'visit', item.title)}>
                  {missing ? 'Сообщить о поступлении' : 'Записаться на примерку'} <Icon name="arrow" size={18} />
                </button>
                  {/* Отложить в корзину можно и отсюда: раньше это было только в каталоге,
                      и человек, дошедший до карточки, терял такую возможность. */}
                  {!missing && (
                    <button
                      className={`btn btn-ghost prod__cart ${cart.has(item.slug) ? 'is-in' : ''}`}
                      onClick={() => (cart.has(item.slug) ? cart.remove(item.slug) : cart.add(item.slug))}
                    >
                      <Icon name={cart.has(item.slug) ? 'check' : 'cart'} size={18} />
                      {cart.has(item.slug) ? 'В корзине' : 'В корзину'}
                    </button>
                  )}
                </div>
                <div className="prod__contact">
                  <a href={SITE.phoneHref} className="prod__phone"><Icon name="phone" size={18} /> {SITE.phone}</a>
                  <button className="prod__call" onClick={() => openForm('call')}>или закажите звонок</button>
                </div>
              </div>

              {isDevice && (
                <ul className="prod__meta">
                  <li><Icon name="home" size={18} /> <span>Выезд на дом<small>по записи</small></span></li>
                  {warranty && <li><Icon name="shield" size={18} /> <span>Гарантия<small>{warranty}</small></span></li>}
                  <li><Icon name="doc" size={18} /> <span>Настройка<small>входит в цену</small></span></li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Описание / характеристики / условия */}
      <section className="section section--sand">
        <div className="container">
          <div className="tabs" role="tablist" aria-label="Описание товара">
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                id={`ptab-${t.key}`}
                aria-selected={tab === t.key}
                aria-controls="ppanel"
                className={`tabs__btn ${tab === t.key ? 'is-active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="tabs__panel" role="tabpanel" id="ppanel" aria-labelledby={`ptab-${tab}`}>
            {tab === 'desc' && (
              <div className="prose">
                {desc.map((p, i) => <p key={i}>{p}</p>)}
                <Ph ratio="21 / 9" className="prose__ph" src={item.img} alt={item.title} />
                <span className="prose__cap">Фото аппарата в комплекте поставки</span>
              </div>
            )}

            {tab === 'specs' && (
              item.specs?.length
                ? <ul className="speclist">{item.specs.map((s, i) => <li key={i}>{specLine(s)}</li>)}</ul>
                : <p className="speclist__empty">{NO_DATA}</p>
            )}

            {tab === 'functions' && (
              item.functions?.length
                ? <ul className="speclist">{item.functions.map((f, i) => <li key={i}>{f}</li>)}</ul>
                : <p className="speclist__empty">{NO_DATA}</p>
            )}
          </div>
        </div>
      </section>

      {/* Форма заявки на этот товар/услугу */}
      <section className="section">
        <div className="container form-split">
          <Reveal>
            <span className="eyebrow">Примерка</span>
            <h2 style={{ margin: '14px 0 16px' }}>Послушайте аппарат вживую</h2>
            <p className="lead">Настроим модель под вашу аудиограмму прямо на приёме, чтобы вы сравнили звук до покупки.</p>
            <ul className="form-split__list">
              <li><Icon name="check" size={16} /> Примерка и настройка — бесплатно</li>
              <li><Icon name="check" size={16} /> Сравним с 1–2 другими моделями</li>
              <li><Icon name="check" size={16} /> Без обязательства покупать</li>
            </ul>
          </Reveal>
          <Reveal className="form-card" delay={100}>
            <div className="form-card__head">
              <h3>Записаться на примерку</h3>
              <p>Перезвоним и подтвердим удобное время.</p>
            </div>
            <RequestForm variant="visit" subject={item.title} />
          </Reveal>
        </div>
      </section>

      {/* Похожие */}
      <section className="section section--sand">
        <div className="container">
          <div className="head-row">
            <div className="section-head">
              <span className="eyebrow">Ещё варианты</span>
              <h2>Похожие аппараты</h2>
            </div>
            <Link to="/catalog" className="link-more">Весь каталог <Icon name="arrow" size={18} /></Link>
          </div>
          <div className="grid grid-4">
            {related.map((r, i) => <Reveal key={r.slug} delay={i * 60}><ProductCard item={r} compact /></Reveal>)}
          </div>
        </div>
      </section>
    </>
  )
}
