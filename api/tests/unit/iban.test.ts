import { describe, expect, it } from 'vitest';
import { generateIban, isValidIban } from '../../src/domain/iban';

// Exemple de test unitaire : à vous d'écrire les suivants !
describe('iban', () => {
  it('accepte un IBAN français valide (avec espaces)', () => {
    expect(isValidIban('FR76 3000 6000 0112 3456 7890 189')).toBe(true);
  });

  it('génère des IBAN valides', () => {
    expect(isValidIban(generateIban())).toBe(true);
  });
});
