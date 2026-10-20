import { test, expect } from '@playwright/test'
import { readdirSync, statSync } from 'node:fs'
import { CATALOG, CATEGORIES, NEWS, PROMOS, SLIDES } from '../src/data/site.js'

/* Проверки основных сценариев. Запуск: npm test
   Тесты идут по собранной версии (npm run preview), как её видит посетитель.
   Количество слайдов, акций и товаров берём из данных: центр их меняет,
   и проверка не должна ломаться от каждой новой акции. */

test.describe('Главная', () => {
  test('открывается сверху и показывает первый экран', async ({ page }) => {
    await page.goto('/')
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBe(0)
    await expect(page.locator('.hslider h1')).toBeVisible()
  })

  test('слайдер листается вручную и сам не перелистывается', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.hslider__dots button')).toHaveCount(SLIDES.length)

    // сам по себе слайд не меняется: человек читает столько, сколько нужно
    const title = await page.locator('.hslider h1').textContent()
    await page.waitForTimeout(2500)
    await expect(page.locator('.hslider h1')).toHaveText(title)

    // стрелка и точки переключают
    await page.locator('.hslider__arrow--next').click()
    await expect(page.locator('.hslider h1')).not.toHaveText(title)
    await page.locator('.hslider__dots button').first().click()
    await expect(page.locator('.hslider h1')).toHaveText(title)
  })

  test('карточки под слайдером открывают запись', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.offer')).toHaveCount(3)
    await page.locator('.offer').first().click()
    await expect(page.locator('.modal .rform')).toBeVisible()
  })

  test('на главной первый экран, офферы, акции и подбор — в порядке центра', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.hslider h1')).toContainText('Проверим слух')
    await expect(page.locator('.hslider .btn')).toBeVisible()
    await expect(page.locator('.offer')).toHaveCount(3)
    await expect(page.locator('.promo')).toHaveCount(3)
    await expect(page.locator('.picker .chip').first()).toBeVisible()
    await expect(page.locator('.brands__logo')).toHaveCount(6)
    await expect(page.locator('.ftr__col')).toHaveCount(4)
    // акции идут раньше подбора — так попросил центр
    const promoTop = (await page.locator('.promo').first().boundingBox()).y
    const pickerTop = (await page.locator('.picker').boundingBox()).y
    expect(promoTop).toBeLessThan(pickerTop)
  })

  test('из шапки можно уйти в разделы', async ({ page }) => {
    await page.goto('/')
    await page.locator('.nav__link', { hasText: 'Акции' }).click()
    await expect(page).toHaveURL(/promo/)
    await expect(page.locator('h1')).toContainText('Акции')
  })

  test('кнопка «наверх» поднимает страницу до конца', async ({ page }) => {
    // без плавной прокрутки: проверяем результат, а не длительность анимации
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/about')
    // страница приезжает отдельным куском — дожидаемся её, иначе прокрутим пустую заглушку
    await expect.poll(() => page.evaluate(() => document.body.scrollHeight), { timeout: 10000 }).toBeGreaterThan(2000)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBeGreaterThan(600)
    const up = page.locator('.sticky-actions__up')
    await expect(up).toBeVisible()
    await up.click()
    // подъём плавный: даём ему договорить до конца
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY)), { timeout: 10000 }).toBe(0)
  })
})

test.describe('Каталог', () => {
  test('показывает шесть позиций с фотографиями', async ({ page }) => {
    await page.goto('/catalog')
    await expect(page.locator('.pcard')).toHaveCount(6)
    await expect(page.locator('.pcard .ph img')).toHaveCount(6)
  })

  test('страницы переключаются', async ({ page }) => {
    await page.goto('/catalog')
    await page.locator('.pager__btn', { hasText: '2' }).click()
    await expect(page).toHaveURL(/page=2/)
    await expect(page.locator('.pcard').first()).toBeVisible()
  })

  test('подбор по типу сужает выдачу', async ({ page }) => {
    await page.goto('/catalog')
    const all = await page.locator('.pcard').count()
    await page.locator('.filters__list label', { hasText: 'Услуги центра' }).click()
    await expect(page).toHaveURL(/cat=services/)
    expect(await page.locator('.pcard').count()).toBeLessThanOrEqual(all)
  })

  test('список к примерке пополняется', async ({ page }) => {
    await page.goto('/catalog')
    await page.locator('.pcard__cart').first().click()
    await expect(page.locator('.hdr__cart-badge')).toBeVisible()
    await page.locator('.hdr__cart').click()
    await expect(page.locator('.cart__row')).toHaveCount(1)
  })

  test('счётчики разделов совпадают с товарами в каталоге', async ({ page }) => {
    await page.goto('/catalog')
    const rows = await page.locator('.filters__group').first().locator('label').evaluateAll((labels) =>
      labels.map((l) => [l.querySelector('span')?.textContent.trim(), Number(l.querySelector('small')?.textContent)]))
    expect(rows.length).toBe(CATEGORIES.length)
    for (const [title, shown] of rows) {
      const cat = CATEGORIES.find((c) => c.title === title)
      expect(shown, title).toBe(CATALOG.filter((i) => i.category === cat.slug).length)
    }
  })
})

