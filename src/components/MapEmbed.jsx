import { useEffect, useRef, useState } from 'react'
import { SITE } from '../data/site'
import Icon from './Icon'
import './MapEmbed.css'

/* Карта Яндекса без ключа и счётчиков.

   Пока виджет грузится, на его месте лежит схема-заглушка, а не белый прямоугольник.
   Если за 6 секунд карта не открылась (блокировщик рекламы, нет сети, Яндекс недоступен),
   показываем ту же схему с адресом и кнопкой — блок никогда не выглядит сломанным.

   Клик по карте открывает Яндекс.Карты в новой вкладке, кнопка с лупой — разворачивает
   карту прямо на странице. coords — [широта, долгота]. */
export default function MapEmbed({ coords = SITE.coords, address = SITE.address, zoom = 16, className = '' }) {
  const [state, setState] = useState('loading') // loading | ready | failed
  const [big, setBig] = useState(false)
  const [near, setNear] = useState(false) // виджет грузим, только когда до карты долистали
  const timer = useRef(null)
  const box = useRef(null)

  const [lat, lon] = coords
  const point = `${lon},${lat}`
  // цвет метки виджет Яндекса не меняет: при любом коде стиля она синяя
  const src = (z) => `https://yandex.ru/map-widget/v1/?ll=${point}&z=${z}&pt=${point},pm2rdm`
  const full = `https://yandex.ru/maps/?ll=${point}&z=${zoom}&pt=${point}`

  useEffect(() => {
    const el = box.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect() } },
      { rootMargin: '250px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!near) return
    // Заблокированный виджет всё равно вызывает onLoad у пустой рамки, поэтому
    // сначала проверяем сам запрос: не прошёл — значит карты не будет.
    let alive = true
    fetch(src(zoom), { mode: 'no-cors', cache: 'no-store' })
      .catch(() => { if (alive) setState('failed') })
    timer.current = window.setTimeout(() => setState((s) => (s === 'ready' ? s : 'failed')), 6000)
    return () => {
      alive = false
      window.clearTimeout(timer.current)
    }
  }, [near])

  useEffect(() => {
    if (!big) return
    const onKey = (e) => { if (e.key === 'Escape') setBig(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [big])

  const onLoad = () => {
    window.clearTimeout(timer.current)
    setState((s) => (s === 'failed' ? s : 'ready'))
  }

  return (
    <>
      <div className={`ymap ymap--${state} ${className}`} ref={box}>
        {/* схема на время загрузки и на случай, если виджет не открылся */}
        <div className="ymap__stub" aria-hidden="true">
          <div className="ymap__grid" />
          <span className="ymap__pin"><Icon name="pin" size={26} /></span>
        </div>

        {near && state !== 'failed' && (
          <iframe src={src(zoom)} title={`Карта: ${address}`} onLoad={onLoad} />
        )}

        <a className="ymap__hit" href={full} target="_blank" rel="noreferrer" aria-label="Открыть на Яндекс.Картах">
          <span className="ymap__hint">
            {state === 'failed' ? 'Посмотреть на Яндекс.Картах' : 'Открыть на Яндекс.Картах'} <Icon name="arrow" size={16} />
          </span>
        </a>

        <span className="ymap__addr"><Icon name="pin" size={15} /> {address}</span>

        {state !== 'failed' && (
          <button className="ymap__zoom" onClick={() => setBig(true)} aria-label="Развернуть карту">
            <Icon name="search" size={18} />
          </button>
        )}
      </div>

      {big && (
        <div className="ymap-full" onMouseDown={(e) => { if (e.target === e.currentTarget) setBig(false) }}>
          <div className="ymap-full__box" role="dialog" aria-modal="true" aria-label={`Карта: ${address}`}>
            <div className="ymap-full__head">
              <span><Icon name="pin" size={17} /> {address}</span>
              <div className="ymap-full__actions">
                <a href={full} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Яндекс.Карты</a>
                <button className="ymap-full__close" onClick={() => setBig(false)} aria-label="Закрыть">
                  <Icon name="close" size={20} />
                </button>
              </div>
            </div>
            <iframe src={src(zoom + 1)} title={`Карта крупнее: ${address}`} />
          </div>
        </div>
      )}
    </>
  )
}
