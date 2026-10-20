import { Link, useParams } from 'react-router-dom'
import { Breadcrumbs } from '../components/PageHero'
import Icon from '../components/Icon'
import Ph from '../components/Ph'
import Reveal from '../components/Reveal'
import RequestForm from '../components/RequestForm'
import Seo from '../components/Seo'
import NotFound from './NotFound'
import { useContent } from '../components/ContentContext'
import './Pages.css'

export default function NewsItem() {
  const { NEWS } = useContent()
  const { slug } = useParams()
  const item = NEWS.find((n) => n.slug === slug)
  if (!item) return <NotFound />

  const other = NEWS.filter((n) => n.slug !== item.slug).slice(0, 3)

  return (
    <>
      <Seo title={item.title} description={item.excerpt} path={`/news/${item.slug}`} />

      <section className="section section--tight" style={{ paddingTop: 'clamp(28px, 4vw, 44px)' }}>
        <div className="container">
          <Breadcrumbs items={[{ to: '/news', label: 'Информация' }, { label: item.title }]} />

          <div className="article">
            <header className="article__head">
              {/* время чтения — по объёму текста, примерно 180 слов в минуту */}
              <div className="ncard__meta"><span className="tag">{item.tag}</span><time>{item.date}</time><span className="article__read">{Math.max(1, Math.round([item.excerpt, ...item.body].join(' ').split(/\s+/).length / 180))} мин чтения</span></div>
              <h1>{item.title}</h1>
              <p className="lead">{item.excerpt}</p>
            </header>

            <Ph ratio="16 / 9" className="article__cover" src={item.cover} alt={item.title} fit="cover" />

            {/* статья выводится целиком, сколько бы абзацев в ней ни было: шаблон с вставками
                на 4 абзаца обрезал длинные материалы и добавлял в каждый один и тот же текст */}
            <div className="prose">
              {item.body.map((p, i) => <p key={i}>{p}</p>)}
            </div>

            <div className="article__foot">
              {item.tag && <div className="article__tags"><span className="tag">{item.tag}</span></div>}
              <Link to="/news" className="link-more"><Icon name="arrowLeft" size={18} /> Ко всем материалам</Link>
            </div>

            <div className="form-card article__form">
              <div className="form-card__head">
                <h3>Остались вопросы?</h3>
                <p>Напишите — ответит сурдолог, а не менеджер.</p>
              </div>
              <RequestForm variant="ask" />
            </div>
          </div>
        </div>
      </section>

      <section className="section section--sand">
        <div className="container">
          <div className="head-row">
            <div className="section-head">
              <span className="eyebrow">Ещё по теме</span>
              <h2>Другие материалы</h2>
            </div>
            <Link to="/news" className="link-more">Все материалы <Icon name="arrow" size={18} /></Link>
          </div>
          <div className="grid grid-3">
            {other.map((n, i) => (
              <Reveal key={n.slug} delay={i * 60}>
                <Link to={`/news/${n.slug}`} className="ncard">
                  <Ph ratio="16 / 9" className="ncard__ph" src={n.cover} alt={n.title} fit="cover" />
                  <div className="ncard__body">
                    <div className="ncard__meta"><span className="tag">{n.tag}</span><time>{n.date}</time></div>
                    <h3>{n.title}</h3>
                    <p>{n.excerpt}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