test.describe('Карточка товара', () => {
  test('гарантия берётся из характеристик, у аксессуаров условий приёма нет', async ({ page }) => {
    await page.goto('/catalog/resound-match-ma2t70')
    await expect(page.locator('.prod__meta')).toContainText('1 год')
    await expect(page.locator('.prod__sku')).not.toContainText('Артикул')
    await page.goto('/catalog/batareyki-power-one')
    await expect(page.locator('.prod__meta')).toHaveCount(0)
  })

  test('заявка с карточки помнит, какой аппарат выбран', async ({ page }) => {
    await page.route('**/items/zayavki', (route) => route.abort())
    await page.goto('/catalog/signia-motion-2px')
    await page.locator('.prod__actions .btn-primary').click()
    const modal = page.locator('.modal')
    await modal.locator('input[name="name"]').fill('Анна')
    await modal.locator('input[name="phone"]').type('9138217347')
    await modal.locator('input[type="checkbox"]').check()
    await modal.locator('button[type="submit"]').click()
    await expect(modal.locator('.rform__preview')).toContainText('Интересует: Signia Motion 2px')
  })
})

test.describe('Формы', () => {
  test('обратный звонок просит только имя и телефон', async ({ page }) => {
    await page.goto('/contacts')
    await page.getByRole('tab', { name: 'Обратный звонок' }).click()
    await expect(page.locator('.form-card .rform__field')).toHaveCount(2)
  })

  test('телефон набирается по маске', async ({ page }) => {
    await page.goto('/contacts')
    const phone = page.locator('.form-card input[name="phone"]')
    await phone.fill('')
    await phone.type('9138217347')
    await expect(phone).toHaveValue('+7 (913) 821-73-47')
  })

  test('зарубежный номер остаётся сплошным', async ({ page }) => {
    await page.goto('/contacts')
    const phone = page.locator('.form-card input[name="phone"]')
    await phone.type('+14155552468')
    await expect(phone).toHaveValue('+14155552468')
  })

  test('заявка уходит в панель, если она подключена', async ({ page }) => {
    await page.goto('/contacts')
    await page.getByRole('tab', { name: 'Обратный звонок' }).click()
    await page.locator('.form-card input[name="name"]').fill('Иван')
    await page.locator('.form-card input[name="phone"]').type('9138217347')
    await page.locator('.form-card input[type="checkbox"]').check()
    await page.locator('.form-card button[type="submit"]').click()
    await expect(page.locator('.rform--done')).toBeVisible()
    // с панелью — «принята», без панели — готовый текст для отправки вручную
    await expect(page.locator('.rform--done h3')).toHaveText(/Заявка (принята|готова)/)
  })

  test('без панели заявку можно отправить письмом или позвонить', async ({ page }) => {
    // обрываем связь с панелью — проверяем запасной путь
    await page.route('**/items/zayavki', (route) => route.abort())
    await page.goto('/contacts')
    await page.getByRole('tab', { name: 'Обратный звонок' }).click()
    await page.locator('.form-card input[name="name"]').fill('Пётр')
    await page.locator('.form-card input[name="phone"]').type('9138217347')
    await page.locator('.form-card input[type="checkbox"]').check()
    await page.locator('.form-card button[type="submit"]').click()
    await expect(page.locator('.rform__send a').first()).toHaveAttribute('href', /^tel:/)
    await expect(page.locator('.rform__send a').nth(1)).toHaveAttribute('href', /^mailto:/)
    await expect(page.locator('.rform__preview')).toContainText('Пётр')
  })

})

