import { useParams } from 'react-router-dom'
import { Breadcrumbs } from '../components/PageHero'
import Icon from '../components/Icon'
import Ph from '../components/Ph'
import Reveal from '../components/Reveal'
import RequestForm from '../components/RequestForm'
import Seo from '../components/Seo'
import NotFound from './NotFound'
import { useContent } from '../components/ContentContext'
import './Pages.css'
import './Sections.css'

/* Страница одной акции: текст от центра плюс форма записи под ним.
   Блоки текста приходят из данных: {h} заголовок, {p} абзац, {list} список,
   {note} сноска мелким шрифтом. */
export default function PromoItem() {
  const { PROMOS } = useContent()
  const { slug } = useParams()
  const promo = PROMOS.find((p) => p.slug === slug)
  if (!promo) return <NotFound />

  return (
    <>
      <Seo title={promo.title} description={promo.text} path={`/promo/${promo.slug}`} />

      <section className="section section--tight" style={{ paddingTop: 'clamp(20px, 3vw, 32px)' }}>
        <div className="container">
          <Breadcrumbs items={[{ to: '/promo', label: 'Акции' }, { label: promo.title }]} />

          <div className="article__head">
            <span className="tag tag--accent">{promo.note}</span>
            <h1>{promo.title}</h1>
            <p className="lead">{promo.text}</p>
          </div>

          <Reveal>
            <Ph ratio="21 / 9" src={promo.cover} alt={promo.title} fit="cover" className="article__ph" />
          </Reveal>

          <div className="prose">
            {(promo.body || []).map((block, i) => {
              if (block.h) return <h2 key={i} className="prose__h">{block.h}</h2>
              if (block.list) {
                return (
                  <ul key={i} className="prose__list">
                    {block.list.map((line, j) => <li key={j}><Icon name="check" size={16} /> <span>{line}</span></li>)}
                  </ul>
                )
              }
              if (block.note) return <p key={i} className="prose__note">{block.note}</p>
              return <p key={i}>{block.p}</p>
            })}
          </div>
        </div>
      </section>

      <section className="section section--sand">
        <div className="container form-split">
          <Reveal>
            <span className="eyebrow">Запись</span>
            <h2 style={{ margin: '14px 0 16px' }}>Оставьте заявку</h2>
            <p className="lead">
              Ответим на все интересующие вас вопросы и согласуем дату и время приёма.
            </p>
            <ul className="form-split__list">
              <li><Icon name="check" size={16} /> Тест слуха и подбор — бесплатно</li>
              <li><Icon name="check" size={16} /> Выезд специалиста на дом по Краснодарскому краю и Адыгее</li>
              <li><Icon name="check" size={16} /> Оплата электронным сертификатом СФР</li>
            </ul>
          </Reveal>
          <Reveal className="form-card" delay={100}>
            <div className="form-card__head">
              <h3>Записаться на приём</h3>
              <p>После заявки дождитесь подтверждения по телефону.</p>
            </div>
            <RequestForm variant="visit" subject={promo.title} />
          </Reveal>
        </div>
      </section>
    </>
  )
}
