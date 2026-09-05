import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Icon from '../components/Icon'
import Ph from '../components/Ph'
import Reveal from '../components/Reveal'
import RequestForm from '../components/RequestForm'
import { useRequestForm } from '../components/RequestModal'
import { useContent } from '../components/ContentContext'
import './Pages.css'
import './Sections.css'
import Seo from '../components/Seo'

/* Акции и специальные предложения. У каждой — своя страница с подробностями. */
export default function Promo() {
  const { PROMOS } = useContent()
  const openForm = useRequestForm()

  return (
    <>
      <Seo title={"Акции"} description={"Покупка по электронному сертификату СФР, бесплатный выезд на дом, бесплатный тест слуха. Предложения центра слуха в Краснодаре."} path={"/promo"} />
      <PageHero
        crumbs={[{ label: 'Акции' }]}
        eyebrow="Выгода"
        title="Акции и специальные предложения"
        text="Действующие предложения центра. Условия можно совмещать — уточните на приёме."
      />

      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {PROMOS.map((p, i) => (
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
                      {p.slug
                        ? <Link to={`/promo/${p.slug}`} className="link-more">Подробнее <Icon name="arrow" size={16} /></Link>
                        : <span><Icon name="calendar" size={16} /> до {p.until}</span>}
                      <button className="btn btn-primary btn-sm" onClick={() => openForm('visit')}>Записаться</button>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--sand">
        <div className="container form-split">
          <Reveal>
            <span className="eyebrow">Электронный сертификат</span>
            <h2 style={{ margin: '14px 0 16px' }}>Аппарат по сертификату СФР</h2>
            <p className="lead">
              Сертификатом можно оплатить любой аппарат из каталога, разницу — своими средствами.
              Помогаем разобраться с документами и оформить покупку.
            </p>
            <ul className="form-split__list">
              <li><Icon name="check" size={16} /> Оплата картой «Мир» с привязанным сертификатом</li>
              <li><Icon name="check" size={16} /> Гарантия производителя и обслуживание в центре</li>
              <li><Icon name="check" size={16} /> Оформить можно и с выездом специалиста на дом</li>
            </ul>
          </Reveal>
          <Reveal className="form-card" delay={100}>
            <div className="form-card__head">
              <h3>Спросить об условиях</h3>
              <p>Расскажем, что подойдёт в вашем случае.</p>
            </div>
            <RequestForm variant="ask" />
          </Reveal>
        </div>
      </section>
    </>
  )
}
