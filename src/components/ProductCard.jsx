import { Link } from 'react-router-dom'
import Icon from './Icon'
import Ph from './Ph'
import { useRequestForm } from './RequestModal'
import { useCart } from './CartContext'
import { priceText } from '../lib/price'
import './ProductCard.css'

/* Карточка товара/услуги в каталоге: фото, название, короткое описание, цена, кнопки */
/* Товар, которого нет в наличии, остаётся на сайте: ссылка и место в поиске
   сохраняются, а вместо «в список» человек просит сообщить о поступлении. */
const OUT_OF_STOCK = { net: 'Нет в наличии', pod_zakaz: 'Под заказ' }

export default function ProductCard({ item, compact = false }) {
  const openForm = useRequestForm()
  const cart = useCart()
  const missing = item.stock === 'net'
  return (
    <article className="pcard">
      <Link to={`/catalog/${item.slug}`} className="pcard__media">
        <Ph ratio="4 / 3" src={item.img} alt={item.title} />
        {item.promo && !OUT_OF_STOCK[item.stock] && (
          <span className="tag pcard__tag pcard__tag--sale" title={item.promo.title}>−{item.promo.discount}%</span>
        )}
        {item.tag && !item.promo && !OUT_OF_STOCK[item.stock] && <span className="tag tag--accent pcard__tag">{item.tag}</span>}
        {OUT_OF_STOCK[item.stock] && (
          <span className={`tag pcard__tag pcard__tag--${item.stock}`}>{OUT_OF_STOCK[item.stock]}</span>
        )}
      </Link>
      <div className="pcard__body">
        <h3><Link to={`/catalog/${item.slug}`}>{item.title}</Link></h3>
        <p>{item.short}</p>
        {!compact && (
          <ul className="pcard__points">
            {item.points.slice(0, 2).map((p, i) => <li key={i}><Icon name="check" size={14} /> {p}</li>)}
          </ul>
        )}
        <div className="pcard__price">
          <strong className={item.price ? '' : 'pcard__price--ask'}>{priceText(item.price)}</strong>
          {item.old && <s>{item.old}</s>}
        </div>
        {/* Действий два, а не три: карточка и название и так ведут на страницу товара,
            отдельная кнопка «Подробнее» только спорила с записью на приём. */}
        <div className="pcard__actions">
          <button className="btn btn-primary btn-sm" onClick={() => openForm(missing ? 'ask' : 'visit', item.title)}>
            {missing ? 'Сообщить о поступлении' : 'Записаться'}
          </button>
          {!missing && <button
            className={`pcard__cart ${cart.has(item.slug) ? 'is-in' : ''}`}
            onClick={() => (cart.has(item.slug) ? cart.remove(item.slug) : cart.add(item.slug))}
            aria-label="В корзину"
          >
            <Icon name={cart.has(item.slug) ? 'check' : 'cart'} size={18} />
          </button>}
        </div>
      </div>
    </article>
  )
}
