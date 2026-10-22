import './Messengers.css'

/* Кнопки мессенджеров: подпись на фирменном цвете, без значков. */

const NAMES = {
  max: 'MAX',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  vk: 'ВКонтакте',
  mail: 'Почта',
}

/* Ссылки на эти мессенджеры центр пришлёт позже: кнопка уже стоит на месте,
   а пока ссылки в панели нет — никуда не ведёт. Заполнят в панели — заработает. */
const PENDING = ['telegram', 'whatsapp', 'vk']

/* links — набор из панели: { max, telegram, whatsapp, vk }, mail — почта центра.
   kinds — какие кнопки и в каком порядке; MAX и почта без ссылки не выводятся */
export default function Messengers({ links, mail, kinds = ['max', 'mail'], size = 'normal' }) {
  const hrefs = { ...links, mail: mail ? `mailto:${mail}` : null }
  const items = kinds
    .map((kind) => [kind, hrefs[kind] || (PENDING.includes(kind) ? '#' : null)])
    .filter(([, href]) => href)

  if (!items.length) return null

  return (
    <div className={`msgr ${size === 'big' ? 'msgr--big' : ''}`}>
      {items.map(([kind, href]) => (
        <a
          key={kind}
          className={`msgr__btn msgr__btn--${kind}`}
          href={href}
          target={kind === 'mail' || href === '#' ? undefined : '_blank'}
          rel="noreferrer"
          onClick={href === '#' ? (e) => e.preventDefault() : undefined}
        >
          <span>{NAMES[kind]}</span>
        </a>
      ))}
    </div>
  )
}
