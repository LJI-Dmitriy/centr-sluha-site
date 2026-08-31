import { useState } from 'react'
import Icon from './Icon'
import Ph from './Ph'
import { useRequestForm } from './RequestModal'
import { SLIDES } from '../data/site'
import './HeroSlider.css'

/* Первый экран: слайдер с предложениями центра.
   Слайды листаются вручную — сами не перелистываются. */
export default function HeroSlider() {
  const [i, setI] = useState(0)
  const openForm = useRequestForm()

  const go = (d) => setI((v) => (v + d + SLIDES.length) % SLIDES.length)
  const s = SLIDES[i]

  return (
    <section className="hslider">
      <div className="container">
        <div className="hslider__stage">
        <div className="hslider__box">
          <div className="hslider__copy" key={i}>
            <span className="eyebrow eyebrow--light">{s.eyebrow}</span>
            <h1>{s.title}</h1>
            {s.text && <p>{s.text}</p>}
            <div className="hslider__cta">
              <button className="btn btn-light" onClick={() => openForm('visit')}>{s.cta} <Icon name="arrow" size={18} /></button>
              <span className="hslider__note">{s.note}</span>
            </div>
          </div>

          <div className="hslider__media"><Ph h="100%" className="hslider__ph" src={s.cover} alt={s.title} fit={s.fit || 'cover'} onDark /></div>

          <div className="hslider__dots">
            {SLIDES.map((_, n) => (
              <button key={n} className={n === i ? 'is-active' : ''} onClick={() => setI(n)} aria-label={`Слайд ${n + 1}`} />
            ))}
          </div>
        </div>

          <button className="hslider__arrow hslider__arrow--prev" onClick={() => go(-1)} aria-label="Предыдущий слайд"><Icon name="arrowLeft" size={20} /></button>
          <button className="hslider__arrow hslider__arrow--next" onClick={() => go(1)} aria-label="Следующий слайд"><Icon name="arrow" size={20} /></button>
        </div>
      </div>
    </section>
  )
}
