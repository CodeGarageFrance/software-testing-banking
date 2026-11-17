import { afterAll, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/app';
import { closePool } from '../../src/db/pool';

// Exemple de test d'intégration (API Fastify + vraie base MySQL de test).
// Prérequis : docker compose --profile test up -d db-test
const app = buildApp();

afterAll(async () => {
  await app.close();
  await closePool();
});

describe('POST /api/auth/login', () => {
  it('connecte un utilisateur du jeu de données', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'alice@example.com', password: 'Password123' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().token).toEqual(expect.any(String));
    expect(res.json().user.email).toBe('alice@example.com');
  });
});
