import { FastifyPluginAsync } from 'fastify';
import { toAccountDto } from '../domain/models';
import { parseId } from '../domain/validation';
import { bodyOf, currentUserId, requireAuth } from '../http/auth';
import { AccountService, TransactionQuery } from '../services/accountService';

interface IdParams {
  id: string;
}

export function accountRoutes(accounts: AccountService): FastifyPluginAsync {
  return async (app) => {
    app.addHook('preHandler', requireAuth);

    app.get('/', async (request) => {
      const list = await accounts.list(currentUserId(request));
      return list.map(toAccountDto);
    });

    app.post('/', async (request, reply) => {
      const body = bodyOf(request);
      const account = await accounts.open(currentUserId(request), body.type, body.name);
      return reply.code(201).send(toAccountDto(account));
    });

    app.get<{ Params: IdParams }>('/:id', async (request) => {
      const { projectedInterest12Months, ...account } = await accounts.get(
        parseId(request.params.id),
        currentUserId(request),
      );
      return { ...toAccountDto(account), projectedInterest12Months };
    });

    app.delete<{ Params: IdParams }>('/:id', async (request) => {
      const account = await accounts.close(parseId(request.params.id), currentUserId(request));
      return toAccountDto(account);
    });

    app.post<{ Params: IdParams }>('/:id/deposit', async (request, reply) => {
      const body = bodyOf(request);
      const account = await accounts.deposit(
        parseId(request.params.id),
        currentUserId(request),
        body.amount,
        body.label,
      );
      return reply.code(201).send(toAccountDto(account));
    });

    app.post<{ Params: IdParams }>('/:id/withdraw', async (request, reply) => {
      const body = bodyOf(request);
      const account = await accounts.withdraw(
        parseId(request.params.id),
        currentUserId(request),
        body.amount,
        body.label,
      );
      return reply.code(201).send(toAccountDto(account));
    });

    app.get<{ Params: IdParams; Querystring: TransactionQuery }>('/:id/transactions', async (request) =>
      accounts.listTransactions(parseId(request.params.id), request.query),
    );

    app.get<{ Params: IdParams }>('/:id/summary', async (request) =>
      accounts.monthlySummary(parseId(request.params.id), currentUserId(request)),
    );
  };
}
