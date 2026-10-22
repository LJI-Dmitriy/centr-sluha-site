import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Icon from '../components/Icon'
import Ph from '../components/Ph'
import MapEmbed from '../components/MapEmbed'
import Mail from '../components/Mail'
import Messengers from '../components/Messengers'
import Reveal from '../components/Reveal'
import RequestForm, { FORM_VARIANTS } from '../components/RequestForm'
import { useRequestForm } from '../components/RequestModal'
import { SCHEDULE } from '../data/site'
import { useContent } from '../components/ContentContext'
import './Pages.css'
import Seo from '../components/Seo'

export default function Contacts() {
  const { SITE, CENTERS, LINKS } = useContent()
  const [tab, setTab] = useState('visit')

  const LINES = [
    { icon: 'phone', label: 'Единый телефон', value: SITE.phone, href: SITE.phoneHref },
    { icon: 'mail', label: 'Почта', value: SITE.email, mail: true },
    { icon: 'pin', label: 'Главный центр', value: SITE.address },
  ]

  const openForm = useRequestForm()
  const v = FORM_VARIANTS[tab]

  return (
    <>
      <Seo title={"Контакты и запись"} description={"Телефон, почта, адрес и часы приёма. Запись на приём, вопрос сурдологу, обратный звонок."} path={"/contacts"} />
      <PageHero
        crumbs={[{ label: 'Контакты' }]}
        eyebrow="Связаться"
        title="Контакты и запись"
        text="Позвоните или оставьте заявку — перезвоним, подберём время и подскажем, как доехать."
      />

      {/* Контакты */}
      <section className="section section--tight" style={{ paddingTop: 'clamp(32px, 4vw, 52px)' }}>
        <div className="container grid grid-3">
          {LINES.map((l, i) => (
            <Reveal className="cline" key={i} delay={i * 60}>
              <span className="cline__ic"><Icon name={l.icon} size={20} /></span>
              <small>{l.label}</small>
              {l.mail ? <Mail address={l.value} /> : l.href ? <a href={l.href}>{l.value}</a> : <span>{l.value}</span>}
            </Reveal>
          ))}
        </div>
      </section>

      {/* Мессенджеры — отдельно от контактной информации */}
      <section className="section section--tight" style={{ paddingTop: 'clamp(20px, 2.5vw, 32px)' }}>
        <div className="container msgr-row">
          <div>
            <span className="eyebrow">Связь</span>
            <h2>Напишите, если звонить неудобно</h2>
            <p className="lead">Отвечаем в рабочее время. Можно прислать аудиограмму или фотографию аппарата — подскажем, что с ним.</p>
          </div>
          <Messengers links={LINKS} mail={SITE.email} size="big" />
        </div>
      </section>

      {/* Адреса + карта */}
      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Адреса</span>
            <h2>Где нас найти</h2>
          </Reveal>

          <div className="map-split">
            <Reveal className="map-split__list">
              {CENTERS.map((a, i) => (
                <div className="acard" key={i}>
                  <h3>{a.title}</h3>
                  <span className="acard__row"><Icon name="pin" size={17} /> {a.address}</span>
                  <span className="acard__row"><Icon name="wave" size={17} /> {a.metro}</span>
                  <span className="acard__row"><Icon name="clock" size={17} /> {a.hours}</span>
                  <a className="acard__row" href={SITE.phoneHref}><Icon name="phone" size={17} /> {a.phone}</a>
                  {a.note && <p className="acard__note">{a.note}</p>}
                  <div className="acard__actions">
                    <Link to={`/locations/${a.slug}`} className="btn btn-ghost btn-sm">О центре</Link>
                    <button className="btn btn-primary btn-sm" onClick={() => openForm('visit')}>Записаться</button>
                  </div>
                </div>
              ))}
            </Reveal>
            <Reveal className="map-split__map" delay={100}>
              <MapEmbed />
            </Reveal>
          </div>
        </div>
      </section>

      {/* График работы + формы */}
      <section className="section section--sand">
        <div className="container contacts-split">
          <Reveal>
            <span className="eyebrow">График</span>
            <h2 style={{ margin: '14px 0 20px' }}>Часы приёма</h2>
            <table className="sched">
              <tbody>
                {SCHEDULE.map((s, i) => (
                  <tr key={i}><th>{s.d}</th><td>{s.h}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="req">
              <h3>Как проходит первый визит</h3>
              <p>Тест слуха и консультация — 40 минут.</p>
            </div>
            <div className="req">
              <h3>Отзывы</h3>
              <p>Собираем отзывы на Яндекс.Картах и 2ГИС — там их видно вместе с датой и профилем автора. Ссылки на карточки центра добавим, как только они появятся.</p>
            </div>
          </Reveal>

          <Reveal className="form-card" delay={100}>
            {/* Три формы из ТЗ: запись, вопрос, обратный звонок */}
            <div className="form-tabs" role="tablist" aria-label="Тип обращения">
              {Object.values(FORM_VARIANTS).map((f) => (
                <button
                  key={f.key}
                  role="tab"
                  id={`tab-${f.key}`}
                  aria-selected={tab === f.key}
                  aria-controls={`panel-${f.key}`}
                  className={tab === f.key ? 'is-active' : ''}
                  onClick={() => setTab(f.key)}
                >
                  {f.tab}
                </button>
              ))}
            </div>
            <div className="form-card__head">
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
            <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
              <RequestForm variant={tab} key={tab} />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
