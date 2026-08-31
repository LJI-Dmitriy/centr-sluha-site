import { Link } from 'react-router-dom'
import { NAV, CATEGORIES } from '../data/site'
import { useContent } from './ContentContext'
import Icon from './Icon'
import Mail from './Mail'
import Logo from './Logo'
import Messengers from './Messengers'
import { useRequestForm } from './RequestModal'
import './Footer.css'

export default function Footer() {
  const { SITE, LINKS } = useContent()
  const openForm = useRequestForm()
  return (
    <footer className="ftr">
      <div className="container ftr__grid">
        <div className="ftr__brand">
          <div className="logo">
            <span className="logo__mark logo__mark--light"><Logo size={36} /></span>
            <span className="logo__text" style={{ color: '#fff' }}>
              {SITE.name}<small style={{ color: 'rgba(255,255,255,.6)' }}>{SITE.tagline}</small>
            </span>
          </div>
          <p className="ftr__about">Проверяем слух, подбираем и настраиваем слуховые аппараты. Центр в Краснодаре, выезд на дом по Краснодарскому краю и Адыгее.</p>
          <button className="btn btn-light btn-sm" onClick={() => openForm('call')}>Заказать звонок</button>
        </div>

        <div className="ftr__col">
          <h4>Разделы</h4>
          <Link to="/">Главная</Link>
          {NAV.map((i) => <Link key={i.to} to={i.to}>{i.label}</Link>)}
        </div>

        <div className="ftr__col">
          <h4>Каталог</h4>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to={`/catalog?cat=${c.slug}`}>{c.title}</Link>
          ))}
        </div>

        <div className="ftr__col">
          <h4>Контакты</h4>
          <a href={SITE.phoneHref}><Icon name="phone" size={17} /> {SITE.phone}</a>
          <span className="ftr__mail"><Icon name="mail" size={17} /> <Mail address={SITE.email} /></span>
          <span><Icon name="pin" size={17} /> {SITE.address}</span>
          <span><Icon name="clock" size={17} /> {SITE.hours}</span>
        </div>

        <div className="ftr__col">
          <h4>Написать нам</h4>
          <p className="ftr__hint">Ответим в рабочее время. Заявку можно отправить и без звонка.</p>
          <Messengers links={LINKS} mail={SITE.email} />
        </div>
      </div>

      <div className="container ftr__extra">
        <Link to="/promo">Акции</Link>
        <Link to="/catalog">Прайс-лист</Link>
        <Link to="/locations">Как доехать</Link>
        <Link to="/news">Полезные статьи</Link>
        <button onClick={() => openForm('ask')}>Задать вопрос</button>
      </div>

      <div className="container ftr__note">Имеются противопоказания. Необходима консультация специалиста.</div>

      {/* Оговорка про оферту — требование заказчика, стоит перед служебными ссылками */}
      <div className="container ftr__offer">
        Информация на сайте носит исключительно информационный характер и ни при каких условиях
        не является публичной офертой, определяемой положениями ч. 2 ст. 437 Гражданского кодекса РФ.
        Получить подробную информацию о стоимости, комплектации и сроках выполнения услуг вы можете
        по телефону горячей линии.
      </div>

      <div className="container ftr__bottom">
        <span className="ftr__legal">
          <Link to="/privacy">Политика конфиденциальности</Link>
          <Link to="/consent">Согласие на обработку данных</Link>
        </span>
        <span>{SITE.license}</span>
      </div>
    </footer>
  )
}
