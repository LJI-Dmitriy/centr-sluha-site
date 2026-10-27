import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Icon from '../components/Icon'
import Seo from '../components/Seo'
import { LEGAL } from '../data/legal'
import './Pages.css'

/* Служебные страницы: политика конфиденциальности и согласие на обработку данных */
export default function Legal({ doc = 'privacy' }) {
  const d = LEGAL[doc]
  const other = doc === 'privacy' ? LEGAL.consent : LEGAL.privacy
  const otherTo = doc === 'privacy' ? '/consent' : '/privacy'

  return (
    <>
      <Seo title={d.title} description={d.intro} path={doc === 'privacy' ? '/privacy' : '/consent'} />

      <PageHero crumbs={[{ label: d.title }]} eyebrow="Документы" title={d.title} text={d.intro} />

      <section className="section">
        <div className="container legal">
          <aside className="legal__toc">
            <h4>Содержание</h4>
            {d.sections.map((s, i) => (
              <a key={i} href={`#s-${i}`}>{s.n}. {s.title}</a>
            ))}
            <div className="legal__updated">
              <Icon name="doc" size={17} /> Обновлено: {d.updated}
            </div>
          </aside>

          <div className="legal__body prose">
            {d.sections.map((s, i) => (
              <section key={i} id={`s-${i}`}>
                <h2>{s.n}. {s.title}</h2>
                {s.body.map((p, j) => <p key={j}>{p}</p>)}
                {i === 1 && (
                  <ul className="prose__list">
                    <li>перезвонить и согласовать время приёма;</li>
                    <li>ответить на вопрос, заданный через форму;</li>
                    <li>напомнить о записи накануне визита;</li>
                    <li>сохранить историю обращений внутри центра.</li>
                  </ul>
                )}
              </section>
            ))}

            <div className="legal__next">
              <span>Второй документ по теме</span>
              <Link to={otherTo} className="link-more">{other.title} <Icon name="arrow" size={18} /></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
