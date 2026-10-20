import { defineConfig } from '@playwright/test'

/* Тесты гоняем по собранной версии на локальном сервере предпросмотра. */
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 7000 },
  fullyParallel: true,
  reporter: process.env.CI ? 'list' : [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    /* Собираем без адреса панели: тесты проверяют содержимое самого сайта,
       а не то, что сейчас лежит в панели у владельца. Переменная задаётся через
       env, а не в строке команды, — так тесты запускаются и на Windows. */
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    env: { VITE_PANEL_URL: '' },
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
