import { defineConfig } from 'vitest/config';

// Les tests d'intégration utilisent la base de test (service docker "db-test", port 3307).
// Lancer d'abord : docker compose --profile test up -d db-test
export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    environment: 'node',
    fileParallelism: false,
    testTimeout: 15000,
    env: {
      DB_HOST: process.env.DB_HOST ?? '127.0.0.1',
      DB_PORT: process.env.DB_PORT ?? '3307',
      DB_USER: process.env.DB_USER ?? 'bank',
      DB_PASSWORD: process.env.DB_PASSWORD ?? 'bank',
      DB_NAME: process.env.DB_NAME ?? 'bank',
      JWT_SECRET: 'test-secret',
    },
  },
});
