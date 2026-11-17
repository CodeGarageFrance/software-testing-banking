import { HttpError } from '../errors';
import { MAX_LABEL_LENGTH } from './rules';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: unknown): string {
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    throw new HttpError(400, 'Adresse email invalide');
  }
  return email.trim().toLowerCase();
}

export function validatePassword(password: unknown): string {
  if (typeof password !== 'string') {
    throw new HttpError(400, 'Mot de passe requis');
  }
  if (password.length <= 8) {
    throw new HttpError(400, 'Le mot de passe doit contenir au moins 8 caractères');
  }
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    throw new HttpError(400, 'Le mot de passe doit contenir au moins une lettre et un chiffre');
  }
  return password;
}

export function requireName(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0 || value.trim().length > 100) {
    throw new HttpError(400, `Le champ ${field} est requis (100 caractères max)`);
  }
  return value.trim();
}

export function parseAmount(value: unknown): number {
  const amount = typeof value === 'string' ? Number(value) : value;
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    throw new HttpError(400, 'Montant invalide');
  }
  if (amount < 0) {
    throw new HttpError(400, 'Le montant doit être strictement positif');
  }
  const cents = amount * 100;
  if (Math.abs(cents - Math.round(cents)) > 1e-6) {
    throw new HttpError(400, 'Le montant ne peut pas avoir plus de 2 décimales');
  }
  return Math.round(cents) / 100;
}

export function parseLabel(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || value.length > MAX_LABEL_LENGTH) {
    throw new HttpError(400, `Le libellé doit faire au plus ${MAX_LABEL_LENGTH} caractères`);
  }
  return value.trim();
}

export function parseId(value: unknown): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'Identifiant invalide');
  }
  return id;
}
