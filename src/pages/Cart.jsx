import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Icon from '../components/Icon'
import Ph from '../components/Ph'
import RequestForm from '../components/RequestForm'
import { useCart } from '../components/CartContext'
import { useContent } from '../components/ContentContext'
import { priceText } from '../lib/price'
import './Pages.css'
import Seo from '../components/Seo'

/* Корзина: выбранные позиции без количеств — итог остаётся заглушкой */
export default function Cart() {
  const { CATALOG } = useContent()
  const cart = useCart()
  const items = CATALOG.filter((i) => cart.slugs.includes(i.slug))

  return (
    <>
      <Seo title={"Корзина"} description={"Выбранные модели аппаратов: оставьте заявку — перезвоним и подготовим их к визиту."} path={"/cart"} />
      <PageHero crumbs={[{ label: 'Корзина' }]} eyebrow="Заявка" title="Корзина" text="Оплаты на сайте нет: соберите нужные позиции и оставьте заявку — перезвоним, уточним детали и подготовим их к визиту." />

      <section className="section">
        <div className="container">
          {items.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty__ic"><Icon name="cart" size={30} /></span>
              <h3>Пока пусто</h3>
              <p>Добавьте аппараты из каталога, чтобы примерить их за один визит.</p>
              <Link to="/catalog" className="btn btn-primary">Перейти в каталог <Icon name="arrow" size={18} /></Link>
            </div>
          ) : (
            <div className="cart">
              <div className="cart__list">
                {items.map((i) => (
                  <div className="cart__row" key={i.slug}>
                    <Ph ratio="1 / 1" className="cart__ph" src={i.img} alt={i.title} />
                    <div className="cart__body">
                      <h3><Link to={`/catalog/${i.slug}`}>{i.title}</Link></h3>
                      <p>{i.short}</p>
                    </div>
                    <div className="cart__price">
                      <strong>{priceText(i.price)}</strong>
                      {i.old && <s>{i.old}</s>}
                    </div>
                    <button className="cart__del" onClick={() => cart.remove(i.slug)} aria-label="Убрать">
                      <Icon name="close" size={18} />
                    </button>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" onClick={cart.clear}>Очистить список</button>
              </div>

              <aside className="cart__side">
                <div className="form-card">
                  <div className="cart__total">
                    <span>Позиций: <strong>{items.length}</strong></span>
                    <span>Примерка: <strong>бесплатно</strong></span>
                  </div>
                  <div className="form-card__head">
                    <h3>Записаться на примерку</h3>
                    <p>Подготовим выбранные модели к вашему визиту.</p>
                  </div>
                  <RequestForm variant="visit" items={items.map((i) => `${i.title} — ${priceText(i.price)}`).join('; ')} />
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
