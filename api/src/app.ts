import cors from '@fastify/cors';
import Fastify, { FastifyInstance } from 'fastify';
import { config } from './config';
import { AppServices, createServices } from './container';
import { registerErrorHandlers } from './http/errorHandler';
import { accountRoutes } from './routes/accounts';
import { authRoutes } from './routes/auth';
import { meRoutes } from './routes/me';
import { transferRoutes } from './routes/transfers';

export interface BuildAppOptions {
  /** Services à utiliser (par défaut : implémentations MySQL). Pratique pour injecter des doublures en test. */
  services?: AppServices;
  logger?: boolean;
}

export function buildApp(options: BuildAppOptions = {}): FastifyInstance {
  const services = options.services ?? createServices();
  const app = Fastify({ logger: options.logger ?? false });

  app.register(cors, { origin: config.corsOrigin });
  registerErrorHandlers(app);

  app.get('/api/health', async () => ({ status: 'ok' }));

  app.register(authRoutes(services.auth), { prefix: '/api/auth' });
  app.register(meRoutes(services.profile), { prefix: '/api/me' });
  app.register(accountRoutes(services.accounts), { prefix: '/api/accounts' });
  app.register(transferRoutes(services.transfers), { prefix: '/api/transfers' });

  return app;
}
