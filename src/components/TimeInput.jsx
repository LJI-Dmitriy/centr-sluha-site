import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import Wheel from './Wheel'
import './TimeInput.css'

/* Выбор времени барабаном, как на телефоне: два столбца — часы и минуты.
   Оба крутятся по кругу: после 23 снова 00, после 59 снова 00.

   Часы вне приёма показаны бледным — записаться на них можно, но администратор
   при звонке предложит другое время, и человек об этом предупреждён. */

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))    // 00…23
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))  // 00…59
// часы приёма в будни; в субботу центр работает до 16:00 — это сказано в подсказке
const OPEN_FROM = 10
const OPEN_TO = 18
const START = '10'   // с чего открывается барабан, если время ещё не выбрали

export default function TimeInput({ name = 'time', required = false, id }) {
  const [open, setOpen] = useState(false)
  const [hour, setHour] = useState('')
  const [minute, setMinute] = useState('')
  const root = useRef(null)

  const value = hour && minute ? `${hour}:${minute}` : ''

  // клик мимо и Escape закрывают барабан
  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (!e.target.closest?.('.timepick')) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  /* выбрали часы — минуты сами встают на «00», и наоборот: время всегда полное */
  const pickHour = (h) => { setHour(h); if (!minute) setMinute(MINUTES[0]) }
  const pickMinute = (m) => { setMinute(m); if (!hour) setHour(START) }
  const confirm = () => {
    if (!hour) setHour(START)
    if (!minute) setMinute(MINUTES[0])
    setOpen(false)
  }

  const closed = (h) => Number(h) < OPEN_FROM || Number(h) >= OPEN_TO
  const outside = hour && closed(hour)

  return (
    <div className="timepick" ref={root}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        id={id}
        className={`timepick__field ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-required={required}
      >
        <span className={value ? '' : 'timepick__placeholder'}>{value || 'Выберите время'}</span>
        <Icon name="clock" size={18} />
      </button>

      {open && (
        <div className="timepick__drop">
          <div className="timepick__wheels">
            <span className="timepick__band" aria-hidden="true" />
            <Wheel loop values={HOURS} value={hour || START} onChange={pickHour} isOff={closed} label="Часы" />
            <span className="timepick__colon">:</span>
            <Wheel loop values={MINUTES} value={minute || MINUTES[0]} onChange={pickMinute} label="Минуты" />
          </div>
          <div className="timepick__foot">
            <span className={outside ? 'timepick__warn' : ''}>
              {outside ? 'центр в это время закрыт' : 'приём с 10:00 до 18:00, в субботу до 16:00'}
            </span>
            <button type="button" className="btn btn-primary btn-sm" onClick={confirm}>
              Готово
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
