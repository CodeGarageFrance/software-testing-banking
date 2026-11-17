import { FastifyPluginAsync } from 'fastify';
import { bodyOf } from '../http/auth';
import { AuthService } from '../services/authService';

export function authRoutes(auth: AuthService): FastifyPluginAsync {
  return async (app) => {
    app.post('/signup', async (request, reply) => {
      const body = bodyOf(request);
      const result = await auth.signup({
        email: body.email,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
      });
      return reply.code(201).send(result);
    });

    app.post('/login', async (request) => {
      const body = bodyOf(request);
      return auth.login(body.email, body.password);
    });
  };
}