test.describe('Акции', () => {
  test('на главной три предложения и переход в раздел', async ({ page }) => {
    await page.goto('/')
    const cards = page.locator('.promo')
    await expect(cards).toHaveCount(3)
    await page.getByRole('link', { name: /Показать все акции/ }).click()
    await expect(page).toHaveURL(/promo/)
    await expect(page.locator('.promo')).toHaveCount(PROMOS.length)
  })

  test('у акции своя страница с текстом и формой записи', async ({ page }) => {
    await page.goto('/promo/elektronnyy-sertifikat')
    await expect(page.locator('h1')).toContainText('электронному сертификату')
    await expect(page.locator('.prose')).toContainText('ИПРА')
    await expect(page.locator('.prose__list li').first()).toBeVisible()
    await expect(page.locator('.form-card .rform')).toBeVisible()
  })

  test('у выезда на дом есть сноска с условиями', async ({ page }) => {
    await page.goto('/promo/vyezd-na-dom')
    await expect(page.locator('.prose__note')).toContainText('25 000')
  })
})

test.describe('Форма записи', () => {
  test('спрашивает ФИО, телефон и цель визита — без даты и времени', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.locator('.form-card .rform__field')).toHaveCount(4)
    await expect(page.locator('.form-card input[name="date"]')).toHaveCount(0)
    await expect(page.locator('.form-card input[name="time"]')).toHaveCount(0)
    await expect(page.locator('.form-card .rform__field span').first()).toHaveText('ФИО')

    // цели визита — список от центра, без цен и без примерки моделей
    const goals = await page.locator('.form-card select[name="subject"] option').allTextContents()
    expect(goals).toEqual([
      'Консультация и тест слуха',
      'Выезд на дом',
      'Покупка по электронному сертификату СФР',
      'Индивидуальные вкладыши',
      'Настройка аппарата',
      'Чистка и профилактика',
      'Другое',
    ])
  })
})

test.describe('Поиск и подбор', () => {
  test('поиск в шапке находит модель', async ({ page }) => {
    await page.goto('/')
    await page.locator('.hdr__search input').fill('phonak')
    await page.locator('.hdr__search input').press('Enter')
    await expect(page).toHaveURL(/q=phonak/)
    // адрес меняется раньше, чем перерисуется список, — ждём именно выдачу
    await expect.poll(async () => {
      const titles = await page.locator('.pcard h3').allTextContents()
      return titles.length > 0 && titles.every((t) => /phonak/i.test(t))
    }, { timeout: 10000 }).toBe(true)
  })

  /* У позиций без цены стоит «Цена по запросу» — в сравнении сумм они не участвуют */
  const sums = async (page) => (await page.locator('.pcard__price strong').allTextContents())
    .filter((t) => /\d/.test(t))
    .map((t) => Number(t.replace(/\D/g, '')))

  test('сортировка меняет порядок', async ({ page }) => {
    await page.goto('/catalog?sort=cheap')
    const prices = await sums(page)
    expect(prices.every((n, i) => i === 0 || prices[i - 1] <= n)).toBe(true)
  })

  test('фильтр по цене отсекает дешёвые модели и позиции без цены', async ({ page }) => {
    await page.goto('/catalog')
    const from = page.locator('.filters__price input').first()
    await from.fill('50000')
    await from.press('Enter')
    await expect(page).toHaveURL(/from=50000/)
    const prices = await sums(page)
    expect(prices.every((n) => n >= 50000)).toBe(true)
    // «Цена по запросу» в подбор по цене не попадает: иначе человек увидел бы её в «от 50 000»
    const asked = await page.locator('.pcard__price strong', { hasText: 'по запросу' }).count()
    expect(asked).toBe(0)
  })
})

test.describe('Информация', () => {
  test('листание появляется, когда материалов больше страницы', async ({ page }) => {
    await page.goto('/news')
    const first = await page.locator('.ncard h3, .nlead h2').allTextContents()
    const next = page.locator('.pager__btn', { hasText: '2' })
    // материалы центр добавляет сам: пока их на одну страницу, листалки нет
    if (!(await next.count())) {
      expect(first.length).toBeGreaterThan(0)
      return
    }
    await next.click()
    await expect(page).toHaveURL(/page=2/)
    const second = await page.locator('.ncard h3, .nlead h2').allTextContents()
    expect(second.length).toBeGreaterThan(0)
    expect(second[0]).not.toBe(first[0])
  })

  test('статья выводит все свои абзацы и ничего чужого', async ({ page }) => {
    const post = NEWS[0]
    await page.goto(`/news/${post.slug}`)
    await expect(page.locator('.prose p')).toHaveCount(post.body.length)
    await expect(page.locator('.prose')).not.toContainText('Профсоюзной')
  })
})

