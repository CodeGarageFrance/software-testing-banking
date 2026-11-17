import { FastifyPluginAsync } from 'fastify';
import { currentUserId, requireAuth } from '../http/auth';
import { ProfileService } from '../services/profileService';

export function meRoutes(profile: ProfileService): FastifyPluginAsync {
  return async (app) => {
    app.addHook('preHandler', requireAuth);

    app.get('/', async (request) => profile.getProfile(currentUserId(request)));

    app.delete('/', async (request, reply) => {
      await profile.deleteProfile(currentUserId(request));
      return reply.code(204).send();
    });
  };
}
