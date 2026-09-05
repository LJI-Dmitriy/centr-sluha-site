import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import HeroSlider from '../components/HeroSlider'
import MapEmbed from '../components/MapEmbed'
import Reveal from '../components/Reveal'
import ProductCard from '../components/ProductCard'
import Ph from '../components/Ph'
import Messengers from '../components/Messengers'
import RequestForm from '../components/RequestForm'
import Seo from '../components/Seo'
import { useRequestForm } from '../components/RequestModal'
import { useContent } from '../components/ContentContext'
import { OFFERS, PICKER, CATEGORIES, BRANDS } from '../data/site'
import './Pages.css'
import './Sections.css'

/* Главная: короткое вступление, потом то, ради чего приходят —
   аппараты с ценами, услуги с ценами и адрес. Подробности о центре,
   акции и статьи живут на своих страницах. */
export default function Home() {
  const { SITE, LINKS, CATALOG, HOME_PRODUCTS, CENTERS, PROMOS } = useContent()
  const openForm = useRequestForm()
  const main = CENTERS[0]
  const products = (HOME_PRODUCTS.length ? HOME_PRODUCTS : CATALOG).slice(0, 4)

  return (
    <>
      <Seo description="Центр слуха в Краснодаре: тест слуха бесплатно, подбор и настройка слуховых аппаратов, выезд на дом." />

      <HeroSlider />

      {/* КЛЮЧЕВЫЕ ОФФЕРЫ — строкой под слайдером */}
      <section className="offers">
        <div className="container offers__row">
          {OFFERS.map((o, i) => (
            <button className="offer" key={i} onClick={() => openForm('visit')}>
              <span className="offer__ic"><Icon name={o.icon} size={22} /></span>
              <span className="offer__text">
                <strong>{o.title}</strong>
                <small>{o.text}</small>
              </span>
              <span className="offer__note">{o.note}</span>
            </button>
          ))}
        </div>
      </section>

      {/* АКЦИИ — три предложения в ряд, как просил центр */}
      <section className="section">
        <div className="container">
          <Reveal className="head-row">
            <div className="section-head" style={{ marginBottom: 0 }}>
              <span className="eyebrow">Выгода</span>
              <h2>Акции и специальные предложения</h2>
            </div>
          </Reveal>
          <div className="grid grid-3 grid--swipe">
            {PROMOS.slice(0, 3).map((p, i) => (
              <Reveal key={p.slug || i} delay={i * 60}>
                <article className="promo">
                  <div className="promo__media">
                    <Ph ratio="16 / 9" src={p.cover} alt={p.title} fit="cover" />
                    {p.note && <span className="promo__badge">{p.note}</span>}
                  </div>
                  <div className="promo__body">
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                    <div className="promo__foot">
                      <Link to={`/promo/${p.slug}`} className="link-more">Подробнее <Icon name="arrow" size={16} /></Link>
                      <button className="btn btn-primary btn-sm" onClick={() => openForm('visit')}>Записаться</button>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <Link to="/promo" className="btn btn-ghost">Показать все акции <Icon name="arrow" size={18} /></Link>
          </div>
        </div>
      </section>

      {/* БЫСТРЫЙ ПОДБОР — разделы каталога одной строкой */}
      <section className="section section--tight" style={{ paddingTop: 24, paddingBottom: 'clamp(32px, 4vw, 52px)' }}>
        <div className="container picker">
          <div>
            <span className="eyebrow">Каталог</span>
            <h2>С чего начнём подбор?</h2>
          </div>
          <div className="cat-chips">
            {CATEGORIES.map((c) => (
              <Link key={c.slug} to={`/catalog?cat=${c.slug}`} className="chip">{c.title} <small>{c.count}</small></Link>
            ))}
            {PICKER.slice(0, 3).map((p, i) => (
              <Link key={i} to={`/catalog?cat=${p.cat}`} className="chip">{p.label}</Link>
            ))}
            <Link to="/catalog" className="chip chip--all">Весь каталог <Icon name="arrow" size={15} /></Link>
          </div>
        </div>
      </section>

      {/* АППАРАТЫ */}
      <section className="section section--sand">
        <div className="container">
          <Reveal className="head-row">
            <div className="section-head" style={{ marginBottom: 0 }}>
              <span className="eyebrow">Каталог</span>
              <h2>Слуховые аппараты</h2>
            </div>
            <Link to="/catalog" className="link-more">Весь каталог <Icon name="arrow" size={18} /></Link>
          </Reveal>
          <div className="grid grid-4 grid--swipe">
            {products.map((item) => <ProductCard key={item.slug} item={item} compact />)}
          </div>
        </div>
      </section>

      {/* БРЕНДЫ */}
      <section className="section section--tight" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="brands">
            {BRANDS.map((b) => <span key={b} className="brands__logo">{b}</span>)}
          </Reveal>
        </div>
      </section>

      {/* ЗАПИСЬ — форма прямо на главной, как просил центр */}
      <section className="section section--sand">
        <div className="container form-split">
          <Reveal>
            <span className="eyebrow">Запись</span>
            <h2 style={{ margin: '14px 0 16px' }}>Записаться на приём</h2>
            <p className="lead">
              Оставьте заявку — перезвоним в рабочее время, ответим на вопросы и согласуем день.
              Или позвоните сами: {SITE.phone}.
            </p>
            <ul className="form-split__list">
              <li><Icon name="check" size={16} /> Тест слуха и подбор — бесплатно</li>
              <li><Icon name="check" size={16} /> Выезд специалиста на дом по Краснодарскому краю и Адыгее</li>
              <li><Icon name="check" size={16} /> Оплата электронным сертификатом СФР</li>
            </ul>
          </Reveal>
          <Reveal className="form-card" delay={100}>
            <div className="form-card__head">
              <h3>Заявка на приём</h3>
              <p>После заявки дождитесь подтверждения по телефону.</p>
            </div>
            <RequestForm variant="visit" />
          </Reveal>
        </div>
      </section>

      {/* АДРЕС */}
      <section className="section section--sand">
        <div className="container">
          <Reveal className="head-row">
            <div className="section-head" style={{ marginBottom: 0 }}>
              <span className="eyebrow">Адрес</span>
              <h2>{main.title}</h2>
            </div>
            <Link to={`/locations/${main.slug}`} className="link-more">Как доехать <Icon name="arrow" size={18} /></Link>
          </Reveal>

          <div className="map-split">
            <Reveal className="map-split__list">
              <div className="acard">
                <span className="acard__row"><Icon name="pin" size={17} /> {main.address}</span>
                <span className="acard__row"><Icon name="wave" size={17} /> {main.metro}</span>
                <span className="acard__row"><Icon name="clock" size={17} /> {main.hours}</span>
                <a className="acard__row" href={SITE.phoneHref}><Icon name="phone" size={17} /> {SITE.phone}</a>
                <div className="acard__actions">
                  <button className="btn btn-primary btn-sm" onClick={() => openForm('visit')}>Записаться</button>
                  <Link to="/about" className="btn btn-ghost btn-sm">О центре</Link>
                </div>
              </div>

              <div className="acard">
                <h3>Написать</h3>
                <p className="acard__note">Если звонить неудобно — ответим в мессенджере в рабочее время.</p>
                <Messengers links={LINKS} mail={SITE.email} />
              </div>
            </Reveal>

            <Reveal className="map-split__map" delay={100}>
              <MapEmbed coords={main.coords} address={main.address} className="ph--flat" />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
