import { describe, expect, it } from 'vitest';
import { formatIban } from './format';

// Exemple de test unitaire front-end : à vous d'écrire les suivants !
describe('formatIban', () => {
  it('découpe un IBAN en blocs de 4 caractères', () => {
    expect(formatIban('FR7612345000011428616124159')).toBe('FR76 1234 5000 0114 2861 6124 159');
  });
});