test.describe('Карта и адреса', () => {
  test('карта подключается с координатами центра', async ({ page }) => {
    await page.goto('/contacts')
    await page.locator('.ymap').scrollIntoViewIfNeeded()
    await expect(page.locator('.ymap iframe')).toHaveAttribute('src', /38\.975313/)
    await expect(page.locator('.ymap__hit')).toHaveAttribute('href', /yandex\.ru\/maps/)
  })

  test('карта разворачивается и закрывается', async ({ page }) => {
    await page.goto('/contacts')
    await page.locator('.ymap').scrollIntoViewIfNeeded()
    await page.locator('.ymap__zoom').click()
    await expect(page.locator('.ymap-full__box')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('.ymap-full')).toHaveCount(0)
  })
})

test.describe('Страницы и мета', () => {
  const pages = [
    ['/', 'Точка слуха'],
    ['/catalog', 'Слуховые аппараты'],
    ['/catalog/signia-motion-2px', 'Signia Motion 2px'],
    ['/promo', 'Акции'],
    ['/locations', 'Адреса центров'],
    ['/news', 'Новости'],
    ['/contacts', 'Контакты'],
    ['/about', 'О центре'],
    ['/privacy', 'Политика'],
  ]

  for (const [path, expected] of pages) {
    test(`${path} — свой заголовок и превью`, async ({ page }) => {
      await page.goto(path)
      await expect(page).toHaveTitle(new RegExp(expected))
      await expect(page.locator('h1')).toHaveCount(1)
      const og = await page.locator('meta[property="og:image"]').getAttribute('content')
      expect(og).toContain('og.png')
    })
  }

  test('адрес страницы в превью — этого сайта, а не прежнего', async ({ page }) => {
    await page.goto('/catalog/signia-motion-2px')
    const url = await page.locator('meta[property="og:url"]').getAttribute('content')
    expect(url).toContain('/catalog/signia-motion-2px')
    expect(url).not.toContain('froghoppingamongtulips')
  })

  test('несуществующий адрес показывает 404', async ({ page }) => {
    await page.goto('/takoy-stranicy-net')
    await expect(page.locator('.nf__code')).toBeVisible()
  })
})

test.describe('Кнопка «наверх»', () => {
  test('одна круглая кнопка внизу справа, без дублей записи', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1000 })
    await page.goto('/about')
    // в колонке остаётся ровно одна кнопка — «наверх»
    await expect(page.locator('.sticky-actions button')).toHaveCount(1)
    await page.evaluate(() => window.scrollTo(0, 3000))
    await expect(page.locator('.sticky-actions__up')).toHaveClass(/is-visible/)
  })
})

test.describe('Мобильная версия', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

  test('ничего не вылезает за экран', async ({ page }) => {
    for (const path of ['/', '/catalog', '/catalog/signia-motion-2px', '/contacts', '/news']) {
      await page.goto(path)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(overflow, `горизонтальная прокрутка на ${path}`).toBe(0)
    }
  })

  test('нижняя панель с телефоном и записью на месте', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.mbar__call')).toBeVisible()
    await expect(page.locator('.mbar__book')).toBeVisible()
  })

  test('меню короткое, разделы каталога под стрелкой', async ({ page }) => {
    await page.goto('/')
    await page.locator('.burger').tap()
    await expect(page.locator('.megamenu')).toBeHidden()
    await page.locator('.nav__more').tap()
    await expect(page.locator('.megamenu')).toBeVisible()
  })

  test('карточка каталога компактная', async ({ page }) => {
    await page.goto('/catalog')
    const h = await page.locator('.pcard').first().evaluate((el) => el.getBoundingClientRect().height)
    expect(h).toBeLessThan(220)
  })
})

