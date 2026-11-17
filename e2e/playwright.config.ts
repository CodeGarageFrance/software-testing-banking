import { defineConfig, devices } from '@playwright/test';

// L'application doit tourner avant de lancer les tests : `docker compose up -d --build` à la racine.
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:8080',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
