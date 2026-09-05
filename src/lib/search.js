/* Поиск не должен зависеть от раскладки и языка.

   «фззду» набрано в русской раскладке вместо apple, «ышптшф» — вместо signia.
   Поэтому запрос сравниваем сразу в нескольких видах: как есть, с переключённой
   раскладкой в обе стороны и в латинской транслитерации. */

const RU = 'йцукенгшщзхъфывапролджэячсмитьбю.ё'
const EN = "qwertyuiop[]asdfghjkl;'zxcvbnm,./`"

const swap = (text, from, to) =>
  text
    .split('')
    .map((ch) => {
      const lower = ch.toLowerCase()
      const i = from.indexOf(lower)
      if (i < 0) return ch
      const mapped = to[i]
      return ch === lower ? mapped : mapped.toUpperCase()
    })
    .join('')

const TRANSLIT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
  э: 'e', ю: 'yu', я: 'ya',
}

const translit = (text) =>
  text.toLowerCase().split('').map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch)).join('')

/* Сглаживаем разницу написаний: phonak и фонак, resound и ресаунд */
const simplify = (text) =>
  translit(text)
    .replace(/ph/g, 'f')
    .replace(/ck/g, 'k')
    .replace(/kh/g, 'h')
    .replace(/ee|ea/g, 'i')
    .replace(/(.)\1+/g, '$1')

/* Все варианты написания запроса — по любому из них ищем совпадение */
export function queryVariants(query) {
  const base = query.trim().toLowerCase()
  if (!base) return []
  return [...new Set([base, swap(base, RU, EN), swap(base, EN, RU)].flatMap((v) => [v, simplify(v)]))]
}

/* Характеристики бывают строками (из панели) и парами (во встроенных данных) */
export const specText = (s) => (typeof s === 'string' ? s : `${s.k} ${s.v}`)

/* Текст позиции, по которому ищем: название, бренд, описание, характеристики */
export function searchableText(item) {
  const raw = [item.title, item.brand, item.short, ...Object.values(item.attrs || {}), ...(item.points || []), ...(item.specs || []).map(specText)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return `${raw} ${simplify(raw)}`
}

/* Во фразе «хочу купить signia» значимое слово одно, поэтому достаточно
   совпадения хотя бы по одному слову: лишние «хочу» и «купить» не мешают. */
export function matchesSearch(item, query) {
  const haystack = searchableText(item)
  return queryVariants(query).some((variant) => {
    const words = variant.split(/\s+/).filter((w) => w.length >= 3)
    const list = words.length ? words : variant.split(/\s+/).filter(Boolean)
    return list.some((word) => haystack.includes(word))
  })
}