test.describe('Доступность', () => {
  test('у картинок есть подписи, у полей — метки', async ({ page }) => {
    await page.goto('/catalog')
    const bad = await page.evaluate(() => ({
      img: [...document.querySelectorAll('img')].filter((i) => !i.getAttribute('alt')).length,
      fields: [...document.querySelectorAll('input, select, textarea')].filter((i) => !i.labels?.length && !i.getAttribute('aria-label')).length,
    }))
    expect(bad.img).toBe(0)
    expect(bad.fields).toBe(0)
  })

  test('есть ссылка «к содержимому» и обводка фокуса', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.skip')).toHaveCount(1)
    const outline = await page.evaluate(() => {
      const el = document.querySelector('.btn-primary')
      el.focus()
      return getComputedStyle(el).outlineWidth
    })
    expect(outline).not.toBe('0px')
  })
})

test.describe('Скорость и выдача', () => {
  test('страницы отдаются готовым HTML: робот видит текст без скриптов', async ({ browser }) => {
    // выключаем скрипты — остаётся то, что увидит поисковый робот и превью ссылки
    const ctx = await browser.newContext({ javaScriptEnabled: false })
    const page = await ctx.newPage()
    // со слешем на конце: так адрес папки со страницей выглядит на хостинге
    await page.goto('/catalog/signia-motion-2px/')
    await expect(page).toHaveTitle(/Signia Motion 2px/)
    await expect(page.locator('h1')).toContainText('Signia Motion 2px')
    await page.goto('/about/')
    await expect(page.locator('#main')).toContainText('тест слуха')
    // блоки ниже первого экрана должны быть видны, а не прозрачны
    await expect(page.locator('.adv__item').first()).toBeVisible()
    await ctx.close()
  })

  test('шрифт лежит в проекте: за ним не ходят к Google', async ({ page }) => {
    const outside = []
    page.on('request', (r) => {
      const host = new URL(r.url()).host
      // карта и панель — свои по договорённости, остальное чужое
      if (/google|gstatic|cdn|unpkg|jsdelivr|typekit/.test(host)) outside.push(host)
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(outside).toEqual([])
    // шрифт приезжает со своего сервера
    const fonts = await page.evaluate(() =>
      performance.getEntriesByType('resource').filter((r) => r.name.includes('montserrat')).map((r) => r.name))
    expect(fonts.length).toBeGreaterThan(0)
    expect(fonts.every((u) => u.includes('localhost'))).toBe(true)
  })

  test('страницы собраны отдельными кусками, а не одним файлом', async () => {
    const files = readdirSync('dist/assets').filter((f) => f.endsWith('.js'))
    // у каждой страницы свой файл: человек скачивает только то, что открыл
    expect(files.length).toBeGreaterThan(5)
    expect(files.some((f) => f.startsWith('Catalog-'))).toBe(true)
    const main = files.find((f) => f.startsWith('index-'))
    const weight = statSync(`dist/assets/${main}`).size
    expect(weight, 'вес основного файла').toBeLessThan(260 * 1024)
  })
})

test.describe('Появление блоков', () => {
  test('при прокрутке главной проявляются все блоки, пустых мест не остаётся', async ({ page }) => {
    await page.goto('/')
    for (let i = 0; i < 60; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(50) }
    await page.waitForTimeout(600)
    const hidden = await page.$$eval('.reveal', (els) =>
      els.filter((e) => !e.classList.contains('in')).map((e) => e.innerText.slice(0, 30)))
    expect(hidden).toEqual([])
  })
})

test.describe('Телефон: размер кнопок', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true })

  test('по кнопкам и ссылкам можно попасть пальцем', async ({ page }) => {
    for (const path of ['/', '/catalog', '/contacts']) {
      await page.goto(path)
      const small = await page.$$eval('a, button, select', (els) =>
        els.filter((el) => {
          const r = el.getBoundingClientRect()
          if (!r.width || getComputedStyle(el).visibility === 'hidden') return false
          // названия товаров — обычный текст в строке, их не считаем
          if (el.closest('.pcard__body h3') || el.closest('.crumbs') || el.closest('.rform__consent')) return false
          return r.height < 38
        }).map((el) => {
          const r = el.getBoundingClientRect()
          return `${el.tagName}.${(el.className.baseVal ?? el.className ?? '').toString().split(' ')[0]} ${Math.round(r.width)}x${Math.round(r.height)} «${(el.innerText || '').slice(0, 20)}»`
        }))
      expect(small, `мелкие кнопки на ${path}`).toEqual([])
    }
  })
})
