import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import Icon from './Icon'
import RequestForm, { FORM_VARIANTS } from './RequestForm'
import './RequestModal.css'

const Ctx = createContext(() => {})

/* openForm('call' | 'visit' | 'ask', тема?) — открывает модальную форму из любого места.
   Тема — цель визита из списка или название товара/акции, откуда пришёл человек */
export const useRequestForm = () => useContext(Ctx)

export function RequestProvider({ children }) {
  const [state, setState] = useState(null)

  const open = useCallback((variant = 'call', subject) => setState({ variant, subject }), [])
  const close = useCallback(() => setState(null), [])

  useEffect(() => {
    if (!state) return
    const onKey = (e) => { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [state, close])

  const v = state ? FORM_VARIANTS[state.variant] : null

  return (
    <Ctx.Provider value={open}>
      {children}
      {state && (
        <div className="modal" onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}>
          <div className="modal__box" role="dialog" aria-modal="true" aria-label={v.title}>
            <button className="modal__close" onClick={close} aria-label="Закрыть"><Icon name="close" size={20} /></button>
            <div className="form-card__head">
              <span className="eyebrow">Заявка</span>
              <h3 style={{ marginTop: 12 }}>{v.title}</h3>
              <p>{v.text}</p>
            </div>
            <RequestForm variant={state.variant} subject={state.subject} />
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}
