import { FastifyPluginAsync } from 'fastify';
import { bodyOf, currentUserId, requireAuth } from '../http/auth';
import { TransferService } from '../services/transferService';

export function transferRoutes(transfers: TransferService): FastifyPluginAsync {
  return async (app) => {
    app.addHook('preHandler', requireAuth);

    app.post('/', async (request, reply) => {
      const body = bodyOf(request);
      const result = await transfers.transfer(currentUserId(request), {
        fromAccountId: body.fromAccountId,
        toIban: body.toIban,
        amount: body.amount,
        label: body.label,
      });
      return reply.code(201).send(result);
    });
  };
}
