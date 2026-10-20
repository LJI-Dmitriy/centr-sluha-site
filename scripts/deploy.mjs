/* Сборка «как на публикации», чтобы посмотреть результат у себя: без панели,
   в подпапке с именем репозитория и с адресом опубликованного сайта в превью.
   Переменные задаются здесь, а не в строке команды, — так сборка идёт и на Windows. */
import { execSync } from 'node:child_process'

execSync('npm run build', {
  stdio: 'inherit',
  env: {
    ...process.env,
    VITE_PANEL_URL: '',
    BASE_PATH: '/centr-sluha-site/',
    VITE_SITE_URL: 'https://lji-dmitriy.github.io/centr-sluha-site',
  },
})
