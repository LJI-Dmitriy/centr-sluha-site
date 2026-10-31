import Icon from './Icon'
import { useContent } from './ContentContext'
import { useRequestForm } from './RequestModal'

/* Кнопка «Оставить отзыв». Пока у центра нет карточки на Яндекс Картах, отзыв
   уходит через форму сайта — в панель, а без панели письмом. Когда появится
   ссылка на карточку (SITE.reviewsUrl), кнопка поведёт туда. */
export default function ReviewButton({ className = 'btn btn-primary' }) {
  const { SITE } = useContent()
  const openForm = useRequestForm()

  if (SITE.reviewsUrl) {
    return (
      <a className={className} href={SITE.reviewsUrl} target="_blank" rel="noreferrer">
        Оставить отзыв <Icon name="arrow" size={18} />
      </a>
    )
  }
  return (
    <button className={className} onClick={() => openForm('review')}>
      Оставить отзыв <Icon name="arrow" size={18} />
    </button>
  )
}
