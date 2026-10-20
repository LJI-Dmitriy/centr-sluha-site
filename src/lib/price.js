/* Цена может быть не заполнена: центр ещё не назначил её или она зависит
   от комплектации и степени потери слуха. Тогда вместо суммы на сайте
   показывается «Цена по запросу», а позиция не участвует в подборе по цене. */

export const ON_REQUEST = 'Цена по запросу'

export const priceText = (price) => (String(price ?? '').trim() || ON_REQUEST)

/* Число из строки цены: «46 900 ₽» → 46900, «от 1 000 ₽» → 1000.
   Пустая цена — null, чтобы такая позиция не выглядела бесплатной
   в сортировке и не проходила фильтр по цене. «Бесплатно» — честный ноль. */
export const priceValue = (price) => {
  const text = String(price ?? '').trim()
  if (!text) return null
  const digits = text.replace(/[^\d]/g, '')
  return digits ? Number(digits) : 0
}
