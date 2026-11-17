import { expect, test } from '@playwright/test';

// Exemple de test end-to-end : à vous d'écrire les suivants !
test('un client existant peut se connecter et voir ses comptes', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('alice@example.com');
  await page.getByLabel('Mot de passe').fill('Password123');
  await page.getByRole('button', { name: 'Se connecter' }).click();

  await expect(page.getByRole('heading', { name: /Bonjour Alice/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mes comptes' })).toBeVisible();
});
