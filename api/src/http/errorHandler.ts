import { FastifyError, FastifyInstance } from 'fastify';
import { HttpError } from '../errors';

export function registerErrorHandlers(app: FastifyInstance): void {
  app.setNotFoundHandler((_request, reply) => {
    reply.code(404).send({ error: 'Ressource introuvable' });
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof HttpError) {
      return reply.code(error.status).send({ error: error.message });
    }
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      const message = error instanceof SyntaxError || error.code?.includes('JSON') ? 'JSON invalide' : error.message;
      return reply.code(error.statusCode).send({ error: message });
    }
    request.log.error(error);
    return reply.code(500).send({ error: 'Erreur interne du serveur' });
  });
}
