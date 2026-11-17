import { FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { HttpError } from '../errors';

declare module 'fastify' {
  interface FastifyRequest {
    userId?: number;
  }
}

export function signToken(userId: number): string {
  return jwt.sign({ sub: String(userId) }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

/** Hook `preHandler` : vérifie le token JWT et renseigne `request.userId`. */
export async function requireAuth(request: FastifyRequest): Promise<void> {
  const header = request.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new HttpError(401, 'Authentification requise');
  }
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as jwt.JwtPayload;
    request.userId = Number(payload.sub);
  } catch {
    throw new HttpError(401, 'Session invalide ou expirée');
  }
}

export function currentUserId(request: FastifyRequest): number {
  if (request.userId === undefined) {
    throw new Error('Le hook requireAuth est manquant sur cette route');
  }
  return request.userId;
}

export function bodyOf(request: FastifyRequest): Record<string, unknown> {
  return (request.body ?? {}) as Record<string, unknown>;
}
