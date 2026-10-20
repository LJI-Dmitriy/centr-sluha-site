import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { NAV, CATALOG_MENU, CATALOG_EXTRA, CERT_LINK } from '../data/site'
import { useContent } from './ContentContext'
import Icon from './Icon'
import Logo from './Logo'
import { useRequestForm } from './RequestModal'
import { useCart } from './CartContext'
import './Header.css'

export default function Header() {
  const { SITE } = useContent()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false) // подменю каталога на телефоне
  const { pathname } = useLocation()
  const openForm = useRequestForm()
  const cart = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false); setCatOpen(false) }, [pathname])

  return (
    <header className={`hdr ${scrolled ? 'hdr--scrolled' : ''}`}>
      <div className="hdr__top">
        <div className="container hdr__top-inner">
          <Link to="/locations" className="hdr__city"><Icon name="pin" size={15} /> {SITE.city} <Icon name="arrow" size={13} /></Link>
          <span><Icon name="clock" size={15} /> {SITE.hours}</span>
          <a href={SITE.phoneHref} className="hdr__top-phone"><Icon name="phone" size={15} /> {SITE.phone}</a>
        </div>
      </div>

      <div className="container hdr__inner">
        <Link to="/" className="logo" aria-label={SITE.name}>
          <span className="logo__mark"><Logo size={44} /></span>
          <span className="logo__text">{SITE.name}<small>{SITE.tagline}</small></span>
        </Link>

        <nav className={`nav ${open ? 'nav--open' : ''}`}>
          <div className={`nav__item nav__item--drop ${catOpen ? 'is-open' : ''}`}>
            <NavLink to="/catalog" className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}>
              {NAV[0].label}
            </NavLink>
            {/* на телефоне разделы каталога прячем под стрелку, иначе меню на два экрана */}
            <button
              className="nav__more"
              onClick={() => setCatOpen((v) => !v)}
              aria-expanded={catOpen}
              aria-label="Разделы каталога"
            >
              <Icon name="arrow" size={18} />
            </button>

            {/* Меню каталога: бренд, тип корпуса, особенности, стоимость */}
            <div className="megamenu">
              {/* понятно, что колонки ниже — про аппараты: остальные разделы каталога
                  вынесены отдельным столбцом */}
              <Link to="/catalog" className="megamenu__title">Слуховые аппараты</Link>
              <div className="megamenu__cols">
                {CATALOG_MENU.map((col) => (
                  <div className="megamenu__col" key={col.title}>
                    <h4>{col.title}</h4>
                    {col.items.map((i) => <Link key={i.label} to={i.to}>{i.label}</Link>)}
                  </div>
                ))}
              </div>
              <div className="megamenu__more">
                {CATALOG_EXTRA.map((i) => <Link key={i.label} to={i.to}>{i.label}</Link>)}
              </div>

              <div className="megamenu__foot">
                <Link to={CERT_LINK.to} className="megamenu__cert">
                  <Icon name="doc" size={17} /> {CERT_LINK.label}
                </Link>
                <button className="btn btn-primary btn-sm" onClick={() => openForm('visit')}>Записаться на приём</button>
              </div>
            </div>
          </div>

          {NAV.slice(1).map((i) => (
            <NavLink key={i.to} to={i.to} className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}>
              {i.label}
            </NavLink>
          ))}
          <a href={SITE.phoneHref} className="nav__phone">{SITE.phone}</a>
        </nav>

        <form
          className="hdr__search"
          onSubmit={(e) => {
            e.preventDefault()
            const q = new FormData(e.currentTarget).get('q').toString().trim()
            navigate(q ? `/catalog?q=${encodeURIComponent(q)}` : '/catalog')
          }}
        >
          <Icon name="search" size={17} />
          <input type="search" name="q" placeholder="Поиск по каталогу" aria-label="Поиск по каталогу" />
        </form>

        <div className="hdr__actions">
          <Link to="/cart" className="hdr__cart" aria-label="Корзина">
            <Icon name="cart" size={22} />
            {cart.slugs.length > 0 && <span className="hdr__cart-badge" />}
          </Link>
          <button className="btn btn-primary hdr__cta" onClick={() => openForm('visit')}>Записаться</button>
          <button className={`burger ${open ? 'burger--x' : ''}`} onClick={() => setOpen((v) => !v)} aria-label="Меню">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  )
}
